import { z } from 'zod'

export const noteSchema = z.object({
    id: z.number(),
    title: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    expanded: z.boolean(),
  })