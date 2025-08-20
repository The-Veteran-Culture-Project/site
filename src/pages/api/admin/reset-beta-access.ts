import type { APIRoute } from 'astro';
import { db, SiteSettings } from 'astro:db';
import { eq } from 'astro:db';
import { verifyAdminSession } from '@/lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  // Verify admin session first
  const user = await verifyAdminSession(cookies);
  
  if (!user) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Unauthorized' 
      }),
      { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // For a simple session-based system, we can't directly invalidate browser sessions
    // But we can change the password verification token or add a timestamp check
    
    // Update a reset timestamp in the database
    const resetTimestamp = new Date().toISOString();
    
    // Check if reset timestamp setting exists
    const existingSetting = await db.select().from(SiteSettings)
      .where(eq(SiteSettings.key, 'beta_access_reset_timestamp'))
      .get();

    if (existingSetting) {
      // Update existing setting
      await db.update(SiteSettings)
        .set({
          value: resetTimestamp,
          updatedAt: new Date(),
          updatedBy: user.id,
        })
        .where(eq(SiteSettings.key, 'beta_access_reset_timestamp'));
    } else {
      // Create new setting
      await db.insert(SiteSettings).values({
        key: 'beta_access_reset_timestamp',
        value: resetTimestamp,
        updatedAt: new Date(),
        updatedBy: user.id,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Beta access reset successfully',
        resetTimestamp
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error resetting beta access:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to reset beta access'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};
