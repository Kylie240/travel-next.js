import { z } from 'zod'
import { daySchema } from './daySchema'
import { noteSchema } from './noteSchema'

export const createSchema = z.object({
    status: z.number(),
    title: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
    shortDescription: z.string().min(1, "Short description is required").max(300, "Short description must be less than 300 characters"),
    mainImage: z.string().url("Must provide an image"),
    detailedOverview: z.string().nullable().optional(),
    duration: z.number().min(1, "Length must be at least 1 day"),
    cities: z.array(z.object({
      city: z.string(),
      country: z.string(),
    })).optional(),
    days: z.array(daySchema).min(1, "At least one day is required"),
    itineraryTags: z.array(z.number()).max(5, "Maximum 5 tags allowed"),
    notes: z.array(noteSchema).nullable().optional(),
    budget: z.number().nullable().optional(),
  })