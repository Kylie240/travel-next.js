import { z } from 'zod'
import { daySchema } from './daySchema'
import { noteSchema } from './noteSchema'

export const createSchema = z.object({
    status: z.enum(['draft', 'published']),
    title: z.string().min(1, "Name is required"),
    shortDescription: z.string().min(1, "Short description is required"),
    mainImage: z.string().url("Must be a valid URL"),
    detailedOverview: z.string().optional(),
    duration: z.number().min(1, "Length must be at least 1 day"),
    countries: z.array(z.string()).min(1, "At least one country is required"),
    days: z.array(daySchema).min(1, "At least one day is required"),
    itineraryTags: z.array(z.string()).max(3, "Maximum 3 tags allowed"),
    notes: z.array(noteSchema),
    budget: z.number().optional(),
  })