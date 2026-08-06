/**
 * Detects SEO / phone-scam spam itineraries (airline "ticket change" pages
 * stuffed with toll-free numbers and decorative unicode).
 */

export type ItinerarySpamInput = {
  title?: string | null
  shortDescription?: string | null
  detailedOverview?: string | null
  days?: Array<{
    title?: string | null
    description?: string | null
    notes?: string | null
    activities?: Array<{
      title?: string | null
      description?: string | null
    } | null> | null
  } | null> | null
  notes?: Array<{
    title?: string | null
    content?: string | null
  } | null> | null
}

export type ItinerarySpamResult = {
  isSpam: boolean
  reasons: string[]
}

/** US/CA toll-free and common scam support-line patterns */
const PHONE_PATTERN =
  /(?:\+?1[\s\-.]*)?(?:\(?\d{3}\)?[\s\-.]*)\d{3}[\s\-.]*\d{4}/g

const TOLL_FREE_PATTERN =
  /(?:\+?1[\s\-.]*)?(?:800|833|844|855|866|877|888)[\s\-.]*\d{3}[\s\-.]*\d{4}/gi

/** Decorative / Zalgo-ish spam often used in SEO titles */
const DECORATIVE_SPAM_PATTERN =
  /[★☆✦✧✨☄🔥🎀🎯🚀✅✈︎✈️『』⟶⟵∯▹❮❯【】⟨⟩«»]+/u

const SPAM_PHRASE_PATTERNS: RegExp[] = [
  /ticket\s*change\s*fee/i,
  /name\s*correction\s*policy/i,
  /same[- ]day\s*flight\s*change/i,
  /official\s*(faqs?|guide).{0,40}flight\s*change/i,
  /travel\s*policy\s*guide/i,
  /nowait/i,
  /customer\s*service.{0,40}(?:call|phone|toll)/i,
  /call\s*[☄★✦]/i,
]

const SPAM_MESSAGE =
  "This itinerary looks like spam or promotional phone-number content and cannot be published. Please remove phone numbers and unrelated promotional text."

function collectText(input: ItinerarySpamInput): string {
  const parts: string[] = [
    input.title ?? "",
    input.shortDescription ?? "",
    input.detailedOverview ?? "",
  ]

  for (const day of input.days ?? []) {
    if (!day) continue
    parts.push(day.title ?? "", day.description ?? "", day.notes ?? "")
    for (const activity of day.activities ?? []) {
      if (!activity) continue
      parts.push(activity.title ?? "", activity.description ?? "")
    }
  }

  for (const note of input.notes ?? []) {
    if (!note) continue
    parts.push(note.title ?? "", note.content ?? "")
  }

  return parts.join("\n")
}

function countMatches(text: string, pattern: RegExp): number {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`
  const re = new RegExp(pattern.source, flags)
  return (text.match(re) ?? []).length
}

export function detectItinerarySpam(input: ItinerarySpamInput): ItinerarySpamResult {
  const reasons: string[] = []
  const text = collectText(input)
  const title = input.title ?? ""

  const tollFreeCount = countMatches(text, TOLL_FREE_PATTERN)
  if (tollFreeCount >= 1) {
    reasons.push("toll_free_phone")
  }

  const phoneCount = countMatches(text, PHONE_PATTERN)
  if (phoneCount >= 2) {
    reasons.push("repeated_phone_numbers")
  }

  if (DECORATIVE_SPAM_PATTERN.test(title) && (phoneCount >= 1 || SPAM_PHRASE_PATTERNS.some((p) => p.test(text)))) {
    reasons.push("decorative_title_spam")
  }

  const phraseHits = SPAM_PHRASE_PATTERNS.filter((p) => p.test(text)).length
  if (phraseHits >= 2 || (phraseHits >= 1 && phoneCount >= 1)) {
    reasons.push("airline_support_spam_phrases")
  }

  // Title that is mostly symbols / emoji rather than a trip name
  const symbolHeavy =
    title.length >= 8 &&
    (title.match(/[^\p{L}\p{N}\s]/gu) ?? []).length / title.length >= 0.25
  if (symbolHeavy && (phoneCount >= 1 || phraseHits >= 1)) {
    reasons.push("symbol_heavy_spam_title")
  }

  return {
    isSpam: reasons.length > 0,
    reasons,
  }
}

export function assertItineraryNotSpam(input: ItinerarySpamInput): void {
  const result = detectItinerarySpam(input)
  if (result.isSpam) {
    console.warn("[moderation] blocked spam itinerary", result.reasons)
    throw new Error(SPAM_MESSAGE)
  }
}
