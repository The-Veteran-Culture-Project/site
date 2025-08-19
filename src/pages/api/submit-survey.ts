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
    
    // Save the survey response to the database
    const response = await db.insert(SurveyResponses).values({
      id: randomUUID(),
      created_at: new Date(),
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      email: validatedData.email,
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
