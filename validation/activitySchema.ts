import { z } from "zod";

export const activitySchema = z.object({
    id: z.number(),
    time: z.string().nullable().optional(),
    duration: z.number().nullable().optional(),
    image: z.string().nullable().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().nullable().optional(),
    type: z.number().nullable().optional(),
    link: z.string().nullable().optional(),
    photos: z.array(z.string()).nullable().optional(),
    price: z.number().nullable().optional(),
    showActivity: z.boolean().optional(),
    location: z.string().nullable().optional(),
  })