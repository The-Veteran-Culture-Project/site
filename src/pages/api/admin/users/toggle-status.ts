import type { APIRoute } from "astro";
import { lucia } from "@/lib/auth";
import { db, SurveyUser } from "astro:db";
import { eq } from "astro:db";

export const POST: APIRoute = async ({ request, cookies }) => {
  const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check if current user is admin
  const currentUser = await db.select().from(SurveyUser)
    .where(eq(SurveyUser.id, user.id))
    .get();

  if (!currentUser || currentUser.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const { userId, status } = await request.json();

    // Prevent user from deactivating themselves
    if (userId === user.id) {
      return new Response("Cannot modify your own status", { status: 400 });
    }

    // Update user status
    await db.update(SurveyUser)
      .set({ is_active: status })
      .where(eq(SurveyUser.id, userId));

    return new Response("User status updated successfully");
  } catch (error) {
    console.error("Error updating user status:", error);
    return new Response("Internal server error", { status: 500 });
  }
};
