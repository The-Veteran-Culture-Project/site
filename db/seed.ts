import { db, User } from "astro:db";

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(User).values([
    {
      id: "123456",
      email: "test1@email.com",
      hashed_password:
        "$argon2id$v=19$m=19456,t=2,p=1$QepI+6GAAFxDUV3Mx/RMrQ$0yotfNp1hcFJ1VM2+4VMjQ5hV/FePoqvRppZeylEmWI",
    },
  ]);
}
