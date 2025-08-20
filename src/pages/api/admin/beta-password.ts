import type { APIRoute } from 'astro';
import { db, SiteSettings } from 'astro:db';
import { eq } from 'astro:db';
import { verifyAdminSession } from '@/lib/auth';

export const PUT: APIRoute = async ({ request, cookies }) => {
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
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const body = await request.json();
    const { password } = body;

    if (!password || password.trim() === '') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Password cannot be empty' 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if setting exists
    const existingSetting = await db.select().from(SiteSettings)
      .where(eq(SiteSettings.key, 'beta_password'))
      .get();

    if (existingSetting) {
      // Update existing setting
      await db.update(SiteSettings)
        .set({ 
          value: password,
          updatedAt: new Date(),
          updatedBy: user.id
        })
        .where(eq(SiteSettings.key, 'beta_password'))
        .run();
    } else {
      // Insert new setting
      await db.insert(SiteSettings).values({
        key: 'beta_password',
        value: password,
        updatedAt: new Date(),
        updatedBy: user.id
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Beta password updated successfully' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error updating beta password:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Server error' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const GET: APIRoute = async ({ cookies }) => {
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
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Get current beta password
    const passwordSetting = await db.select().from(SiteSettings)
      .where(eq(SiteSettings.key, 'beta_password'))
      .get();

    return new Response(
      JSON.stringify({ 
        success: true, 
        password: passwordSetting?.value || '',
        lastUpdated: passwordSetting?.updatedAt || null
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error getting beta password:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Server error' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
