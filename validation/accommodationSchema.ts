import { z } from "zod";

export const accommodationSchema = z.object({
    name: z.string().nullable().optional(),
    type: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    price: z.number().nullable().optional(),
    photos: z.array(z.string()).nullable().optional(),
    link: z.string().nullable().optional(),
})