import { persistentAtom } from "@nanostores/persistent";

export type AnswerItem = {
  axis: string;
  offset: number;
};

export const answersStore = persistentAtom<{
  [key: string]: { axis: string; offset: number };
}>("answers", {}, { encode: JSON.stringify, decode: JSON.parse });
