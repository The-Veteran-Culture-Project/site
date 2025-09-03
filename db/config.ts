import { defineDb, defineTable, column } from "astro:db";
import bcrypt from "bcryptjs";

const SurveyUser = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    username: column.text({ unique: true }),
    password: column.text(),
    role: column.text({ default: "user" }), // "admin" or "user"
    email: column.text({ optional: true }),
    phone_number: column.text({ optional: true }),
    created_at: column.date({ default: new Date() }),
    last_login: column.date({ optional: true }),
    is_active: column.boolean({ default: true }),
    two_factor_secret: column.text({ optional: true }),
    two_factor_enabled: column.boolean({ default: false }),
    two_factor_method: column.text({ default: "none" }), // "none", "sms", "email", "totp"
    verification_code: column.text({ optional: true }),
    verification_code_expires: column.date({ optional: true }),
  },
});

const Session = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    expiresAt: column.date(),
    userId: column.text({
      references: () => SurveyUser.columns.id,
    }),
  },
});

const LoginActivity = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({
      references: () => SurveyUser.columns.id,
    }),
    login_time: column.date({ default: new Date() }),
    ip_address: column.text({ optional: true }),
    user_agent: column.text({ optional: true }),
  },
});

const SurveyResponses = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    created_at: column.date({ default: new Date() }),
    first_name: column.text(),
    last_name: column.text(),
    email: column.text(),
    subscribe: column.boolean({ default: false }),
    story_opt_in: column.boolean({ default: false }),
    military_score: column.number(),
    civilian_score: column.number(),
    strategy: column.text(),
    demographics: column.json(),
    va_benefits: column.json(),
  },
});

const MarketingSubscriber = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    email: column.text({ unique: true }),
    name: column.text({ optional: true }),
    created_at: column.date({ default: new Date() }),
    source: column.text({ optional: true }),
  },
});

const Question = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    text: column.text(),
    category: column.text(),
    axis: column.text(),
    version: column.number({ default: 1 }),
    updatedAt: column.date({ default: new Date() }),
    updatedBy: column.text({
      references: () => SurveyUser.columns.id,
    }),
    fileSlug: column.text({ unique: true }),  // Maps to content collection filename
    active: column.boolean({ default: true }), // Whether the question is active
  },
});

const QuestionHistory = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    questionId: column.text({
      references: () => Question.columns.id,
    }),
    text: column.text(),
    category: column.text(),
    axis: column.text(),
    version: column.number(),
    updatedAt: column.date(),
    updatedBy: column.text({
      references: () => SurveyUser.columns.id,
    }),
  },
});

// Individual question responses for detailed analytics
const QuestionResponse = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    survey_response_id: column.text({
      references: () => SurveyResponses.columns.id,
    }),
    question_id: column.text({ optional: true }),
    question_text: column.text(), // Store the exact question text at time of response
    question_category: column.text(),
    question_axis: column.text(), // "X" or "Y" axis
    response_value: column.number(), // The numerical response (e.g., 1-5 scale)
    response_text: column.text({ optional: true }), // Optional text representation
    answered_at: column.date({ default: new Date() }),
    response_time_ms: column.number({ optional: true }), // Time taken to answer in milliseconds
  },
});

// Track response patterns and analytics
const ResponseAnalytics = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    survey_response_id: column.text({
      references: () => SurveyResponses.columns.id,
    }),
    total_questions: column.number(),
    questions_answered: column.number(),
    completion_rate: column.number(), // Percentage completed
    total_response_time_ms: column.number({ optional: true }),
    average_response_time_ms: column.number({ optional: true }),
    started_at: column.date(),
    completed_at: column.date({ optional: true }),
    dropped_at_question: column.text({ optional: true }), // Question ID where user dropped off
    device_type: column.text({ optional: true }), // mobile, desktop, tablet
    browser_info: column.text({ optional: true }),
  },
});

// Track question-level statistics
const QuestionStats = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    question_id: column.text({
      references: () => Question.columns.id,
    }),
    total_responses: column.number({ default: 0 }),
    average_response: column.number({ optional: true }),
    response_distribution: column.json({ optional: true }), // Count of each response value
    average_response_time_ms: column.number({ optional: true }),
    skip_rate: column.number({ default: 0 }), // Percentage who skipped this question
    last_updated: column.date({ default: new Date() }),
  },
});

const SiteSettings = defineTable({
  columns: {
    key: column.text({ primaryKey: true }),
    value: column.text(),
    updatedAt: column.date({ default: new Date() }),
    updatedBy: column.text({
      references: () => SurveyUser.columns.id,
      optional: true
    }),
  },
});

const BetaAccessRequest = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
    email: column.text(),
    status: column.text({ default: 'pending' }), // pending, approved, rejected
    requestedAt: column.date({ default: new Date() }),
    processedAt: column.date({ optional: true }),
    processedBy: column.text({
      references: () => SurveyUser.columns.id,
      optional: true
    }),
    notes: column.text({ optional: true }),
    passwordSent: column.boolean({ default: false, optional: true }),
  },
});

export default defineDb({
  tables: {
    SurveyUser,
    Session,
    LoginActivity,
    SurveyResponses,
    MarketingSubscriber,
    Question,
    QuestionHistory,
    QuestionResponse,
    ResponseAnalytics,
    QuestionStats,
    SiteSettings,
    BetaAccessRequest,
  },
});
