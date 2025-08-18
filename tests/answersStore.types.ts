// Type-only test file to ensure BenefitsAnswers shape is exported correctly
import type { BenefitsAnswers } from '../src/stores/answersStore';

// This file doesn't run at runtime; it's used by TypeScript to validate types.
// If shape changes, TypeScript will surface errors during `tsc` or `astro check`.

const example: BenefitsAnswers = {
  va_healthcare: 'Yes',
  has_disability_rating: 'No',
  disability_rating: '0%',
  benefits_used: ['GI Bill'],
  comfort_delay: 'I applied right away',
  has_applied: 'Yes',
  decision_time: 'Less than 3 months',
  va_experience: 'Good',
};

export default example;
