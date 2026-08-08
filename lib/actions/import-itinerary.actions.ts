"use server"

import createClient from "@/utils/supabase/server"
import { checkRateLimit } from "@/lib/auth/rate-limit"
import { detectItinerarySpam } from "@/lib/moderation/itinerary-spam"
import { aiParseItineraryText } from "@/lib/import/ai-parse"
import { heuristicParseItineraryText } from "@/lib/import/heuristic-parse"
import { fetchUrlAsText, looksLikeUrl } from "@/lib/import/fetch-url-text"
import type { ImportItineraryResult } from "@/lib/import/itinerary-draft-schema"

const MIN_CHARS = 40
const MAX_CHARS = 60_000

export async function importItineraryFromText(input: {
  text?: string
  url?: string
}): Promise<ImportItineraryResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Please log in to import an itinerary.")
  }

  const rl = await checkRateLimit({
    key: `import-itinerary:${user.id}`,
    limit: 8,
    windowMs: 60 * 60 * 1000,
  })
  if (!rl.allowed) {
    throw new Error(
      `Import limit reached. Try again in about ${rl.retryAfterSec} seconds.`
    )
  }

  let sourceText = (input.text || "").trim()
  const url = (input.url || "").trim()

  if (url) {
    sourceText = await fetchUrlAsText(url)
  } else if (looksLikeUrl(sourceText)) {
    sourceText = await fetchUrlAsText(sourceText)
  }

  if (sourceText.length < MIN_CHARS) {
    throw new Error(
      "Need a bit more detail — paste at least a short day-by-day outline."
    )
  }
  if (sourceText.length > MAX_CHARS) {
    sourceText = sourceText.slice(0, MAX_CHARS)
  }

  const warnings: string[] = []
  let draft
  let source: "ai" | "heuristic" = "ai"

  try {
    draft = await aiParseItineraryText(sourceText)
  } catch (err) {
    const message = err instanceof Error ? err.message : ""
    if (message === "NO_OPENAI_KEY") {
      draft = heuristicParseItineraryText(sourceText)
      source = "heuristic"
      warnings.push(
        "AI import isn’t configured (OPENAI_API_KEY), so we used a simple text parser. Review cities and activities carefully."
      )
    } else {
      // Soft fallback if the model fails
      try {
        draft = heuristicParseItineraryText(sourceText)
        source = "heuristic"
        warnings.push(
          "AI import had trouble with that content, so we used a simple parser. Review and edit before publishing."
        )
      } catch {
        throw err instanceof Error
          ? err
          : new Error("Couldn’t import that content.")
      }
    }
  }

  const spam = detectItinerarySpam({
    title: draft.title,
    shortDescription: draft.shortDescription,
    detailedOverview: draft.detailedOverview,
    days: draft.days,
    notes: draft.notes,
  })
  if (spam.isSpam) {
    throw new Error(
      "That content looks like spam or phone-number promo text and can’t be imported."
    )
  }

  if (draft.days.some((d) => d.cityName === "Unknown" || d.countryName === "Unknown")) {
    warnings.push("Some days are missing city/country — fill those in on the schedule step.")
  }

  warnings.push("Add a cover photo before publishing.")

  return { draft, source, warnings }
}
