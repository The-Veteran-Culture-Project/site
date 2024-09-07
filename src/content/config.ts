import { z, defineCollection } from "astro:content";

const axisQuestion = defineCollection({
  type: "data",
  schema: z.object({
    question: z.string(),
    category: z.string(),
    axis: z.enum(["X", "Y"]),
  }),
});

const teamMembers = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    title: z.string(),
    bio: z.string(),
    avatar: z.string(),
  }),
});

export const collections = {
  axisQuestions: axisQuestion,
  teamMembers: teamMembers,
};
