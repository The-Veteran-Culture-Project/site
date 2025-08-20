import { db, Question, SurveyUser, QuestionHistory } from "astro:db";
import { lucia } from "@/lib/auth";
import { randomUUID } from "node:crypto";
import { eq } from "astro:db";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET({ cookies, request }: { cookies: any, request: Request }) {
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

    // Fetch questions from database
    const questions = await db.select().from(Question).all();
    return new Response(JSON.stringify(questions), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error" }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
}

export async function POST({ cookies, request }: { cookies: any, request: Request }) {
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

    // Get request body
    const requestData = await request.json();
    
    // Basic validation
    if (!requestData.text || !requestData.category || !requestData.axis) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { 
        status: 400, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // Create a slug from the question text
    let fileSlug = requestData.text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 100);

    // Add a UUID suffix to ensure uniqueness
    const shortId = randomUUID().split('-')[0];
    fileSlug = `${fileSlug}-${shortId}`;

    // Create new question in database
    const questionId = randomUUID();
    const now = new Date();

    // Insert into database
    await db.insert(Question).values({
      id: questionId,
      text: requestData.text,
      category: requestData.category,
      axis: requestData.axis,
      version: 1,
      updatedAt: now,
      updatedBy: session.user.id,
      fileSlug,
      active: requestData.active !== undefined ? requestData.active : true
    });

    // Create corresponding JSON file in content collection
    const contentDir = path.join(process.cwd(), "src", "content", "axisQuestions");
    const filePath = path.join(contentDir, `${fileSlug}.json`);
    
    // Ensure directory exists
    try {
      await fs.mkdir(contentDir, { recursive: true });
    } catch (err) {
      // Directory may already exist, ignore error
    }

    // Write to file
    await fs.writeFile(filePath, JSON.stringify({
      question: requestData.text,
      axis: requestData.axis,
      category: requestData.category
    }, null, 2), 'utf-8');

    // Fetch the newly created question
    const newQuestion = await db.select().from(Question)
      .where(eq(Question.id, questionId))
      .get();

    return new Response(JSON.stringify(newQuestion), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Error creating question:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
}
