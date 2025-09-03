import { lucia } from "./lib/auth";
import { defineMiddleware } from "astro:middleware";
import { db, SurveyUser } from "astro:db";
import { eq } from "astro:db";
import bcrypt from "bcryptjs";

// Create admin user if it doesn't exist
async function ensureAdminExists() {
  try {
    console.log("Checking for admin user...");
    const adminUser = await db.select().from(SurveyUser)
      .where(eq(SurveyUser.username, "admin"))
      .get();

    if (!adminUser) {
      console.log("Admin user not found, creating...");
      const hashedPassword = await bcrypt.hash("admin", 10);
      await db.insert(SurveyUser).values({
        id: "admin-user",
        username: "admin",
        password: hashedPassword
      });
      console.log("Created admin user successfully");
    } else {
      console.log("Admin user already exists");
    }

    // Verify we can read the user back
    const verifyUser = await db.select().from(SurveyUser)
      .where(eq(SurveyUser.username, "admin"))
      .get();
    console.log("Admin user verification:", verifyUser ? "success" : "failed");
  } catch (e) {
    console.error("Error ensuring admin exists:", e);
    throw e; // Re-throw to see the error in logs
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  // Ensure admin user exists on startup
  await ensureAdminExists();

  // Get session from cookie
  const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;
  const surveyId = context.cookies.get("survey_id")?.value ?? null;

  if (!sessionId) {
    context.locals.user = null;
    context.locals.session = null;
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }
  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }
  context.locals.session = session;
  context.locals.user = user;
  context.locals.surveyId = surveyId;

  // Check if request is for admin routes
  if (context.url.pathname.startsWith("/admin")) {
    // Allow access to login page
    if (context.url.pathname === "/admin/login") {
      if (session) {
        // If already logged in, redirect to dashboard
        return new Response("Redirect", {
          status: 302,
          headers: {
            "Location": "/admin/dashboard"
          }
        });
      }
      // Not logged in, allow access to login page
      return next();
    }

    // For all other admin routes, require authentication
    if (!session) {
      return new Response("Redirect", {
        status: 302,
        headers: {
          "Location": "/admin/login"
        }
      });
    }
  }

  return next();
});
