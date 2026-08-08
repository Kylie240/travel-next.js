# Itinerary import (paste / URL)

Create → **Import trip notes** turns blog posts, Notes, Google Docs text, TikTok
captions, or a public URL into a draft itinerary you review in the builder.

## Env

Add to `.env.local` (and Vercel):

```
OPENAI_API_KEY=sk-...
# optional
OPENAI_IMPORT_MODEL=gpt-4o-mini
```

Without `OPENAI_API_KEY`, import still works via a simple day-heading parser
(Day 1 / Day 2…), but cities and structure will need more manual cleanup.

## Limits

- Auth required
- ~8 imports / user / hour
- Spam phone-number content is blocked
