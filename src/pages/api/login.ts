import { lucia } from "@/lib/auth";
import { db, SurveyUser, eq } from "astro:db";

import type { APIContext } from "astro";

export async function POST(context: APIContext): Promise<Response> {
  try {
    const { username, password } = await context.request.json();
    if (
      typeof username !== "string" ||
      username.length < 3 ||
      username.length > 31 ||
      !/^[A-Za-z0-9_-]+$/.test(username)
    ) {
      return new Response(JSON.stringify({ message: "Invalid username" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (
      typeof password !== "string" ||
      password.length < 6 ||
      password.length > 255
    ) {
      return new Response(JSON.stringify({ message: "Invalid password" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingUser = await db
      .select()
      .from(SurveyUser)
      .where(eq(SurveyUser.username, username.toLowerCase()))
      .get();
    if (!existingUser) {
      // NOTE:
      // Returning immediately allows malicious actors to figure out valid usernames from response times,
      // allowing them to only focus on guessing passwords in brute-force attacks.
      // As a preventive measure, you may want to hash passwords even for invalid usernames.
      // However, valid usernames can be already be revealed with the signup page among other methods.
      // It will also be much more resource intensive.
      // Since protecting against this is non-trivial,
      // it is crucial your implementation is protected against brute-force attacks with login throttling etc.
      // If usernames are public, you may outright tell the user that the username is invalid.
      return new Response(
        JSON.stringify({ message: "Incorrect username or password!" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    const validPassword = password === existingUser.password;

    if (!validPassword) {
      return new Response(
        JSON.stringify({ message: "Incorrect username or password" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return new Response(null, {});
  } catch (error) {
    console.log(error);
    console.log(`token ${process.env.ASTRO_DB_APP_TOKEN}`);
    console.log(`remote url ${process.env.ASTRO_DB_REMOTE_URL}`);
    return new Response(JSON.stringify({ message: "An error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
