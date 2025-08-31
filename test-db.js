// Simple test to check database connection and data
import { db, SurveyResponses } from './db/config.js';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Query existing survey responses
    const responses = await db.select().from(SurveyResponses).limit(5);
    console.log('Existing survey responses:', responses.length);
    
    if (responses.length > 0) {
      console.log('Sample response:', {
        id: responses[0].id,
        name: `${responses[0].first_name} ${responses[0].last_name}`,
        email: responses[0].email,
        scores: {
          military: responses[0].military_score,
          civilian: responses[0].civilian_score
        }
      });
    }
    
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testDatabase();
