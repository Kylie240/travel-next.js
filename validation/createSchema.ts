import { z } from 'zod'
import { daySchema } from './daySchema'
import { noteSchema } from './noteSchema'

export const createSchema = z.object({
    status: z.number(),
    title: z.string().min(1, "Name is required").max(75, "Name must be less than 75 characters"),
    shortDescription: z.string().min(1, "Short description is required").max(300, "Short description must be less than 300 characters"),
    mainImage: z.string().url("Must be a valid URL"),
    detailedOverview: z.string().nullable().optional(),
    duration: z.number().min(1, "Length must be at least 1 day"),
    countries: z.array(z.string()).min(1, "At least one country is required"),
    cities: z.array(z.object({
      city: z.string(),
      country: z.string(),
    })).min(1, "At least one city is required"),
    days: z.array(daySchema).min(1, "At least one day is required"),
    itineraryTags: z.array(z.number()).max(5, "Maximum 5 tags allowed"),
    notes: z.array(noteSchema).nullable().optional(),
    budget: z.number().nullable().optional(),
  })