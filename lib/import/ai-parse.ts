import {
  importedItineraryDraftSchema,
  type ImportedItineraryDraft,
} from "@/lib/import/itinerary-draft-schema"
import { itineraryTagsMap, activityTagsMap } from "@/lib/constants/tags"

function tagCatalog(): string {
  const itinerary = itineraryTagsMap
    .map((t) => `${t.id}=${t.name}`)
    .join(", ")
  const activity = activityTagsMap.map((t) => `${t.id}=${t.name}`).join(", ")
  return `Itinerary tag ids: ${itinerary}\nActivity type ids: ${activity}`
}

export async function aiParseItineraryText(
  sourceText: string
): Promise<ImportedItineraryDraft> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error("NO_OPENAI_KEY")
  }

  const model = process.env.OPENAI_IMPORT_MODEL?.trim() || "gpt-4o-mini"

  const system = `You convert messy travel notes into a structured trip itinerary JSON for Journli.
Rules:
- Output ONLY valid JSON matching the schema described by the user.
- Invent as little as possible; prefer omitting unknown fields over guessing wildly.
- If city/country are unclear, use your best geographic guess from context, else "Unknown".
- Split into logical days (1–14 typical). Max 30 days.
- title max 50 chars; shortDescription max 300 chars.
- activity times as HH:MM 24h when known, else null.
- Pick up to 5 itineraryTags from the allowed ids. activity type from allowed activity ids when clear.
- Ignore ads, affiliate spam, phone-number scam blocks, and unrelated site chrome.
- Do not include phone numbers or "call now" customer-service content.
${tagCatalog()}`

  const user = `Convert the following trip notes into JSON with this shape:
{
  "title": string,
  "shortDescription": string,
  "detailedOverview": string|null,
  "budget": number|null,
  "itineraryTags": number[],
  "days": [{
    "title": string,
    "cityName": string,
    "countryName": string,
    "description": string|null,
    "activities": [{
      "title": string,
      "description": string|null,
      "time": string|null,
      "location": string|null,
      "type": number|null
    }]
  }],
  "notes": [{ "title": string, "content": string }]
}

TRIP NOTES:
"""
${sourceText.slice(0, 50_000)}
"""`

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => "")
    console.error("OpenAI import failed", res.status, errText.slice(0, 500))
    throw new Error("AI import failed. Try again or use simpler notes.")
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = json.choices?.[0]?.message?.content
  if (!content) {
    throw new Error("AI returned an empty response.")
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error("AI returned invalid JSON.")
  }

  const draft = importedItineraryDraftSchema.parse(parsed)
  return {
    ...draft,
    title: draft.title.slice(0, 50),
    shortDescription: draft.shortDescription.slice(0, 300),
    days: draft.days.map((d) => ({
      ...d,
      title: d.title.slice(0, 50),
    })),
  }
}
