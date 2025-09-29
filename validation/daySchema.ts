import { z } from 'zod'
import { activitySchema } from './activitySchema'
import { accommodationSchema } from './accommodationSchema'

export const daySchema = z.object({
    id: z.number(),
    image: z.string().nullable().optional(),
    cityName: z.string().min(1, "City name is required"),
    provinceName: z.string().nullable().optional(),
    countryName: z.string().min(1, "Country name is required"),
    title: z.string().min(1, "Title is required").max(75, "Title must be less than 75 characters"),
    description: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    activities: z.array(activitySchema).optional(),
    showAccommodation: z.boolean().optional(),
    accommodation: accommodationSchema.optional(),
  })