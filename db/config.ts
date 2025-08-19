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

export default defineDb({
  tables: {
    SurveyUser,
    Session,
    SurveyResponses,
  },
});
