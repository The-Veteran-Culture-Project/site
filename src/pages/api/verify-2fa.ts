import type { APIRoute } from "astro";
import { db, SurveyUser, LoginActivity } from "astro:db";
import { eq } from "astro:db";
import { lucia } from "@/lib/auth";
import { randomUUID } from "node:crypto";
import { verifyTwoFactorToken } from "@/lib/twoFactor";

export const POST: APIRoute = async ({ request, cookies, redirect, clientAddress }) => {
  try {
    const formData = await request.formData();
    const twoFactorCode = formData.get("twoFactorCode")?.toString();
    
    // Get temp login data
    const tempLogin = cookies.get('temp_login');
    if (!tempLogin) {
      return redirect("/admin/login?error=expired", 302);
    }
    
    let tempLoginData;
    try {
      tempLoginData = JSON.parse(tempLogin.value);
      // Check if token is expired (5 minutes)
      if (Date.now() - tempLoginData.timestamp > 300000) {
        cookies.delete('temp_login');
        return redirect("/admin/login?error=expired", 302);
      }
    } catch {
      return redirect("/admin/login", 302);
    }
    
    if (!twoFactorCode) {
      return redirect("/admin/verify-2fa?error=missing", 302);
    }
    
    // Get user
    const user = await db.select().from(SurveyUser)
      .where(eq(SurveyUser.id, tempLoginData.userId))
      .get();
    
    if (!user || !user.two_factor_enabled || !user.two_factor_secret) {
      return redirect("/admin/login", 302);
    }
    
    // Verify 2FA code
    if (!verifyTwoFactorToken(twoFactorCode, user.two_factor_secret)) {
      return redirect("/admin/verify-2fa?error=invalid", 302);
    }
    
    // Clear temp login cookie
    cookies.delete('temp_login');
    
    // Create session
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    
    // Update last login time
    await db.update(SurveyUser)
      .set({ last_login: new Date() })
      .where(eq(SurveyUser.id, user.id));
    
    // Track login activity
    const loginActivityId = randomUUID();
    await db.insert(LoginActivity).values({
      id: loginActivityId,
      userId: user.id,
      login_time: new Date(),
      ip_address: clientAddress || request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown"
    });
    
    return redirect("/admin/users", 302);
  } catch (error) {
    console.error("2FA verification error:", error);
    return redirect("/admin/verify-2fa?error=server", 302);
  }
};

export const GET: APIRoute = async ({ redirect }) => {
  return redirect("/admin/verify-2fa");
};
