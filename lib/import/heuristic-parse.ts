import type { ImportedItineraryDraft } from "@/lib/import/itinerary-draft-schema"

/**
 * Lightweight parser for clearly structured notes when no OpenAI key is set
 * (or as a soft fallback). Expects headings like "Day 1", "Day 2:", etc.
 */
export function heuristicParseItineraryText(raw: string): ImportedItineraryDraft {
  const text = raw.replace(/\r\n/g, "\n").trim()
  if (!text) {
    throw new Error("Paste some trip notes first.")
  }

  const lines = text.split("\n").map((l) => l.trimEnd())
  const dayBreak = /^(?:#{1,3}\s*)?(?:day\s*)(\d+)\b[:.\s-]*/i

  const chunks: { dayNum: number; lines: string[] }[] = []
  let current: { dayNum: number; lines: string[] } | null = null
  const preamble: string[] = []

  for (const line of lines) {
    const m = line.match(dayBreak)
    if (m) {
      current = { dayNum: Number(m[1]), lines: [] }
      chunks.push(current)
      const rest = line.replace(dayBreak, "").trim()
      if (rest) current.lines.push(rest)
      continue
    }
    if (current) current.lines.push(line)
    else if (line.trim()) preamble.push(line.trim())
  }

  if (chunks.length === 0) {
    // No day headings — treat whole doc as one day
    chunks.push({ dayNum: 1, lines: lines.filter(Boolean) })
  }

  const titleFromPreamble =
    preamble[0]?.replace(/^#+\s*/, "").slice(0, 50) ||
    "Imported trip"
  const shortDescription =
    preamble.slice(1).join(" ").slice(0, 300) ||
    preamble[0]?.slice(0, 300) ||
    "Imported from notes — review and edit before publishing."

  const days = chunks.map((chunk, index) => {
    const body = chunk.lines.filter((l) => l.trim().length > 0)
    const heading = body[0]?.slice(0, 50) || `Day ${chunk.dayNum}`
    const activityLines = body.slice(1).filter((l) => {
      const t = l.trim()
      return (
        t.startsWith("-") ||
        t.startsWith("*") ||
        t.startsWith("•") ||
        /^\d+[.)]/.test(t) ||
        t.length > 0
      )
    })

    const activities = activityLines.slice(0, 12).map((l) => {
      const cleaned = l.replace(/^[-*•]\s*/, "").replace(/^\d+[.)]\s*/, "").trim()
      const timeMatch = cleaned.match(/^(\d{1,2}:\d{2})\s*(.*)$/)
      return {
        title: (timeMatch?.[2] || cleaned).slice(0, 120) || "Activity",
        description: null as string | null,
        time: timeMatch?.[1] || null,
        location: null as string | null,
        type: null as number | null,
      }
    })

    // If we treated every line as activity and first was heading, drop empty
    const filtered =
      activities.length > 0
        ? activities
        : [{ title: "Explore", description: body.join("\n").slice(0, 500), time: null, location: null, type: null }]

    return {
      title: heading,
      cityName: "Unknown",
      countryName: "Unknown",
      description: body.slice(0, 3).join(" ").slice(0, 500) || null,
      activities: filtered.slice(0, 10),
    }
  })

  return {
    title: titleFromPreamble,
    shortDescription,
    detailedOverview: preamble.join("\n").slice(0, 4000) || null,
    budget: null,
    itineraryTags: [],
    days,
    notes: [],
  }
}
