import type { APIRoute } from "astro";
import { db, SurveyResponses } from "astro:db";
import { randomUUID } from "node:crypto";
import { z } from "zod";

// Schema validation for the survey submission
const surveySubmissionSchema = z.object({
  // Contact information
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  subscribe: z.boolean().optional().default(false),
  story_opt_in: z.boolean().optional().default(false),
  
  // Survey scores
  military_score: z.number(),
  civilian_score: z.number(),
  
  // Strategy (determined from scores)
  strategy: z.string(),
  
  // Demographics information (from the demographics form)
  demographics: z.object({
    age_range: z.string().optional(),
    gender: z.string().optional(),
    gender_self_described: z.string().optional(),
    race: z.array(z.string()).optional(),
    military_status: z.string().optional(),
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
    va_experience: z.string().optional()
  }).optional()
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse the request body
    const surveyData = await request.json();
    
    // Validate the data against the schema
    const validationResult = surveySubmissionSchema.safeParse(surveyData);
    
    if (!validationResult.success) {
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
    
    // Save the survey response to the database
    const response = await db.insert(SurveyResponses).values({
      id: randomUUID(),
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
