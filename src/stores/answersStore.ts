import { persistentAtom } from "@nanostores/persistent";

export interface AnswerItem {
  axis: string;
  offset: number;
  question: string;
}

export const answersStore = persistentAtom<Record<string, AnswerItem>>(
  "answers",
  {},
  { encode: JSON.stringify, decode: JSON.parse }
);
