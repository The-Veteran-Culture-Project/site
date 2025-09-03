import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

// Set TOTP options
authenticator.options = {
  window: 2, // Allow 2 steps before/after current time (more forgiving)
  digits: 6,
  step: 30,
};

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  manualEntryKey: string;
}

/**
 * Generate a new 2FA secret and QR code for a user
 */
export async function generateTwoFactorSetup(
  username: string,
  appName: string = 'Veteran Culture Project'
): Promise<TwoFactorSetup> {
  const secret = authenticator.generateSecret();
  
  // Create the TOTP URL for QR code
  const otpauth = authenticator.keyuri(username, appName, secret);
  
  // Generate QR code as data URL
  const qrCode = await toDataURL(otpauth);
  
  return {
    secret,
    qrCode,
    manualEntryKey: secret,
  };
}

/**
 * Verify a TOTP token against a secret
 */
export function verifyTwoFactorToken(token: string, secret: string): boolean {
  try {
    // Clean the token (remove spaces, ensure it's 6 digits)
    const cleanToken = token.replace(/\s+/g, '').trim();
    
    if (!/^\d{6}$/.test(cleanToken)) {
      console.error('2FA verification error: Invalid token format', { token: cleanToken });
      return false;
    }
    
    const result = authenticator.verify({ token: cleanToken, secret });
    console.log('2FA verification result:', { 
      token: cleanToken, 
      secretPreview: secret.substring(0, 8) + '...', 
      result 
    });
    
    return result;
  } catch (error) {
    console.error('2FA verification error:', error);
    return false;
  }
}

/**
 * Generate a backup code (for future use)
 */
export function generateBackupCode(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
