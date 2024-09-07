import { Lucia } from "lucia";
import { AstroDBAdapter } from "@/lib/dbAdapter";
import { db, SurveyUser, Session } from "astro:db";

const adapter = new AstroDBAdapter(db, Session, SurveyUser);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: import.meta.env.PROD,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  username: string;
}
