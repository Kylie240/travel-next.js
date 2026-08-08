const MAX_BYTES = 400_000
const FETCH_TIMEOUT_MS = 12_000

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|h[1-6]|li|br|tr|section|article)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
}

/** Fetch a public http(s) page and return readable text (best-effort). */
export async function fetchUrlAsText(urlString: string): Promise<string> {
  let url: URL
  try {
    url = new URL(urlString.trim())
  } catch {
    throw new Error("That doesn’t look like a valid URL.")
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http(s) links are supported.")
  }

  // Block obvious local/metadata targets
  const host = url.hostname.toLowerCase()
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    host === "metadata.google.internal"
  ) {
    throw new Error("That URL can’t be imported.")
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "JournliImporter/1.0 (+https://www.journli.com)",
        Accept: "text/html,text/plain,application/xhtml+xml",
      },
    })

    if (!res.ok) {
      throw new Error(`Couldn’t fetch that link (HTTP ${res.status}).`)
    }

    const contentType = (res.headers.get("content-type") || "").toLowerCase()
    if (
      contentType &&
      !contentType.includes("text/") &&
      !contentType.includes("json") &&
      !contentType.includes("xml")
    ) {
      throw new Error("That link doesn’t look like a text/HTML page.")
    }

    const buf = await res.arrayBuffer()
    if (buf.byteLength > MAX_BYTES) {
      throw new Error("That page is too large to import. Paste the trip section instead.")
    }

    const raw = new TextDecoder("utf-8").decode(buf)
    const text = contentType.includes("html") || raw.includes("<html")
      ? stripHtml(raw)
      : raw.trim()

    if (text.length < 40) {
      throw new Error(
        "Couldn’t extract enough text from that page. Try pasting the itinerary content instead."
      )
    }

    return text.slice(0, 60_000)
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Timed out fetching that link. Try pasting the text instead.")
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export function looksLikeUrl(value: string): boolean {
  const t = value.trim()
  if (!/^https?:\/\//i.test(t)) return false
  if (t.includes("\n") || t.length > 2000) return false
  try {
    new URL(t)
    return true
  } catch {
    return false
  }
}
