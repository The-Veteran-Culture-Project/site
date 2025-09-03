import type { APIRoute } from "astro";
import { db, SurveyResponses, ResponseAnalytics, QuestionResponse, Question } from "astro:db";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { eq } from "astro:db";

// Schema validation for the survey submission
const surveySubmissionSchema = z.object({
  // Contact information
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  subscribe: z.boolean().optional().default(false),
  story_opt_in: z.boolean().optional().default(false),
  
  // Survey scores - allow any number type including negative
  military_score: z.coerce.number(),
  civilian_score: z.coerce.number(),
  
  // Strategy (determined from scores)
  strategy: z.string(),
  
  // Optional response tracking session ID
  responseSessionId: z.string().optional().nullable(),
  
  // Individual question responses for drill-down analytics
  questionResponses: z.record(z.object({
    axis: z.string(),
    offset: z.number(),
    question: z.string()
  })).optional(),
  
  // Demographics information (from the demographics form)
  demographics: z.object({
    age_range: z.string().optional(),
    gender: z.string().optional(),
    gender_self_described: z.string().optional(),
    race: z.string().optional(), // Changed from array to string
    status_affiliation: z.string().optional(), // Added new field
    years_since_separation: z.string().optional(),
    branch: z.string().optional(),
    mos: z.string().optional(),
    combat: z.string().optional()
  }).optional(),
  
  // VA Benefits information (from the benefits form)
  va_benefits: z.object({
    has_applied: z.string().optional(),
    benefits_used: z.array(z.string()).optional(),
    has_disability_rating: z.string().optional(),
    disability_rating: z.string().optional(),
    comfort_delay: z.string().optional(),
    decision_time: z.string().optional(),
    va_healthcare: z.string().optional(),
    va_experience: z.string().optional(),
    // New fields
    support_choice: z.string().optional(),
    first_year_help: z.array(z.string()).optional(),
    cash_benefits_use: z.string().optional()
  }).optional()
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse the request body
    const surveyData = await request.json();
    
    console.log("🚨 Survey submission data received:", JSON.stringify(surveyData, null, 2));
    console.log("🔍 Data type check:");
    console.log("  first_name:", surveyData.first_name, "type:", typeof surveyData.first_name);
    console.log("  last_name:", surveyData.last_name, "type:", typeof surveyData.last_name);
    console.log("  email:", surveyData.email, "type:", typeof surveyData.email);
    console.log("  military_score:", surveyData.military_score, "type:", typeof surveyData.military_score);
    console.log("  civilian_score:", surveyData.civilian_score, "type:", typeof surveyData.civilian_score);
    console.log("  strategy:", surveyData.strategy, "type:", typeof surveyData.strategy);
    
    // Validate the data against the schema
    const validationResult = surveySubmissionSchema.safeParse(surveyData);
    
    if (!validationResult.success) {
      console.log("🚨 Validation failed:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Invalid survey data", 
          errors: validationResult.error.errors 
        }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }

    const validatedData = validationResult.data;
    
    // Convert boolean values correctly for SQLite
    // Super explicit conversion checking all possible truthy values
    const subscribeStr = String(validatedData.subscribe).toLowerCase();
    const storyOptInStr = String(validatedData.story_opt_in).toLowerCase();
    
    // Use string comparison to avoid type issues
    const isSubscribe = validatedData.subscribe === true || 
                       subscribeStr === "true" || 
                       subscribeStr === "1";
                       
    const isStoryOptIn = validatedData.story_opt_in === true || 
                        storyOptInStr === "true" || 
                        storyOptInStr === "1";
    
    console.log("API: Saving subscribe:", isSubscribe, "story_opt_in:", isStoryOptIn);
    console.log("Raw subscribe value:", validatedData.subscribe, "Type:", typeof validatedData.subscribe);
    console.log("Raw story_opt_in value:", validatedData.story_opt_in, "Type:", typeof validatedData.story_opt_in);
    console.log("String versions:", subscribeStr, storyOptInStr);
    
    // Generate survey response ID
    const surveyResponseId = randomUUID();
    
    // Save the survey response to the database
    const response = await db.insert(SurveyResponses).values({
      id: surveyResponseId,
      created_at: new Date(),
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      email: validatedData.email,
      subscribe: false, // Always false since we handle marketing signup separately
      story_opt_in: isStoryOptIn,
      military_score: validatedData.military_score,
      civilian_score: validatedData.civilian_score,
      strategy: validatedData.strategy,
      demographics: validatedData.demographics || {},
      va_benefits: validatedData.va_benefits || {}
    });

    // Save individual question responses for drill-down analytics
    if (validatedData.questionResponses) {
      console.log("Saving individual question responses:", Object.keys(validatedData.questionResponses).length, "questions");
      
      const questionResponsePromises = Object.entries(validatedData.questionResponses).map(async ([questionText, response]) => {
        // Look up the question category from the Question table
        const questionData = await db.select({
          category: Question.category
        }).from(Question)
          .where(eq(Question.text, questionText))
          .limit(1)
          .get();
        
        const category = questionData?.category || "Unknown";
        
        return db.insert(QuestionResponse).values({
          id: randomUUID(),
          survey_response_id: surveyResponseId,
          question_text: questionText,
          question_category: category,
          question_axis: response.axis,
          response_value: response.offset,
          response_text: response.offset.toString(),
          answered_at: new Date(),
          response_time_ms: null
        });
      });
      
      try {
        await Promise.all(questionResponsePromises);
        console.log("Successfully saved", questionResponsePromises.length, "individual question responses");
      } catch (error) {
        console.warn("Failed to save some individual question responses:", error);
        // Don't fail the overall survey submission if individual responses fail
      }
    }

    // If there's a response session ID, update the analytics to link it to this survey
    if (validatedData.responseSessionId && validatedData.responseSessionId !== null) {
      try {
        // First, try to find existing ResponseAnalytics record by survey_response_id
        const existingAnalytics = await db.select().from(ResponseAnalytics)
          .where(eq(ResponseAnalytics.survey_response_id, validatedData.responseSessionId))
          .get();
        
        if (existingAnalytics) {
          // Update existing analytics record
          await db.update(ResponseAnalytics)
            .set({ 
              survey_response_id: surveyResponseId,
              completed_at: new Date(),
              completion_rate: 100
            })
            .where(eq(ResponseAnalytics.survey_response_id, validatedData.responseSessionId));
          
          console.log("Updated existing response analytics:", validatedData.responseSessionId, "->", surveyResponseId);
        } else {
          // Create new analytics record if none exists
          await db.insert(ResponseAnalytics).values({
            id: crypto.randomUUID(),
            survey_response_id: surveyResponseId,
            total_questions: 24, // Assuming 24 questions in the survey
            questions_answered: 24,
            completion_rate: 100,
            started_at: new Date(),
            completed_at: new Date(),
            device_type: "unknown",
            browser_info: "unknown"
          });
          
          console.log("Created new response analytics for survey:", surveyResponseId);
        }
      } catch (error) {
        console.warn("Failed to link response tracking session:", error);
        // Don't fail the survey submission if analytics linking fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Survey submitted successfully"
      }),
      { 
        status: 201, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error submitting survey:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Server error while submitting survey",
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
};
