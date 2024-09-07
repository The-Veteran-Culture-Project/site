import { generateIdFromEntropySize } from "lucia";
import { hash } from "@node-rs/argon2";

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
  const hashedPassword = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  console.log("hashedPassword", hashedPassword);

  return new Response(JSON.stringify({ hashedPassword, userId }), {});
}
