import { z } from "zod"

/** Structured draft returned by import (paste / URL) — maps onto the create form. */
export const importedActivitySchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional().nullable(),
  time: z.string().max(16).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  /** Activity tag id from activityTagsMap when known */
  type: z.number().int().min(1).max(21).optional().nullable(),
})

export const importedDaySchema = z.object({
  title: z.string().min(1).max(50),
  cityName: z.string().min(1).max(80),
  countryName: z.string().min(1).max(80),
  description: z.string().max(2000).optional().nullable(),
  activities: z.array(importedActivitySchema).max(20).default([]),
})

export const importedItineraryDraftSchema = z.object({
  title: z.string().min(1).max(50),
  shortDescription: z.string().min(1).max(300),
  detailedOverview: z.string().max(8000).optional().nullable(),
  budget: z.number().nonnegative().nullable().optional(),
  itineraryTags: z.array(z.number().int().min(1).max(38)).max(5).default([]),
  days: z.array(importedDaySchema).min(1).max(30),
  notes: z
    .array(
      z.object({
        title: z.string().max(100),
        content: z.string().max(4000),
      })
    )
    .max(10)
    .default([]),
})

export type ImportedItineraryDraft = z.infer<typeof importedItineraryDraftSchema>

export type ImportItineraryResult = {
  draft: ImportedItineraryDraft
  source: "ai" | "heuristic"
  warnings: string[]
}
