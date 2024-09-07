import { generateIdFromEntropySize } from "lucia";
import { Argon2id } from "oslo/password";

import type { APIContext } from "astro";

export async function POST(context: APIContext): Promise<Response> {
  const { username, password } = await context.request.json();

  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 255 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return new Response("Invalid username", {
      status: 400,
    });
  }

  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return new Response("Invalid password", {
      status: 400,
    });
  }

  const userId = generateIdFromEntropySize(20);
  const hashedPassword = await new Argon2id().hash(password);
  console.log("hashedPassword", hashedPassword);

  return new Response(JSON.stringify({ hashedPassword, userId }), {});
}
