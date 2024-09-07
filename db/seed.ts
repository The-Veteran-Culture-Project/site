import { db, User } from "astro:db";

export default async function seed() {
  await db.insert(User).values([
    {
      id: "123456",
      username: "test",
      hashed_password:
        "$argon2id$v=19$m=19456,t=2,p=1$nCp5973U9iBk/riNHrk4gA$TbMMBYycx/OGymfddWcRQA2vqsSj4P9syeUTU9lsi34",
    },
  ]);
}
