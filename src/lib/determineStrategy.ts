import type { AnswerItem } from '@/stores/answersStore';

export function determineStrategy(answers: Record<string, any>) {
  let militaryScore = 0;
  let civilianScore = 0;
  
  console.log('Raw answers object:', JSON.stringify(answers, null, 2));
  
  // Calculate scores from answers
  Object.entries(answers).forEach(([key, value]) => {
    console.log('Processing answer:', { key, value });
    
    if (value && 'axis' in value && 'offset' in value) {
      const answer = value;
      console.log('Valid answer found:', { key, axis: answer.axis, offset: answer.offset });
      
      if (answer.axis === 'X') {
        militaryScore += answer.offset;
        console.log('Added to military score:', { key, offset: answer.offset, newTotal: militaryScore });
      } else if (answer.axis === 'Y') {
        civilianScore += answer.offset;
        console.log('Added to civilian score:', { key, offset: answer.offset, newTotal: civilianScore });
      }
    } else {
      console.log('Skipping invalid answer:', { key, value });
    }
  });

  console.log('Military score:', militaryScore);
  console.log('Civilian score:', civilianScore);

  // Determine quadrant
  const highMilitary = militaryScore > 0;
  const highCivilian = civilianScore > 0;

  // Return strategy based on quadrant and log decision
  const strategy = (() => {
    if (highMilitary && highCivilian) return 'integration';
    if (highMilitary && !highCivilian) return 'separation';
    if (!highMilitary && highCivilian) return 'assimilation';
    return 'marginalization';
  })();
  
  console.log('determineStrategy decision:', {
    militaryScore,
    civilianScore,
    highMilitary,
    highCivilian,
    chosenStrategy: strategy
  });
  
  return strategy;
}
