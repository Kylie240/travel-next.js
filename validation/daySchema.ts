import { z } from 'zod'
import { activitySchema } from './activitySchema'
import { accommodationSchema } from './accomodationSchema'

export const daySchema = z.object({
    id: z.string(),
    image: z.string().optional(),
    cityName: z.string().min(1, "City name is required"),
    countryName: z.string().min(1, "Country name is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    notes: z.string().optional(),
    activities: z.array(activitySchema),
    showAccommodation: z.boolean(),
    accommodation: accommodationSchema,
  })