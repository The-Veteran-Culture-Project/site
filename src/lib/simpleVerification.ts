import { randomInt } from "node:crypto";

export function generateVerificationCode(): string {
  // Generate a 6-digit random code
  return randomInt(100000, 999999).toString();
}

export function isCodeExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function getCodeExpirationTime(): Date {
  // Code expires in 10 minutes
  return new Date(Date.now() + 10 * 60 * 1000);
}

export async function sendVerificationCode(
  method: "sms" | "email",
  destination: string,
  code: string,
  username: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (method === "email") {
      return await sendEmailCode(destination, code, username);
    } else if (method === "sms") {
      return await sendSMSCode(destination, code, username);
    }
    
    return { success: false, message: "Invalid method" };
  } catch (error) {
    console.error("Error sending verification code:", error);
    return { success: false, message: "Failed to send code" };
  }
}

async function sendEmailCode(
  email: string,
  code: string,
  username: string
): Promise<{ success: boolean; message: string }> {
  // For development, just log the code
  // In production, you'd integrate with an email service like SendGrid, AWS SES, etc.
  
  console.log(`📧 EMAIL VERIFICATION CODE for ${username} (${email}): ${code}`);
  console.log(`📧 Email would contain: "Your verification code is: ${code}. This code expires in 10 minutes."`);
  
  // Simulate email sending
  return {
    success: true,
    message: `Verification code sent to ${email}`
  };
}

async function sendSMSCode(
  phoneNumber: string,
  code: string,
  username: string
): Promise<{ success: boolean; message: string }> {
  // For development, just log the code
  // In production, you'd integrate with SMS service like Twilio, AWS SNS, etc.
  
  console.log(`📱 SMS VERIFICATION CODE for ${username} (${phoneNumber}): ${code}`);
  console.log(`📱 SMS would contain: "VCP Admin Login: Your verification code is ${code}. Expires in 10 min."`);
  
  // Simulate SMS sending
  return {
    success: true,
    message: `Verification code sent to ${phoneNumber}`
  };
}

export async function validatePhoneNumber(phone: string): Promise<boolean> {
  // Basic phone number validation
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.trim());
}

export async function validateEmail(email: string): Promise<boolean> {
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  return phone.replace(/[^\d+]/g, '');
}

export function formatEmail(email: string): string {
  return email.trim().toLowerCase();
}
