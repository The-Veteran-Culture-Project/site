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
          const { firstName, lastName, email, veteranStatus } = await context.request.json();
          if (
            typeof firstName !== "string" || firstName.length < 1 ||
            typeof lastName !== "string" || lastName.length < 1 ||
            typeof email !== "string" || !email.includes("@") ||
            typeof veteranStatus !== "string" || !["Active Military", "Veteran", "Civilian"].includes(veteranStatus)
          ) {
            return new Response(JSON.stringify({ message: "Invalid input" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Optionally, save user info to database here
          // await db.insert(SurveyUser).values({ firstName, lastName, email, veteranStatus });

          // Set a session or cookie if needed
          // ...

          return new Response(JSON.stringify({ message: "Info submitted!" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
    // If you need to set a cookie, define sessionCookie here or remove these lines.
    // Example:
    // const sessionCookie = { value: "your-session-value", attributes: { /* cookie attributes */ } };
    // Otherwise, remove the lines below.

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
