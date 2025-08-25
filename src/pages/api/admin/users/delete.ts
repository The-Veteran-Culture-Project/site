import type { APIRoute } from "astro";
import { lucia } from "@/lib/auth";
import { db, SurveyUser, LoginActivity, Session } from "astro:db";
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
    const { userId } = await request.json();

    // Prevent user from deleting themselves
    if (userId === user.id) {
      return new Response("Cannot delete your own account", { status: 400 });
    }

    // Check if user exists
    const userToDelete = await db.select().from(SurveyUser)
      .where(eq(SurveyUser.id, userId))
      .get();

    if (!userToDelete) {
      return new Response("User not found", { status: 404 });
    }

    // Delete related records first (login activity, sessions)
    await db.delete(LoginActivity).where(eq(LoginActivity.userId, userId));
    await db.delete(Session).where(eq(Session.userId, userId));
    
    // Delete the user
    await db.delete(SurveyUser).where(eq(SurveyUser.id, userId));

    return new Response("User deleted successfully");
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response("Internal server error", { status: 500 });
  }
};
