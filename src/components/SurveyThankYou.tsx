import { useStore } from '@nanostores/react';
import { answersStore } from '@/stores/answersStore.ts';
import type { BenefitsAnswers, ContactAnswers } from '@/stores/answersStore';
import { StrategyDefinition } from './StrategyDefinition';

export default function SurveyThankYou() {
  const store = useStore(answersStore);
  
  // Debug logging
  console.log('Store contents:', store);
  
  // Check if we have any survey data
  const hasData = Object.keys(store).length > 0;
  console.log('Has data:', hasData);
  
  const va_benefits = store.va_benefits as BenefitsAnswers;
  const contact = store.contact as ContactAnswers;

  if (!hasData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl bg-black text-white p-8 rounded-lg shadow text-center">
          <h2 className="text-3xl font-bold mb-6">No Survey Data Found</h2>
          <p className="text-lg mb-6">It looks like you haven't completed the survey yet.</p>
          <a href="/survey/demographics" className="bg-[#CBB87C] text-black font-bold px-6 py-3 rounded-lg hover:bg-[#b8a75c] transition duration-200">
            Start Survey
          </a>
        </div>
      </div>
    );
  }

  // Function to determine strategy based on answers
  const determineStrategy = () => {
    let militaryScore = 0;
    let civilianScore = 0;
    
    console.log('Calculating strategy from store:', store);
    
    // Calculate scores from answers
    Object.entries(store).forEach(([key, value]) => {
      console.log('Processing answer:', key, value);
      if (typeof value === 'object' && 'axis' in value && 'offset' in value) {
        const answer = value as { axis: string; offset: number };
        console.log('Valid answer found:', answer);
        if (answer.axis === 'military') {
          militaryScore += answer.offset;
        } else if (answer.axis === 'civilian') {
          civilianScore += answer.offset;
        }
      }
    });

    console.log('Final scores:', { militaryScore, civilianScore });

    // Normalize scores to determine quadrant
    const highMilitary = militaryScore > 0;
    const highCivilian = civilianScore > 0;

    const strategy = (highMilitary && highCivilian) ? "integration" :
                    (highMilitary && !highCivilian) ? "separation" :
                    (!highMilitary && highCivilian) ? "assimilation" :
                    "marginalization" as const;

    console.log('Determined strategy:', strategy);
    return strategy;
  };

  const strategy = determineStrategy();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl bg-black text-white p-8 rounded-lg shadow space-y-8">
        <h2 className="text-3xl font-bold text-center">Thank You for Your Service & Participation!</h2>
        
        <div className="bg-gray-900 p-6 rounded-lg space-y-4">
          <p className="text-lg">
            Your responses have been recorded and will help us better understand the veteran experience. 
            Thank you for taking the time to share your story with us.
          </p>
          
          {contact?.subscribe && (
            <p className="text-[#CBB87C] font-semibold">
              ✓ You'll receive updates about this research project at {contact.email}
            </p>
          )}
          
          {contact?.story_opt_in && (
            <p className="text-[#CBB87C] font-semibold">
              ✓ Thank you for being willing to share your story for research purposes
            </p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-center">Your Results</h3>
          <p className="text-center text-zinc-300">
            Based on your responses, your experience aligns with the following strategy:
          </p>
          <StrategyDefinition strategy={strategy} />
        </div>

        {/* Survey Summary */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold">Survey Summary</h3>
          
          {contact && (
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Contact Information</h4>
              <p>Name: {contact.first_name} {contact.last_name}</p>
              {contact.email && <p>Email: {contact.email}</p>}
            </div>
          )}

          {va_benefits && (
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">VA Benefits Information</h4>
              <div className="space-y-2">
                {va_benefits.has_applied && (
                  <p><strong>Applied for VA Benefits:</strong> {va_benefits.has_applied}</p>
                )}
                {va_benefits.benefits_used && va_benefits.benefits_used.length > 0 && (
                  <p><strong>Benefits Used:</strong> {va_benefits.benefits_used.join(', ')}</p>
                )}
                {va_benefits.has_disability_rating && (
                  <p><strong>Has Disability Rating:</strong> {va_benefits.has_disability_rating}</p>
                )}
                {va_benefits.disability_rating && (
                  <p><strong>Disability Rating:</strong> {va_benefits.disability_rating}</p>
                )}
                {va_benefits.support_choice && (
                  <p><strong>Preferred Support Type:</strong> {va_benefits.support_choice}</p>
                )}
                {va_benefits.first_year_help && va_benefits.first_year_help.length > 0 && (
                  <p><strong>First Year Help:</strong> {va_benefits.first_year_help.join(', ')}</p>
                )}
                {va_benefits.cash_benefits_use && (
                  <p><strong>Cash Benefits Opinion:</strong> {va_benefits.cash_benefits_use}</p>
                )}
              </div>
            </div>
          )}

          {/* Show axis questions if any exist */}
          {Object.keys(store).some(key => key !== 'va_benefits' && key !== 'contact') && (
            <div className="bg-gray-900 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Survey Responses</h4>
              <p className="text-gray-300">
                {Object.keys(store).filter(key => key !== 'va_benefits' && key !== 'contact').length} axis questions completed
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-6 mt-10">
          <a href="/survey/demographics" className="bg-[#CBB87C] text-black font-bold px-6 py-3 rounded-lg hover:bg-[#b8a75c] transition duration-200">
            Take Survey Again
          </a>
          <a href="/" className="bg-gray-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-200">
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
