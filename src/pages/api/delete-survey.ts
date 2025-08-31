import type { APIRoute } from "astro";
import { db, SurveyResponses, QuestionResponse, ResponseAnalytics } from "astro:db";
import { eq } from "astro:db";
import { lucia } from "@/lib/auth";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Verify admin authentication
    const sessionId = cookies.get(lucia.sessionCookieName)?.value;
    if (!sessionId) {
      return new Response(
        JSON.stringify({ success: false, message: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate session
    try {
      const session = await lucia.validateSession(sessionId);
      if (!session.user) {
        return new Response(
          JSON.stringify({ success: false, message: "Invalid session" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid session" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get survey response ID from the request body
    const { id } = await request.json();
    
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: "Survey response ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Delete related records first to avoid foreign key constraint violations
    console.log(`Deleting related records for survey response ID: ${id}`);
    
    // Delete question responses
    const questionResponsesResult = await db
      .delete(QuestionResponse)
      .where(eq(QuestionResponse.survey_response_id, id))
      .run();
    
    console.log(`Deleted ${questionResponsesResult.rowsAffected} question responses`);
    
    // Delete response analytics
    const analyticsResult = await db
      .delete(ResponseAnalytics)
      .where(eq(ResponseAnalytics.survey_response_id, id))
      .run();
    
    console.log(`Deleted ${analyticsResult.rowsAffected} analytics records`);
    
    // Now delete the survey response from the database
    const result = await db
      .delete(SurveyResponses)
      .where(eq(SurveyResponses.id, id))
      .run();
    
    console.log(`Deleted survey response, rows affected: ${result.rowsAffected}`);

    if (result.rowsAffected === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "Survey response not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Survey response deleted successfully"
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error deleting survey response:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Failed to delete survey response",
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
};
