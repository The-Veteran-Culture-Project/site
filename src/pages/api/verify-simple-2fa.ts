import type { APIRoute } from "astro";
import { db, SurveyUser, LoginActivity } from "astro:db";
import { eq } from "astro:db";
import { lucia } from "@/lib/auth";
import { randomUUID } from "node:crypto";

export const POST: APIRoute = async ({ request, cookies, redirect, clientAddress }) => {
  console.log("🔐 VERIFY SIMPLE 2FA API: POST request received");
  try {
    const formData = await request.formData();
    const twoFactorCode = formData.get("twoFactorCode")?.toString();
    
    console.log(`🔐 VERIFY SIMPLE 2FA API: Received code: ${twoFactorCode}`);
    
    // Get temp login data
    const tempLogin = cookies.get('temp_login');
    if (!tempLogin) {
      console.log("❌ VERIFY SIMPLE 2FA API: No temp login cookie");
      return redirect("/admin/login?error=expired", 302);
    }
    
    let tempLoginData;
    try {
      tempLoginData = JSON.parse(tempLogin.value);
      // Check if token is expired (5 minutes)
      if (Date.now() - tempLoginData.timestamp > 300000) {
        console.log("❌ VERIFY SIMPLE 2FA API: Temp login expired");
        cookies.delete('temp_login');
        return redirect("/admin/login?error=expired", 302);
      }
    } catch {
      console.log("❌ VERIFY SIMPLE 2FA API: Invalid temp login data");
      return redirect("/admin/login", 302);
    }
    
    if (!twoFactorCode) {
      console.log("❌ VERIFY SIMPLE 2FA API: No code provided");
      return redirect("/admin/verify-simple-2fa?error=missing", 302);
    }
    
    // Get user
    const user = await db.select().from(SurveyUser)
      .where(eq(SurveyUser.id, tempLoginData.userId))
      .get();
    
    if (!user) {
      console.log("❌ VERIFY SIMPLE 2FA API: User not found");
      return redirect("/admin/login", 302);
    }
    
    console.log(`🔐 VERIFY SIMPLE 2FA API: User ${user.username}, method: ${user.two_factor_method}`);
    
    // Verify code based on method
    let isValidCode = false;
    
    if (user.two_factor_method === "email" || user.two_factor_method === "sms") {
      console.log("🔍 VERIFY SIMPLE 2FA API: Verifying simple 2FA code");
      // Verify simple code (email/SMS)
      if (user.verification_code && user.verification_code_expires) {
        const now = new Date();
        const isNotExpired = now < user.verification_code_expires;
        const codeMatches = user.verification_code === twoFactorCode;
        
        console.log(`🔍 VERIFY SIMPLE 2FA API: Code check - matches: ${codeMatches}, not expired: ${isNotExpired}`);
        console.log(`🔍 VERIFY SIMPLE 2FA API: Expected: ${user.verification_code}, Received: ${twoFactorCode}`);
        console.log(`🔍 VERIFY SIMPLE 2FA API: Expires: ${user.verification_code_expires}, Now: ${now}`);
        
        isValidCode = codeMatches && isNotExpired;
        
        if (isValidCode) {
          // Clear the verification code after successful use
          await db.update(SurveyUser)
            .set({ 
              verification_code: null,
              verification_code_expires: null 
            })
            .where(eq(SurveyUser.id, user.id));
          console.log("✅ VERIFY SIMPLE 2FA API: Code cleared after successful verification");
        }
      } else {
        console.log("❌ VERIFY SIMPLE 2FA API: No verification code stored");
      }
    }
    
    if (!isValidCode) {
      console.log("❌ VERIFY SIMPLE 2FA API: Invalid 2FA code");
      return redirect("/admin/verify-simple-2fa?error=invalid", 302);
    }
    
    console.log("✅ VERIFY SIMPLE 2FA API: Valid 2FA code");
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
    
    console.log("🎉 VERIFY SIMPLE 2FA API: Login successful, redirecting to dashboard");
    return redirect("/admin/dashboard", 302);
  } catch (error) {
    console.error("❌ VERIFY SIMPLE 2FA API: Error during verification", error);
    return redirect("/admin/verify-simple-2fa?error=server", 302);
  }
};

export const GET: APIRoute = async ({ redirect }) => {
  return redirect("/admin/verify-simple-2fa");
};
