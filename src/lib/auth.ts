import { Lucia } from "lucia";
import { AstroDBAdapter } from "@/lib/dbAdapter";
import { db, SurveyUser, Session } from "astro:db";

const adapter = new AstroDBAdapter(db, Session, SurveyUser);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: import.meta.env.PROD,
      sameSite: "lax",
      path: "/",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
    };
  },
});

// IMPORTANT! Required for Astro middleware support
export type Auth = typeof lucia;

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  username: string;
}

// Admin session verification helper
export async function verifyAdminSession(cookies: { get: (name: string) => { value: string } | undefined }) {
  const sessionCookie = cookies.get(lucia.sessionCookieName);
  if (!sessionCookie) return null;
  
  const { session, user } = await lucia.validateSession(sessionCookie.value);
  
  // Verify that the user is an admin (currently we only have one admin user)
  if (!session || !user || user.username !== "admin") {
    return null;
  }
  
  return user;
}
