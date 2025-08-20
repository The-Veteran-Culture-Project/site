import { db, MarketingSubscriber } from 'astro:db';
import { v4 as uuidv4 } from 'uuid';
import type { APIRoute } from 'astro';
import { eq } from 'astro:db';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log("🚀 Marketing signup API called");
    const body = await request.json();
    const { email, name, source } = body;
    
    console.log("🚀 Marketing signup request data:", { email, name, source });
    
    if (!email) {
      console.log("🚀 Error: Email is required");
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Name is now optional

    // Check if email already exists
    const existingSubscriber = await db.select().from(MarketingSubscriber).where(eq(MarketingSubscriber.email, email)).get();
    
    if (existingSubscriber) {
      console.log("🚀 Email already subscribed:", email);
      return new Response(JSON.stringify({ message: 'Email already subscribed', subscriber: existingSubscriber }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Create a new subscriber
    console.log("🚀 Creating new marketing subscriber:", email);
    
    const subscriberData = {
      id: uuidv4(),
      email,
      name: name || null,
      created_at: new Date(),
      source: source || request.headers.get('referer') || 'website'
    };
    
    await db.insert(MarketingSubscriber).values(subscriberData);
    
    console.log("🚀 Successfully created marketing subscriber");
    
    // Query to confirm it was saved
    const savedSubscriber = await db.select().from(MarketingSubscriber).where(eq(MarketingSubscriber.email, email)).get();
    
    console.log("🚀 Saved subscriber:", savedSubscriber);
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Successfully subscribed to marketing',
      subscriber: savedSubscriber 
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error processing marketing signup:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
