import { z } from "zod";

export const activitySchema = z.object({
    id: z.string(),
    time: z.string().optional(),
    duration: z.string().optional(),
    image: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required").optional(),
    type: z.string().optional(),
    link: z.string().url("Must be a valid URL").optional(),
    photos: z.array(z.string()).optional(),
    price: z.number().optional(),
  })