import { db, User } from "astro:db";

export default async function seed() {
  await db.insert(User).values([
    {
      id: "123456",
      username: "test",
      password: "password",
    },
  ]);
}
