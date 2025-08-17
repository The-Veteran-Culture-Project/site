import { defineDb, defineTable, column } from "astro:db";

const SurveyUser = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    username: column.text({ unique: true }),
    password: column.text(),
  },
});

const Survey = defineTable({
  columns: {
    id: column.text({ primaryKey: true, nullable: false }),
    takenAt: column.date(),
    answers: column.json(),
    x_offset: column.number(),
    y_offset: column.number(),
    firstName: column.text(),
    lastName: column.text(),
    email: column.text(),
    veteranStatus: column.text(),
    surveyUser: column.text({
      references: () => SurveyUser.columns.id,
      optional: true,
    }),
  },
});

const DemographicInfo = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    data: column.json(),
    surveyId: column.text({
      references: () => Survey.columns.id,
    }),
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

export default defineDb({
  tables: {
    Survey,
    SurveyUser,
    Session,
    DemographicInfo,
  },
});
