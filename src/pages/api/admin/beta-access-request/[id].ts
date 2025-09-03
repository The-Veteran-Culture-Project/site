import type { APIRoute } from "astro";
import { db, BetaAccessRequest, SiteSettings } from 'astro:db';
import { eq } from 'astro:db';
import { verifyAdminSession } from "@/lib/auth";

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  // Check if user is admin
  const user = await verifyAdminSession(cookies);
  
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const requestId = params.id;
    if (!requestId) {
      return new Response(JSON.stringify({ error: "Request ID is required" }), {
        status: 400,
      });
    }
    
    // Get request body
    const body = await request.json();
    const { status, notes, password, passwordSent } = body;
    
    // Handle passwordSent toggle
    if (passwordSent !== undefined) {
      await db.update(BetaAccessRequest)
        .set({
          passwordSent: passwordSent,
          notes: notes || null,
        })
        .where(eq(BetaAccessRequest.id, requestId));
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Password sent status updated`,
        }),
        { status: 200 }
      );
    }
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid status" }), {
        status: 400,
      });
    }
    
    // Find the request
    const accessRequest = await db.select().from(BetaAccessRequest)
      .where(eq(BetaAccessRequest.id, requestId))
      .get();
    
    if (!accessRequest) {
      return new Response(JSON.stringify({ error: "Access request not found" }), {
        status: 404,
      });
    }
    
    // Update the request
    await db.update(BetaAccessRequest)
      .set({
        status,
        processedAt: new Date(),
        notes: notes || null,
      })
      .where(eq(BetaAccessRequest.id, requestId));
    
    // If approved and password provided, generate a user-specific password entry
    if (status === 'approved' && password) {
      await db.insert(SiteSettings).values({
        key: `beta_password_${accessRequest.email}`,
        value: password,
        updatedAt: new Date(),
      });
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Beta access request ${status}`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating beta access request:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to update beta access request",
      }),
      { status: 500 }
    );
  }
};
