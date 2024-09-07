import { db, SurveyUser } from "astro:db";

export default async function seed() {
  await db.insert(SurveyUser).values([
    {
      id: "123456",
      username: "test",
      password: "password",
    },
  ]);
}
