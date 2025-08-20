import { db, MarketingSubscriber } from 'astro:db';
import { eq } from 'astro:db';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  // Check if user is logged in
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Not authorized' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  try {
    const { id } = await request.json();
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Subscriber ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Delete the subscriber
    await db.delete(MarketingSubscriber).where(eq(MarketingSubscriber.id, id));
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
