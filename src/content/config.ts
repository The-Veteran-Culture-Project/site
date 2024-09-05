import { z, defineCollection } from "astro:content";

const multipleChoiceQuestionsCollection = defineCollection({
  type: "data",
  schema: z.object({
    question: z.string(),
    choice_a: z.string(),
    choice_b: z.string(),
    choice_c: z.string(),
    choice_d: z.string(),
  }),
});

const axisQuestion = defineCollection({
  type: "data",
  schema: z.object({
    question: z.string(),
    category: z.string(),
    axis: z.enum(["X", "Y"]),
  }),
});

export const collections = {
  multiChoiceQuestions: multipleChoiceQuestionsCollection,
  axisQuestions: axisQuestion,
};
