import { defineDb, defineTable, column } from "astro:db";
import bcrypt from "bcryptjs";

const SurveyUser = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    username: column.text({ unique: true }),
    password: column.text(),
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
  },
});

export default defineDb({
  tables: {
    SurveyUser,
    Session,
    SurveyResponses,
    MarketingSubscriber,
    Question,
    QuestionHistory,
    SiteSettings,
    BetaAccessRequest,
  },
});
