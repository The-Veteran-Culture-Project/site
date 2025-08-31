import { db, QuestionResponse, ResponseAnalytics, QuestionStats, SurveyResponses, Question } from "astro:db";
import { eq, sql, and, desc } from "astro:db";
import { randomUUID } from "node:crypto";

export interface DetailedQuestionResponse {
  questionId: string;
  questionText: string;
  category: string;
  axis: "X" | "Y";
  responseValue: number;
  responseTimeMs?: number;
}

export interface ResponseSession {
  surveyResponseId: string;
  deviceType?: string;
  browserInfo?: string;
  startedAt: Date;
}

/**
 * Start a new detailed response tracking session
 */
export async function startResponseSession(
  surveyResponseId: string, 
  totalQuestions: number,
  deviceType?: string,
  browserInfo?: string
): Promise<string> {
  const sessionId = randomUUID();
  
  await db.insert(ResponseAnalytics).values({
    id: sessionId,
    survey_response_id: surveyResponseId,
    total_questions: totalQuestions,
    questions_answered: 0,
    completion_rate: 0,
    started_at: new Date(),
    device_type: deviceType,
    browser_info: browserInfo,
  });
  
  return sessionId;
}

/**
 * Record a single question response with detailed tracking
 */
export async function recordQuestionResponse(
  surveyResponseId: string,
  questionResponse: DetailedQuestionResponse
): Promise<void> {
  const responseId = randomUUID();
  
  // Insert the detailed question response
  await db.insert(QuestionResponse).values({
    id: responseId,
    survey_response_id: surveyResponseId,
    question_id: questionResponse.questionId,
    question_text: questionResponse.questionText,
    question_category: questionResponse.category,
    question_axis: questionResponse.axis,
    response_value: questionResponse.responseValue,
    response_time_ms: questionResponse.responseTimeMs,
    answered_at: new Date(),
  });
  
  // Update response analytics
  await updateResponseAnalytics(surveyResponseId);
  
  // Update question statistics
  await updateQuestionStats(questionResponse.questionId, questionResponse.responseValue, questionResponse.responseTimeMs);
}

/**
 * Update response analytics for a survey
 */
async function updateResponseAnalytics(surveyResponseId: string): Promise<void> {
  // Get current analytics
  const analytics = await db.select().from(ResponseAnalytics)
    .where(eq(ResponseAnalytics.survey_response_id, surveyResponseId))
    .get();
  
  if (!analytics) return;
  
  // Count answered questions
  const answeredQuestions = await db.select({ count: sql<number>`count(*)` })
    .from(QuestionResponse)
    .where(eq(QuestionResponse.survey_response_id, surveyResponseId))
    .get();
  
  const questionsAnswered = answeredQuestions?.count || 0;
  const completionRate = (questionsAnswered / analytics.total_questions) * 100;
  
  // Calculate average response time
  const responseTimeResult = await db.select({ 
    total: sql<number>`sum(response_time_ms)`,
    count: sql<number>`count(response_time_ms)`
  })
    .from(QuestionResponse)
    .where(and(
      eq(QuestionResponse.survey_response_id, surveyResponseId),
      sql`response_time_ms IS NOT NULL`
    ))
    .get();
  
  const totalResponseTime = responseTimeResult?.total || 0;
  const responseCount = responseTimeResult?.count || 0;
  const averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount : null;
  
  // Update analytics
  await db.update(ResponseAnalytics)
    .set({
      questions_answered: questionsAnswered,
      completion_rate: completionRate,
      total_response_time_ms: totalResponseTime,
      average_response_time_ms: averageResponseTime,
      completed_at: completionRate >= 100 ? new Date() : null,
    })
    .where(eq(ResponseAnalytics.id, analytics.id));
}

/**
 * Update question-level statistics
 */
async function updateQuestionStats(
  questionId: string, 
  responseValue: number, 
  responseTimeMs?: number
): Promise<void> {
  // Get or create question stats
  let stats = await db.select().from(QuestionStats)
    .where(eq(QuestionStats.question_id, questionId))
    .get();
  
  if (!stats) {
    // Create new stats record
    const statsId = randomUUID();
    await db.insert(QuestionStats).values({
      id: statsId,
      question_id: questionId,
      total_responses: 1,
      average_response: responseValue,
      response_distribution: { [responseValue]: 1 },
      average_response_time_ms: responseTimeMs,
      last_updated: new Date(),
    });
    return;
  }
  
  // Update existing stats
  const newTotal = stats.total_responses + 1;
  
  // Calculate new average response
  const currentTotal = (stats.average_response || 0) * stats.total_responses;
  const newAverage = (currentTotal + responseValue) / newTotal;
  
  // Update response distribution
  const distribution = stats.response_distribution as Record<string, number> || {};
  distribution[responseValue.toString()] = (distribution[responseValue.toString()] || 0) + 1;
  
  // Calculate new average response time
  let newAverageResponseTime = stats.average_response_time_ms;
  if (responseTimeMs && stats.average_response_time_ms) {
    const currentTimeTotal = stats.average_response_time_ms * stats.total_responses;
    newAverageResponseTime = (currentTimeTotal + responseTimeMs) / newTotal;
  } else if (responseTimeMs) {
    newAverageResponseTime = responseTimeMs;
  }
  
  await db.update(QuestionStats)
    .set({
      total_responses: newTotal,
      average_response: newAverage,
      response_distribution: distribution,
      average_response_time_ms: newAverageResponseTime,
      last_updated: new Date(),
    })
    .where(eq(QuestionStats.id, stats.id));
}

/**
 * Mark response session as completed
 */
export async function completeResponseSession(surveyResponseId: string): Promise<void> {
  await db.update(ResponseAnalytics)
    .set({
      completed_at: new Date(),
    })
    .where(eq(ResponseAnalytics.survey_response_id, surveyResponseId));
}

/**
 * Mark where user dropped off
 */
export async function markDropoffPoint(surveyResponseId: string, questionId: string): Promise<void> {
  await db.update(ResponseAnalytics)
    .set({
      dropped_at_question: questionId,
    })
    .where(eq(ResponseAnalytics.survey_response_id, surveyResponseId));
}

/**
 * Get detailed analytics for a specific survey response
 */
export async function getDetailedSurveyAnalytics(surveyResponseId: string) {
  const analytics = await db.select().from(ResponseAnalytics)
    .where(eq(ResponseAnalytics.survey_response_id, surveyResponseId))
    .get();
  
  const questionResponses = await db.select().from(QuestionResponse)
    .where(eq(QuestionResponse.survey_response_id, surveyResponseId))
    .orderBy(QuestionResponse.answered_at);
  
  return {
    analytics,
    questionResponses,
  };
}

/**
 * Get question performance statistics
 */
export async function getQuestionPerformanceStats() {
  return await db.select({
    questionId: QuestionStats.question_id,
    totalResponses: QuestionStats.total_responses,
    averageResponse: QuestionStats.average_response,
    averageResponseTime: QuestionStats.average_response_time_ms,
    responseDistribution: QuestionStats.response_distribution,
    skipRate: QuestionStats.skip_rate,
  }).from(QuestionStats)
    .orderBy(desc(QuestionStats.total_responses));
}

/**
 * Get survey completion analytics
 */
export async function getSurveyCompletionAnalytics() {
  const analytics = await db.select().from(ResponseAnalytics)
    .orderBy(desc(ResponseAnalytics.started_at));
  
  const completionStats = await db.select({
    totalStarted: sql<number>`count(*)`,
    totalCompleted: sql<number>`count(case when completion_rate >= 100 then 1 end)`,
    averageCompletionRate: sql<number>`avg(completion_rate)`,
    averageResponseTime: sql<number>`avg(average_response_time_ms)`,
  }).from(ResponseAnalytics).get();
  
  return {
    analytics,
    completionStats,
  };
}
