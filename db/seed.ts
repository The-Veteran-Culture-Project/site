import { db, User } from "astro:db";

export default async function seed() {
  await db.insert(User).values([
    {
      id: "123456",
      username: "test",
      hashed_password:
        "$argon2id$v=19$m=19456,t=2,p=1$EHBKVOQ2dxf4Q0ldnvdZlQ$IkfwRrxwyFyJhKqSsB02F2F3F1/GSE0WPKSUBVbHoy8",
    },
  ]);
}
