import type { APIRoute } from "astro";
import { db, SurveyResponses } from "astro:db";
import { randomUUID } from "node:crypto";

// This endpoint will seed survey response data for testing purposes
export const GET: APIRoute = async () => {
  try {
    // Check if we have any existing responses
    const existingCount = await db.select().from(SurveyResponses).all();
  
    if (existingCount.length === 0) {
      // Add example survey responses
      await db.insert(SurveyResponses).values([
        {
          id: randomUUID(),
          created_at: new Date(),
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          military_score: 65,
          civilian_score: 35,
          strategy: "Balanced Veteran",
          demographics: {
            age_range: "35-44",
            gender: "Male",
            race: ["White"],
            military_status: "Veteran",
            combat: "Yes"
          },
          va_benefits: {
            has_applied: "Yes",
            benefits_used: ["GI Bill", "VA Healthcare"],
            has_disability_rating: "Yes",
            disability_rating: "70%",
            comfort_delay: "Somewhat comfortable",
            decision_time: "3-6 months",
            va_healthcare: "Positive impact"
          }
        },
        {
          id: randomUUID(),
          created_at: new Date(Date.now() - 86400000), // 1 day ago
          first_name: "Jane",
          last_name: "Smith",
          email: "jane.smith@example.com",
          military_score: 40,
          civilian_score: 75,
          strategy: "Civilian Identity",
          demographics: {
            age_range: "25-34",
            gender: "Female",
            race: ["Black or African American"],
            military_status: "Active Duty",
            combat: "No"
          },
          va_benefits: {
            has_applied: "No",
            benefits_used: [],
            has_disability_rating: "No",
            comfort_delay: "Not applicable",
            decision_time: "Not applicable",
            va_healthcare: "No impact"
          }
        },
        {
          id: randomUUID(),
          created_at: new Date(Date.now() - 172800000), // 2 days ago
          first_name: "Robert",
          last_name: "Johnson",
          email: "robert.j@example.com",
          military_score: 85,
          civilian_score: 20,
          strategy: "Military Identity",
          demographics: {
            age_range: "45-54",
            gender: "Male",
            race: ["Hispanic or Latino", "White"],
            military_status: "Retired",
            combat: "Yes"
          },
          va_benefits: {
            has_applied: "Yes",
            benefits_used: ["VA Healthcare", "Disability Compensation", "VR&E"],
            has_disability_rating: "Yes",
            disability_rating: "100%",
            comfort_delay: "Very comfortable",
            decision_time: "6-12 months",
            va_healthcare: "Very positive impact"
          }
        }
      ]);
      
      return new Response(JSON.stringify({
        success: true,
        message: "Added 3 sample survey responses"
      }));
    } else {
      return new Response(JSON.stringify({
        success: true,
        message: "Survey responses already exist",
        count: existingCount.length
      }));
    }
  } catch (error) {
    console.error("Error seeding data:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "Error seeding data",
      error: error instanceof Error ? error.message : String(error)
    }), { status: 500 });
  }
};
