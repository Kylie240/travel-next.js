"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Link2, FileText } from "lucide-react"
import { toast } from "sonner"
import { importItineraryFromText } from "@/lib/actions/import-itinerary.actions"
import type { ImportedItineraryDraft } from "@/lib/import/itinerary-draft-schema"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported: (draft: ImportedItineraryDraft, meta: { source: string; warnings: string[] }) => void
}

export function ImportItineraryDialog({ open, onOpenChange, onImported }: Props) {
  const [mode, setMode] = useState<"paste" | "url">("paste")
  const [text, setText] = useState("")
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)

  const handleImport = async () => {
    setLoading(true)
    try {
      const result = await importItineraryFromText(
        mode === "url" ? { url: url.trim() } : { text }
      )
      onImported(result.draft, {
        source: result.source,
        warnings: result.warnings,
      })
      onOpenChange(false)
      setText("")
      setUrl("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed")
    } finally {
      setLoading(false)
    }
  }

  const canSubmit =
    !loading &&
    (mode === "paste" ? text.trim().length >= 40 : url.trim().length >= 8)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Import trip notes</DialogTitle>
          <DialogDescription>
            Paste from a blog, Notes, Google Doc, TikTok caption, or email — or drop in a
            public URL. We’ll draft days and activities you can edit before publishing.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-3">
          <Button
            type="button"
            variant={mode === "paste" ? "default" : "outline"}
            size="sm"
            className="rounded-xl"
            onClick={() => setMode("paste")}
            disabled={loading}
          >
            <FileText className="h-4 w-4 mr-1.5" />
            Paste text
          </Button>
          <Button
            type="button"
            variant={mode === "url" ? "default" : "outline"}
            size="sm"
            className="rounded-xl"
            onClick={() => setMode("url")}
            disabled={loading}
          >
            <Link2 className="h-4 w-4 mr-1.5" />
            From URL
          </Button>
        </div>

        {mode === "paste" ? (
          <div className="space-y-2">
            <Label htmlFor="import-text">Trip notes</Label>
            <Textarea
              id="import-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Example:\nTokyo 3 days\nDay 1 — Asakusa\n- Senso-ji morning\n- Nakamise snacks\nDay 2 — Shibuya\n- Scramble viewpoint\n- Ramen dinner`}
              className="min-h-[220px] rounded-xl text-sm"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Tip: include day headings and bullet activities for best results.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="import-url">Public page URL</Label>
            <input
              id="import-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-xl border px-3 py-2 text-sm"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Works best with public blog posts. Login-walled docs won’t load — paste those
              instead.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!canSubmit}
            className="rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing…
              </>
            ) : (
              "Import & review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
