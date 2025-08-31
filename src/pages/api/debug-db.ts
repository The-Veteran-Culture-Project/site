import type { APIRoute } from 'astro';
import { db, SurveyResponses, ResponseAnalytics } from 'astro:db';
import { desc } from 'astro:db';

export const GET: APIRoute = async () => {
  try {
    // Get recent survey responses
    const responses = await db.select({
      id: SurveyResponses.id,
      first_name: SurveyResponses.first_name,
      last_name: SurveyResponses.last_name,
      email: SurveyResponses.email,
      created_at: SurveyResponses.created_at,
      military_score: SurveyResponses.military_score,
      civilian_score: SurveyResponses.civilian_score
    })
    .from(SurveyResponses)
    .orderBy(desc(SurveyResponses.created_at))
    .limit(10);

    // Get analytics
    const analytics = await db.select()
      .from(ResponseAnalytics)
      .orderBy(desc(ResponseAnalytics.started_at))
      .limit(5);

    return new Response(JSON.stringify({ 
      success: true,
      responses: responses,
      analytics: analytics,
      summary: {
        totalResponses: responses.length,
        totalAnalytics: analytics.length
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
