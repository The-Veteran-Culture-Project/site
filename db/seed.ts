import { db, SurveyUser, SurveyResponses, Question, SiteSettings } from "astro:db";
import { eq } from "astro:db";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { getCollection } from "astro:content";
import fs from "node:fs/promises";
import path from "node:path";

export default async function seed() {
  // Check if admin user already exists
  const existingAdmin = await db.select().from(SurveyUser)
    .where(eq(SurveyUser.username, "admin"))
    .get();
  
  if (!existingAdmin) {
    // Create a hashed password for the admin user
    const hashedPassword = await bcrypt.hash("admin", 10);

    await db.insert(SurveyUser).values([
      {
        id: "admin-user",
        username: "admin",
        password: hashedPassword,
      },
    ]);
    console.log("Created admin user");
  }
  
  // Check if questions have already been migrated
  const existingQuestions = await db.select().from(Question).all();
  
  if (existingQuestions.length === 0) {
    try {
      // Get all questions from content collection
      const axisQuestions = await getCollection("axisQuestions");
      
      // Process and insert each question into the database
      for (const question of axisQuestions) {
        const { id: fileSlug, data } = question;
        
        await db.insert(Question).values({
          id: randomUUID(),
          text: data.question,
          category: data.category || "Uncategorized",
          axis: data.axis || "Y",
          version: 1,
          updatedAt: new Date(),
          updatedBy: "admin-user",
          fileSlug,
          active: true
        });
      }
      
      console.log(`Migrated ${axisQuestions.length} questions from content collection to database`);
    } catch (error) {
      console.error("Error migrating questions:", error);
    }
  }
  
  // Removed sample survey data seeding - we'll use real user data instead

  // Check if beta password setting exists
  const betaPasswordSetting = await db.select().from(SiteSettings)
    .where(eq(SiteSettings.key, "beta_password"))
    .get();
  
  if (!betaPasswordSetting) {
    // Insert default beta password
    await db.insert(SiteSettings).values({
      key: "beta_password",
      value: "vcp2025beta",  // Default beta password
      updatedAt: new Date(),
      updatedBy: "admin-user"
    });
    console.log("Created default beta password setting");
  }
}
