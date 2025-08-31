import type { APIRoute } from "astro";
import { recordQuestionResponse, startResponseSession } from "@/lib/detailedResponseTracking";
import { randomUUID } from "node:crypto";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { 
      questionId, 
      questionText, 
      category, 
      axis, 
      responseValue, 
      responseTimeMs,
      surveyResponseId,
      isFirstQuestion,
      deviceType,
      browserInfo 
    } = data;

    // Validate required fields
    if (!questionId || !questionText || !responseValue || !surveyResponseId) {
      return new Response(JSON.stringify({ 
        error: "Missing required fields" 
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // If this is the first question, start a response session
    if (isFirstQuestion) {
      await startResponseSession(
        surveyResponseId,
        30, // Total questions (adjust based on your survey)
        deviceType,
        browserInfo
      );
    }

    // Record the individual question response
    await recordQuestionResponse(surveyResponseId, {
      questionId,
      questionText,
      category,
      axis: axis as "X" | "Y",
      responseValue: Number(responseValue),
      responseTimeMs: responseTimeMs ? Number(responseTimeMs) : undefined,
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: "Response recorded successfully" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error recording detailed response:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error" 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ 
    message: "Use POST to record question responses" 
  }), {
    status: 405,
    headers: { "Content-Type": "application/json" }
  });
};
