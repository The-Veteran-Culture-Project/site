import { z, defineCollection } from "astro:content";

const axisQuestion = defineCollection({
  type: "data",
  schema: z.object({
    question: z.string(),
    category: z.string(),
    axis: z.enum(["X", "Y"]),
  }),
});

export const collections = {
  axisQuestions: axisQuestion,
};
