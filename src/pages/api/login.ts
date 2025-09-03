import type { APIRoute } from "astro";
import { db, SurveyUser, LoginActivity } from "astro:db";
import { eq } from "astro:db";
import bcrypt from "bcryptjs";
import { lucia } from "@/lib/auth";
import { randomUUID } from "node:crypto";
import { verifyTwoFactorToken } from "@/lib/twoFactor";
import { generateVerificationCode, getCodeExpirationTime, sendVerificationCode } from "@/lib/simpleVerification";

export const POST: APIRoute = async ({ request, cookies, redirect, clientAddress }) => {
  console.log("🚀 LOGIN API: POST request received - START");
  console.log("🚀 LOGIN API: Request URL:", request.url);
  console.log("🚀 LOGIN API: Request method:", request.method);
  try {
    console.log("Login API: Processing login request");
    const formData = await request.formData();
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();
    const twoFactorCode = formData.get("twoFactorCode")?.toString();
    
    console.log(`🔍 LOGIN API: Received login attempt for username: ${username}, has password: ${!!password}, has 2FA code: ${!!twoFactorCode}`);

    if (!username || !password) {
      console.log("❌ LOGIN API: Missing credentials, redirecting with error");
      return redirect("/admin/login?error=missing", 302);
    }

  const user = await db.select().from(SurveyUser).where(eq(SurveyUser.username, username)).get();

  if (!user || !(await bcrypt.compare(password, user.password))) {
    console.log("❌ LOGIN API: Invalid credentials");
    return redirect("/admin/login?error=invalid", 302);
  }

  console.log(`✅ LOGIN API: Valid credentials for user ${username}`);

  // Check if user is active
  if (!user.is_active) {
    console.log("❌ LOGIN API: User is inactive");
    return redirect("/admin/login?error=inactive", 302);
  }

  // Check 2FA if enabled
  console.log(`🔐 LOGIN API: User 2FA status - enabled: ${user.two_factor_enabled}, method: ${user.two_factor_method}, has secret: ${!!user.two_factor_secret}`);
  if (user.two_factor_enabled) {
    console.log("🔐 LOGIN API: 2FA is enabled, checking method and code");
    
    if (!twoFactorCode) {
      console.log("🔄 LOGIN API: No 2FA code provided, need to send verification");
      
      // Handle different 2FA methods
      if (user.two_factor_method === "email" && user.email) {
        console.log("� LOGIN API: Sending email verification code");
        const code = generateVerificationCode();
        const expiresAt = getCodeExpirationTime();
        
        // Store code in database
        await db.update(SurveyUser)
          .set({ 
            verification_code: code,
            verification_code_expires: expiresAt 
          })
          .where(eq(SurveyUser.id, user.id));
        
        // Send email (in development, this logs to console)
        const result = await sendVerificationCode("email", user.email, code, user.username);
        console.log(`📧 LOGIN API: Email send result: ${result.message}`);
        
      } else if (user.two_factor_method === "sms" && user.phone_number) {
        console.log("� LOGIN API: Sending SMS verification code");
        const code = generateVerificationCode();
        const expiresAt = getCodeExpirationTime();
        
        // Store code in database
        await db.update(SurveyUser)
          .set({ 
            verification_code: code,
            verification_code_expires: expiresAt 
          })
          .where(eq(SurveyUser.id, user.id));
        
        // Send SMS (in development, this logs to console)
        const result = await sendVerificationCode("sms", user.phone_number, code, user.username);
        console.log(`📱 LOGIN API: SMS send result: ${result.message}`);
        
      } else if (user.two_factor_method === "totp" && user.two_factor_secret) {
        console.log("🔑 LOGIN API: Using legacy TOTP method");
        // Fall back to old TOTP method for existing users
      }
      
      // Redirect to 2FA verification page
      const sessionData = {
        userId: user.id,
        timestamp: Date.now()
      };
      console.log("🍪 LOGIN API: Setting temp_login cookie with data:", sessionData);
      const cookieValue = JSON.stringify(sessionData);
      console.log("🍪 LOGIN API: Cookie value to set:", cookieValue);
      cookies.set('temp_login', cookieValue, {
        httpOnly: false, // Allow client-side access for debugging
        secure: false, // Set to false for development
        maxAge: 300, // 5 minutes
        sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
        path: '/' // Explicitly set path
      });
      console.log("🍪 LOGIN API: Cookie set successfully");
      console.log("🔄 LOGIN API: Redirecting to verification page");
      return redirect("/admin/verify-simple-2fa", 302);
    }
    
    // Verify 2FA code based on method
    let isValidCode = false;
    
    if (user.two_factor_method === "email" || user.two_factor_method === "sms") {
      console.log("🔍 LOGIN API: Verifying simple 2FA code");
      // Verify simple code (email/SMS)
      if (user.verification_code && user.verification_code_expires) {
        const now = new Date();
        const isNotExpired = now < user.verification_code_expires;
        const codeMatches = user.verification_code === twoFactorCode;
        
        console.log(`🔍 LOGIN API: Code check - matches: ${codeMatches}, not expired: ${isNotExpired}`);
        isValidCode = codeMatches && isNotExpired;
        
        if (isValidCode) {
          // Clear the verification code after successful use
          await db.update(SurveyUser)
            .set({ 
              verification_code: null,
              verification_code_expires: null 
            })
            .where(eq(SurveyUser.id, user.id));
        }
      }
    } else if (user.two_factor_method === "totp" && user.two_factor_secret) {
      console.log("🔑 LOGIN API: Verifying TOTP code");
      // Verify TOTP code (legacy method)
      isValidCode = verifyTwoFactorToken(twoFactorCode, user.two_factor_secret);
    }
    
    if (!isValidCode) {
      console.log("❌ LOGIN API: Invalid 2FA code");
      return redirect("/admin/verify-simple-2fa?error=invalid", 302);
    }
    
    console.log("✅ LOGIN API: Valid 2FA code");
    // Clear temp login cookie
    cookies.delete('temp_login');
  } else {
    console.log("🔓 LOGIN API: 2FA not enabled, proceeding with normal login");
  }

  console.log("🎯 LOGIN API: Creating session...");
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

    console.log("🎉 LOGIN API: Session created, redirecting to admin dashboard");
    // ✅ Redirect to dashboard after successful login
    return redirect("/admin/dashboard", 302);
  } catch (error) {
    console.error("Login API: Error during login process", error);
    return new Response("Server error during login", { status: 500 });
  }
};

// Make TypeScript happy by defining a GET handler that redirects to login page
export const GET: APIRoute = async ({ redirect }) => {
  return redirect("/admin/login");
};
