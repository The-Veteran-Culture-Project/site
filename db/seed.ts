import { db, SurveyUser, SurveyResponses, Question, SiteSettings, LoginActivity, QuestionResponse, ResponseAnalytics, QuestionStats } from "astro:db";
import { eq } from "astro:db";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { getCollection } from "astro:content";
import fs from "node:fs/promises";
import path from "node:path";

export default async function seed() {
  // Check if admin user already exists
  const existingAdmin = await db.select().from(SurveyUser)
    .where(eq(SurveyUser.username, "admin"))
    .get();
  
  if (!existingAdmin) {
    // Create a hashed password for the admin user
    const hashedPassword = await bcrypt.hash("admin", 10);

    await db.insert(SurveyUser).values([
      {
        id: "admin-user",
        username: "admin",
        password: hashedPassword,
        role: "admin",
        email: "admin@veterancultureproject.org",
        created_at: new Date(),
        is_active: true,
      },
    ]);
    console.log("Created admin user");
  } else {
    // Update existing admin user to have the new fields if they don't exist
    if (!existingAdmin.role || !existingAdmin.email || !existingAdmin.created_at) {
      await db.update(SurveyUser)
        .set({ 
          role: existingAdmin.role || "admin",
          email: existingAdmin.email || "admin@veterancultureproject.org",
          created_at: existingAdmin.created_at || new Date(),
          is_active: existingAdmin.is_active !== undefined ? existingAdmin.is_active : true
        })
        .where(eq(SurveyUser.id, existingAdmin.id));
      console.log("Updated existing admin user with new fields");
    }
  }

  // Create additional sample admin users if they don't exist
  const sampleAdmins = [
    {
      id: "admin-josh",
      username: "josh",
      email: "josh@veterancultureproject.org",
      password: "temppass123"
    },
    {
      id: "admin-researcher",
      username: "researcher",
      email: "researcher@veterancultureproject.org", 
      password: "research123"
    }
  ];

  for (const admin of sampleAdmins) {
    const existing = await db.select().from(SurveyUser)
      .where(eq(SurveyUser.username, admin.username))
      .get();
    
    if (!existing) {
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      await db.insert(SurveyUser).values({
        id: admin.id,
        username: admin.username,
        password: hashedPassword,
        role: "admin",
        email: admin.email,
        created_at: new Date(),
        is_active: true,
      });
      console.log(`Created admin user: ${admin.username}`);
    }
  }

  // Create some sample login activities for testing
  const sampleLogins = [
    {
      userId: "admin-user",
      username: "admin",
      timeAgo: 2 * 60 * 1000 // 2 minutes ago
    },
    {
      userId: "admin-josh", 
      username: "josh",
      timeAgo: 30 * 60 * 1000 // 30 minutes ago
    },
    {
      userId: "admin-researcher",
      username: "researcher", 
      timeAgo: 2 * 60 * 60 * 1000 // 2 hours ago
    }
  ];

  for (const login of sampleLogins) {
    const { randomUUID } = await import("node:crypto");
    const loginTime = new Date(Date.now() - login.timeAgo);
    
    try {
      await db.insert(LoginActivity).values({
        id: randomUUID(),
        userId: login.userId,
        login_time: loginTime,
        ip_address: "127.0.0.1",
        user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
      });
      console.log(`Created sample login activity for ${login.username}`);
    } catch (error) {
      // Login activity might already exist, skip
    }
  }
  
  // Check if questions have already been migrated
  const existingQuestions = await db.select().from(Question).all();
  
  if (existingQuestions.length === 0) {
    try {
      // Get all questions from content collection
      const axisQuestions = await getCollection("axisQuestions");
      
      // Process and insert each question into the database
      for (const question of axisQuestions) {
        const { id: fileSlug, data } = question;
        
        await db.insert(Question).values({
          id: randomUUID(),
          text: data.question,
          category: data.category || "Uncategorized",
          axis: data.axis || "Y",
          version: 1,
          updatedAt: new Date(),
          updatedBy: "admin-user",
          fileSlug,
          active: true
        });
      }
      
      console.log(`Migrated ${axisQuestions.length} questions from content collection to database`);
    } catch (error) {
      console.error("Error migrating questions:", error);
    }
  }
  
  // Removed sample survey data seeding - we'll use real user data instead

  // Check if beta password setting exists
  const betaPasswordSetting = await db.select().from(SiteSettings)
    .where(eq(SiteSettings.key, "beta_password"))
    .get();
  
  if (!betaPasswordSetting) {
    // Insert default beta password
    await db.insert(SiteSettings).values({
      key: "beta_password",
      value: "vcp2025beta",  // Default beta password
      updatedAt: new Date(),
      updatedBy: "admin-user"
    });
    console.log("Created default beta password setting");
  }

  // Seed sample detailed response data
  await seedSampleResponseData();
}

async function seedSampleResponseData() {
  // Check if we already have sample data
  const existingData = await db.select().from(ResponseAnalytics).limit(1).get();
  if (existingData) {
    return; // Sample data already exists
  }

  console.log("Creating sample detailed response data...");

  // Get some questions to use
  const questions = await db.select().from(Question).limit(5);
  if (questions.length === 0) {
    return; // No questions available
  }

  // First, create some actual survey responses that we can reference
  const sampleSurveyResponses = [
    {
      id: randomUUID(),
      first_name: "John",
      last_name: "Doe", 
      email: "john.doe@example.com",
      subscribe: false,
      story_opt_in: true,
      military_score: 5,
      civilian_score: 3,
      strategy: "Integration",
      demographics: { age_range: "25-34", gender: "Male", military_status: "Veteran" },
      va_benefits: { has_applied: "Yes", benefits_used: ["GI Bill"] },
    },
    {
      id: randomUUID(),
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@example.com", 
      subscribe: true,
      story_opt_in: false,
      military_score: 7,
      civilian_score: 6,
      strategy: "Assimilation",
      demographics: { age_range: "35-44", gender: "Female", military_status: "Veteran" },
      va_benefits: { has_applied: "No", benefits_used: [] },
    },
    {
      id: randomUUID(),
      first_name: "Mike",
      last_name: "Johnson",
      email: "mike.johnson@example.com",
      subscribe: false,
      story_opt_in: false,
      military_score: 2,
      civilian_score: 8,
      strategy: "Separation",
      demographics: { age_range: "45-54", gender: "Male", military_status: "Veteran" },
      va_benefits: { has_applied: "Yes", benefits_used: ["Disability", "Healthcare"] },
    },
  ];

  // Insert the survey responses first
  for (const response of sampleSurveyResponses) {
    await db.insert(SurveyResponses).values(response);
  }

  // Create 3 sample survey sessions
  const sampleSessions = [
    {
      id: randomUUID(),
      surveyResponseId: sampleSurveyResponses[0].id, // Reference the actual survey response
      deviceType: "desktop",
      browserInfo: "Chrome 119.0",
      completionRate: 100,
      questionsAnswered: 5,
    },
    {
      id: randomUUID(),
      surveyResponseId: sampleSurveyResponses[1].id, // Reference the actual survey response
      deviceType: "mobile",
      browserInfo: "Safari 17.0",
      completionRate: 60,
      questionsAnswered: 3,
    },
    {
      id: randomUUID(),
      surveyResponseId: sampleSurveyResponses[2].id, // Reference the actual survey response
      deviceType: "tablet",
      browserInfo: "Firefox 120.0",
      completionRate: 80,
      questionsAnswered: 4,
    },
  ];

  for (const session of sampleSessions) {
    // Create ResponseAnalytics entry
    const startedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Within last week
    
    await db.insert(ResponseAnalytics).values({
      id: session.id,
      survey_response_id: session.surveyResponseId,
      total_questions: 5,
      questions_answered: session.questionsAnswered,
      completion_rate: session.completionRate,
      started_at: startedAt,
      completed_at: session.completionRate >= 100 ? new Date(startedAt.getTime() + 15 * 60 * 1000) : null,
      device_type: session.deviceType,
      browser_info: session.browserInfo,
      total_response_time_ms: 45000 + Math.random() * 30000,
      average_response_time_ms: 3000 + Math.random() * 2000,
    });

    // Create individual question responses
    for (let i = 0; i < session.questionsAnswered; i++) {
      const question = questions[i];
      const responseValue = Math.floor(Math.random() * 5) + 1; // 1-5 scale
      const responseTime = 2000 + Math.random() * 8000; // 2-10 seconds
      
      const questionResponseId = randomUUID();
      await db.insert(QuestionResponse).values({
        id: questionResponseId,
        survey_response_id: session.surveyResponseId,
        question_id: question.id,
        question_text: question.text,
        question_category: question.category,
        question_axis: question.axis,
        response_value: responseValue,
        response_time_ms: responseTime,
        answered_at: new Date(startedAt.getTime() + (i + 1) * 60000), // 1 minute apart
      });

      // Update or create question stats
      const existingStats = await db.select().from(QuestionStats)
        .where(eq(QuestionStats.question_id, question.id))
        .get();

      if (existingStats) {
        // Update existing stats
        const newTotal = existingStats.total_responses + 1;
        const currentTotal = (existingStats.average_response || 0) * existingStats.total_responses;
        const newAverage = (currentTotal + responseValue) / newTotal;
        
        const distribution = (existingStats.response_distribution as Record<string, number>) || {};
        distribution[responseValue.toString()] = (distribution[responseValue.toString()] || 0) + 1;

        await db.update(QuestionStats)
          .set({
            total_responses: newTotal,
            average_response: newAverage,
            response_distribution: distribution,
            average_response_time_ms: existingStats.average_response_time_ms 
              ? (existingStats.average_response_time_ms * existingStats.total_responses + responseTime) / newTotal
              : responseTime,
            last_updated: new Date(),
          })
          .where(eq(QuestionStats.id, existingStats.id));
      } else {
        // Create new stats
        await db.insert(QuestionStats).values({
          id: randomUUID(),
          question_id: question.id,
          total_responses: 1,
          average_response: responseValue,
          response_distribution: { [responseValue]: 1 },
          average_response_time_ms: responseTime,
          last_updated: new Date(),
        });
      }
    }
  }

  console.log("Sample detailed response data created!");
}
