import { persistentAtom } from "@nanostores/persistent";

export interface AnswerItem {
  axis: string;
  offset: number;
}

export const answersStore = persistentAtom<
  Record<string, { axis: string; offset: number }>
>("answers", {}, { encode: JSON.stringify, decode: JSON.parse });
