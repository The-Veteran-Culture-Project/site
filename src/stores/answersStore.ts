export type BenefitsAnswers = {
  va_healthcare?: string;
  has_disability_rating?: string;
  disability_rating?: string;
  benefits_used?: string[];
  comfort_delay?: string;
  has_applied?: string;
  decision_time?: string;
  va_experience?: string;
  // New questions
  support_choice?: string;
  first_year_help?: string[];
  cash_benefits_use?: string;
};

export type ContactAnswers = {
  first_name?: string;
  last_name?: string;
  email?: string;
  subscribe?: boolean;
  story_opt_in?: boolean;
  future_contact?: boolean;
};

import { persistentAtom } from "@nanostores/persistent";

export interface AnswerItem {
  axis: string;
  offset: number;
  question: string;
}

// ...existing code...

export type AnswersStoreType = Record<string, AnswerItem | BenefitsAnswers | ContactAnswers>;

export const answersStore = persistentAtom<AnswersStoreType>(
  "answers",
  {},
  { encode: JSON.stringify, decode: JSON.parse },
);
