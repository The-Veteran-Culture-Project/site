import type { APIContext } from "astro";
import { z } from "zod";
import { db, Survey } from "astro:db";

const surveySchema = z.object({
  answers: z.record(z.string(), z.any()),
  x_offset: z.number(),
  y_offset: z.number(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  veteranStatus: z.enum(["Active Military", "Veteran", "Civilian"]),
});

export async function POST(context: APIContext): Promise<Response> {
  // Removed user authentication check to allow survey submission for all users
  try {
    const info = await context.request.json();
    const validationResult = surveySchema.safeParse(info);

    if (!validationResult.success) {
      return new Response(JSON.stringify({ message: "Invalid survey data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }


    const { answers, x_offset, y_offset, firstName, lastName, email, veteranStatus } = validationResult.data;

    const uuid = crypto.randomUUID();

    await db
      .insert(Survey)
      .values({
        id: uuid,
        answers,
        x_offset,
        y_offset,
        firstName,
        lastName,
        email,
        veteranStatus,
        takenAt: new Date(),
      })
      .execute();

    const headers = new Headers();
    headers.append("Set-Cookie", `survey_id=${uuid}; Path=/; HttpOnly`);

    return new Response(
      JSON.stringify({ message: "Success", survey_id: uuid }),
      {
        status: 201,
        headers,
      },
    );
  } catch (error) {
    console.error("Error inserting survey", error);
    return new Response(JSON.stringify({ message: "Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
