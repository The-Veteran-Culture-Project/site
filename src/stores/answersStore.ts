import { atom } from "nanostores";

export const answersStore = atom<{
  [key: string]: { axis: string; offset: number };
}>({});
