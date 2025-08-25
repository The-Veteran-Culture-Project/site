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
        role: "admin",
        email: "admin@veterancultureproject.org",
        created_at: new Date(),
        is_active: true,
      },
    ]);
    console.log("Created admin user");
  } else {
    // Update existing admin user to have the new fields if they don't exist
    if (!existingAdmin.role || !existingAdmin.email || !existingAdmin.created_at) {
      await db.update(SurveyUser)
        .set({ 
          role: existingAdmin.role || "admin",
          email: existingAdmin.email || "admin@veterancultureproject.org",
          created_at: existingAdmin.created_at || new Date(),
          is_active: existingAdmin.is_active !== undefined ? existingAdmin.is_active : true
        })
        .where(eq(SurveyUser.id, existingAdmin.id));
      console.log("Updated existing admin user with new fields");
    }
  }

  // Create additional sample admin users if they don't exist
  const sampleAdmins = [
    {
      id: "admin-josh",
      username: "josh",
      email: "josh@veterancultureproject.org",
      password: "temppass123"
    },
    {
      id: "admin-researcher",
      username: "researcher",
      email: "researcher@veterancultureproject.org", 
      password: "research123"
    }
  ];

  for (const admin of sampleAdmins) {
    const existing = await db.select().from(SurveyUser)
      .where(eq(SurveyUser.username, admin.username))
      .get();
    
    if (!existing) {
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      await db.insert(SurveyUser).values({
        id: admin.id,
        username: admin.username,
        password: hashedPassword,
        role: "admin",
        email: admin.email,
        created_at: new Date(),
        is_active: true,
      });
      console.log(`Created admin user: ${admin.username}`);
    }
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
