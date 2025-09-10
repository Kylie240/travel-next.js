import { z } from "zod";

export const activitySchema = z.object({
    id: z.string(),
    time: z.string().optional(),
    duration: z.string().optional(),
    image: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    type: z.string().optional(),
    link: z.string().url().optional().nullable(),
    photos: z.array(z.string()).optional(),
    price: z.number().optional(),
  })