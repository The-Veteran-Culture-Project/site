import type { APIRoute } from 'astro';
import { db, BetaAccessRequest } from 'astro:db';
import { eq } from 'astro:db';
import { randomUUID } from 'node:crypto';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email } = body;

    // Basic validation
    if (!name || !email) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Name and email are required'
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if email already exists
    const existingRequest = await db.select().from(BetaAccessRequest)
      .where(eq(BetaAccessRequest.email, email))
      .get();

    if (existingRequest) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'A request with this email already exists'
        }),
        { 
          status: 409, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create the access request
    await db.insert(BetaAccessRequest).values({
      id: randomUUID(),
      name,
      email,
      status: 'pending',
      requestedAt: new Date(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Access request submitted successfully'
      }),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error creating beta access request:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to submit access request'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};
