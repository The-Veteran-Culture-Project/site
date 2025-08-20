import { db, Question, QuestionHistory } from "astro:db";
import { lucia } from "@/lib/auth";
import { randomUUID } from "node:crypto";
import { eq } from "astro:db";
import fs from "node:fs/promises";
import path from "node:path";

export async function PUT({ cookies, request, params }: { cookies: any, request: Request, params: any }) {
  // Validate admin authentication
  const sessionId = cookies.get(lucia.sessionCookieName)?.value;
  if (!sessionId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  try {
    const session = await lucia.validateSession(sessionId);
    if (!session.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const { id } = params;
    const requestData = await request.json();
    
    // Basic validation
    if (!requestData.text || !requestData.category || !requestData.axis) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { 
        status: 400, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // Get existing question
    const existingQuestion = await db.select().from(Question)
      .where(eq(Question.id, id))
      .get();

    if (!existingQuestion) {
      return new Response(JSON.stringify({ error: "Question not found" }), { 
        status: 404, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // Save the current version to history before updating
    if (existingQuestion.text !== requestData.text || existingQuestion.category !== requestData.category || existingQuestion.axis !== requestData.axis) {
      await db.insert(QuestionHistory).values({
        id: randomUUID(),
        questionId: existingQuestion.id,
        text: existingQuestion.text,
        category: existingQuestion.category,
        axis: existingQuestion.axis,
        version: existingQuestion.version,
        updatedAt: existingQuestion.updatedAt,
        updatedBy: existingQuestion.updatedBy
      });
    }

    // Update the question
    const now = new Date();
    await db.update(Question)
      .set({
        text: requestData.text,
        category: requestData.category,
        axis: requestData.axis,
        version: existingQuestion.version + 1,
        updatedAt: now,
        updatedBy: session.user.id,
        active: requestData.active !== undefined ? requestData.active : existingQuestion.active
      })
      .where(eq(Question.id, id));

    // Update the content file
    const contentDir = path.join(process.cwd(), "src", "content", "axisQuestions");
    const filePath = path.join(contentDir, `${existingQuestion.fileSlug}.json`);
    
    // Update file
    await fs.writeFile(filePath, JSON.stringify({
      question: requestData.text,
      axis: requestData.axis,
      category: requestData.category
    }, null, 2), 'utf-8');

    // Fetch updated question
    const updatedQuestion = await db.select().from(Question)
      .where(eq(Question.id, id))
      .get();

    return new Response(JSON.stringify(updatedQuestion), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Error updating question:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
}

export async function DELETE({ cookies, params }: { cookies: any, params: any }) {
  // Validate admin authentication
  const sessionId = cookies.get(lucia.sessionCookieName)?.value;
  if (!sessionId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  try {
    const session = await lucia.validateSession(sessionId);
    if (!session.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const { id } = params;

    // Get existing question
    const existingQuestion = await db.select().from(Question)
      .where(eq(Question.id, id))
      .get();

    if (!existingQuestion) {
      return new Response(JSON.stringify({ error: "Question not found" }), { 
        status: 404, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // Archive the question in history
    await db.insert(QuestionHistory).values({
      id: randomUUID(),
      questionId: existingQuestion.id,
      text: existingQuestion.text,
      category: existingQuestion.category,
      axis: existingQuestion.axis,
      version: existingQuestion.version,
      updatedAt: existingQuestion.updatedAt,
      updatedBy: existingQuestion.updatedBy
    });

    // Delete the question from database
    await db.delete(Question).where(eq(Question.id, id));

    // Delete the content file
    const contentDir = path.join(process.cwd(), "src", "content", "axisQuestions");
    const filePath = path.join(contentDir, `${existingQuestion.fileSlug}.json`);
    
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error(`Failed to delete file ${filePath}:`, err);
      // Continue even if file deletion fails
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Error deleting question:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
}
