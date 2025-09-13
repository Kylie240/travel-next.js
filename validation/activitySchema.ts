import { z } from "zod";

export const activitySchema = z.object({
    id: z.number(),
    time: z.string().optional(),
    duration: z.string().optional(),
    image: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    type: z.number().optional(),
    link: z.string().optional(),
    photos: z.array(z.string()).optional(),
    price: z.number().optional(),
  })