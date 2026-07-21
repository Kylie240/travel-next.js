"use client"

import { useMemo, type MouseEvent, type FormEvent } from "react"
import { X } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import BasicTemplate from "@/components/templates/basic-template"
import DiscoverTemplate from "@/components/templates/discover-template"
import ExploreTemplate from "@/components/templates/explore-template"
import JourneyTemplate from "@/components/templates/journey-template"
import WonderTemplate from "@/components/templates/wonder"
import { collectAllPhotos } from "@/lib/utils/photos"
import { UserData } from "@/lib/types"
import { Itinerary } from "@/types/itinerary"
import { Day } from "@/types/Day"
import { Note } from "@/types/Note"
import { ItineraryStatusEnum } from "@/enums/itineraryStatusEnum"
import { TemplateMap } from "@/enums/templateEnum"

export type PreviewTemplateKey =
  | "basic"
  | "discover"
  | "explore"
  | "journey"
  | "wonder"

export type CreateFormPreviewValues = {
  title?: string
  shortDescription?: string
  detailedOverview?: string
  mainImage?: string
  duration?: number
  budget?: number | null
  countries?: string[]
  cities?: { city?: string; country?: string }[]
  days?: Day[]
  notes?: Note[]
  itineraryTags?: number[]
}

type ItineraryPreviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  formValues: CreateFormPreviewValues
  template: string | null | undefined
  itineraryId: string | null
  creator: UserData | null
  currentUserId: string
  priceCents?: number
}

function resolveTemplate(template: string | null | undefined): PreviewTemplateKey {
  if (
    template === "discover" ||
    template === "explore" ||
    template === "journey" ||
    template === "wonder"
  ) {
    return template
  }
  return "basic"
}

function buildPreviewItinerary(
  values: CreateFormPreviewValues,
  itineraryId: string | null,
  creatorId: string
): Itinerary {
  const days = Array.isArray(values.days) ? values.days : []
  const countries = Array.isArray(values.countries)
    ? values.countries.filter(Boolean)
    : []

  return {
    id: itineraryId || "preview",
    title: values.title?.trim() || "Untitled itinerary",
    duration: values.duration || days.length || 1,
    shortDescription: values.shortDescription || "",
    detailedOverview: values.detailedOverview || "",
    mainImage: values.mainImage || "",
    countries,
    cities: (values.cities || []).map((c) => ({
      city: c.city || "",
      country: c.country || "",
    })),
    days,
    status: ItineraryStatusEnum.draft,
    itineraryTags: values.itineraryTags || [],
    activityTags: [],
    notes: values.notes || [],
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    budget: values.budget ?? undefined,
    creatorId,
    viewPermission: 0,
    editPermission: 0,
  }
}

function fallbackCreator(userId: string): UserData {
  return {
    id: userId,
    name: "You",
    email: "",
    username: "you",
    title: "",
    avatar: "",
    location: "",
    createdAt: "",
    updatedAt: "",
    bio: "",
    website: "",
    stats: { trips: 0, followers: 0, following: 0, likes: 0 },
    isFollowing: false,
  }
}

export function ItineraryPreviewDialog({
  open,
  onOpenChange,
  formValues,
  template,
  itineraryId,
  creator,
  currentUserId,
  priceCents = 0,
}: ItineraryPreviewDialogProps) {
  const resolved = resolveTemplate(template)
  const templateLabel =
    TemplateMap[resolved as keyof typeof TemplateMap] || "Basic"

  const creatorData = creator || fallbackCreator(currentUserId || "preview-user")

  const itinerary = useMemo(
    () => buildPreviewItinerary(formValues, itineraryId, creatorData.id),
    [formValues, itineraryId, creatorData.id]
  )

  const photos = useMemo(() => collectAllPhotos(itinerary), [itinerary])
  const countries =
    itinerary.countries?.length > 0
      ? itinerary.countries
      : Array.from(
          new Set(
            (itinerary.days || [])
              .map((d) => d.countryName)
              .filter((c): c is string => Boolean(c))
          )
        )

  const templateProps = {
    itinerary,
    countries,
    photos,
    canEdit: false,
    paidUser: false,
    initialIsLiked: false,
    initialIsSaved: false,
    initialIsFollowing: false,
    creator: creatorData,
    currentUserId: currentUserId || creatorData.id,
    isRestrictedView: false,
    priceCents,
  }

  let TemplateView = <BasicTemplate {...templateProps} />
  if (resolved === "discover") {
    TemplateView = <DiscoverTemplate {...templateProps} />
  } else if (resolved === "explore") {
    TemplateView = <ExploreTemplate {...templateProps} />
  } else if (resolved === "journey") {
    TemplateView = <JourneyTemplate {...templateProps} />
  } else if (resolved === "wonder") {
    TemplateView = <WonderTemplate {...templateProps} />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed inset-0 left-0 top-0 z-[10001] flex h-[100dvh] max-h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 data-[state=open]:zoom-in-100 [&>button.absolute]:hidden"
      >
        <DialogHeader className="sticky top-0 z-20 flex-row items-center justify-between space-y-0 border-b bg-white px-4 py-3 pr-4 text-left shadow-sm">
          <div className="min-w-0 flex-1 pr-3">
            <DialogTitle className="text-base font-semibold text-gray-900">
              Itinerary preview
            </DialogTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing the {templateLabel} template. Close to keep editing.
            </p>
          </div>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        <div
          className="flex-1 overflow-y-auto bg-white [&_button]:cursor-not-allowed [&_a]:cursor-not-allowed"
          onClickCapture={(event: MouseEvent<HTMLDivElement>) => {
            event.preventDefault()
            event.stopPropagation()
          }}
          onSubmitCapture={(event: FormEvent<HTMLDivElement>) => {
            event.preventDefault()
            event.stopPropagation()
          }}
        >
          {TemplateView}
        </div>
      </DialogContent>
    </Dialog>
  )
}
