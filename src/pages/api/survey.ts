import type { APIContext } from "astro";
import { z } from "zod";
import { db, Survey } from "astro:db";

const surveySchema = z.object({
  answers: z.record(z.string(), z.any()), // Adjust the schema as per your requirements
  x_offset: z.number(),
  y_offset: z.number(),
});

export async function POST(context: APIContext): Promise<Response> {
  const user = context.locals.user;

  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }
  try {
    const info = await context.request.json();
    const validationResult = surveySchema.safeParse(info);

    if (!validationResult.success) {
      return new Response(JSON.stringify({ message: "Invalid survey data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { answers, x_offset, y_offset } = validationResult.data;

    const uuid = crypto.randomUUID();

    await db
      .insert(Survey)
      .values({
        id: uuid,
        answers,
        x_offset,
        y_offset,
        surveyUser: user.id,
        takenAt: new Date(),
      })
      .execute();

    return new Response(
      JSON.stringify({ message: "Success", survey_id: uuid }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error inserting survey", error);
    return new Response(JSON.stringify({ message: "Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
