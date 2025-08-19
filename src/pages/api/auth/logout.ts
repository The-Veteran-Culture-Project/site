import { lucia } from "@/lib/auth";
import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
  const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return new Response(null, {
      status: 401
    });
  }
  const { session } = await lucia.validateSession(sessionId);
  if (!session) {
    return new Response(null, {
      status: 401
    });
  }
  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/admin/login",
      "Set-Cookie": sessionCookie.serialize()
    }
  });
};
