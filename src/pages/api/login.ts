import type { APIRoute } from "astro";
import { db, SurveyUser } from "astro:db";
import { eq } from "astro:db";
import bcrypt from "bcryptjs";
import { lucia } from "@/lib/auth";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    console.log("Login API: Processing login request");
    const formData = await request.formData();
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();
    
    console.log(`Login API: Received login attempt for username: ${username}`);

    if (!username || !password) {
      console.log("Login API: Missing credentials");
      return new Response("Missing credentials", { status: 400 });
    }

  const user = await db.select().from(SurveyUser).where(eq(SurveyUser.username, username)).get();

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return new Response("Invalid username or password", { status: 401 });
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    console.log("Login API: Session created, redirecting to results page");
    // ✅ Final working redirect
    return redirect("/admin/results", 302);
  } catch (error) {
    console.error("Login API: Error during login process", error);
    return new Response("Server error during login", { status: 500 });
  }
};

// Make TypeScript happy by defining a GET handler that redirects to login page
export const GET: APIRoute = async ({ redirect }) => {
  return redirect("/admin/login");
};
