import { z } from "zod";

export const accommodationSchema = z.object({
    name: z.string(),
    type: z.string(),
    location: z.string(),
    price: z.number().optional(),
    photos: z.array(z.string()).optional(),
    link: z.string().optional(),
})