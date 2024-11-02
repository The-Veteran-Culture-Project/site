import type { APIContext } from "astro";

export async function POST(context: APIContext): Promise<Response> {
  const user = context.locals.user;

  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  return new Response(JSON.stringify({ message: "Success" }), { status: 201 });
}
