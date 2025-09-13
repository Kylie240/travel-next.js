import { z } from 'zod'

export const noteSchema = z.object({
    id: z.number(),
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    expanded: z.boolean(),
  })