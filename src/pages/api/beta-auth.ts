import type { APIRoute } from 'astro';
import { db, SiteSettings } from 'astro:db';
import { eq } from 'astro:db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { password, authTimestamp } = body;

    // Get beta password from database
    const passwordSetting = await db.select().from(SiteSettings)
      .where(eq(SiteSettings.key, 'beta_password'))
      .get();
    
    const BETA_PASSWORD = passwordSetting?.value || 'vcp2025beta'; // Fallback to default if not found

    // Check if access has been reset
    const resetSetting = await db.select().from(SiteSettings)
      .where(eq(SiteSettings.key, 'beta_access_reset_timestamp'))
      .get();

    if (resetSetting && authTimestamp) {
      const resetTime = new Date(resetSetting.value).getTime();
      const userAuthTime = new Date(authTimestamp).getTime();
      
      // If user's auth is older than the reset, require re-authentication
      if (userAuthTime < resetTime) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Access has been reset. Please enter the password again.',
            resetRequired: true
          }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
    }

    if (password === BETA_PASSWORD) {
      return new Response(
        JSON.stringify({
          success: true,
          authTimestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid password'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Server error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
