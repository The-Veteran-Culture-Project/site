import type { APIRoute } from "astro";
import { db, SurveyUser, LoginActivity } from "astro:db";
import { eq } from "astro:db";
import bcrypt from "bcryptjs";
import { lucia } from "@/lib/auth";
import { randomUUID } from "node:crypto";
import { verifyTwoFactorToken } from "@/lib/twoFactor";

export const POST: APIRoute = async ({ request, cookies, redirect, clientAddress }) => {
  console.log("🚀 LOGIN API: POST request received");
  try {
    console.log("Login API: Processing login request");
    const formData = await request.formData();
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();
    const twoFactorCode = formData.get("twoFactorCode")?.toString();
    
    console.log(`Login API: Received login attempt for username: ${username}, has password: ${!!password}`);

    if (!username || !password) {
      console.log("Login API: Missing credentials, redirecting with error");
      return redirect("/admin/login?error=missing", 302);
    }

  const user = await db.select().from(SurveyUser).where(eq(SurveyUser.username, username)).get();

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return redirect("/admin/login?error=invalid", 302);
  }

  // Check if user is active
  if (!user.is_active) {
    return redirect("/admin/login?error=inactive", 302);
  }

  // Check 2FA if enabled
  if (user.two_factor_enabled && user.two_factor_secret) {
    if (!twoFactorCode) {
      // Redirect to 2FA verification page
      const sessionData = {
        userId: user.id,
        timestamp: Date.now()
      };
      cookies.set('temp_login', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: true,
        maxAge: 300, // 5 minutes
        sameSite: 'strict'
      });
      return redirect("/admin/verify-2fa", 302);
    }
    
    // Verify 2FA code
    if (!verifyTwoFactorToken(twoFactorCode, user.two_factor_secret)) {
      return redirect("/admin/verify-2fa?error=invalid", 302);
    }
    
    // Clear temp login cookie
    cookies.delete('temp_login');
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    // Update last login time
    console.log(`Updating last_login for user ${user.id}`);
    await db.update(SurveyUser)
      .set({ last_login: new Date() })
      .where(eq(SurveyUser.id, user.id));

    // Track login activity
    const loginActivityId = randomUUID();
    console.log(`Inserting login activity for user ${user.username}:`, {
      id: loginActivityId,
      userId: user.id,
      login_time: new Date()
    });
    
    await db.insert(LoginActivity).values({
      id: loginActivityId,
      userId: user.id,
      login_time: new Date(),
      ip_address: clientAddress || request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown"
    });

    console.log(`Login API: Login activity tracked for user ${user.username}`);

    console.log("Login API: Session created, redirecting to admin users page");
    // ✅ Final working redirect
    return redirect("/admin/users", 302);
  } catch (error) {
    console.error("Login API: Error during login process", error);
    return new Response("Server error during login", { status: 500 });
  }
};

// Make TypeScript happy by defining a GET handler that redirects to login page
export const GET: APIRoute = async ({ redirect }) => {
  return redirect("/admin/login");
};
