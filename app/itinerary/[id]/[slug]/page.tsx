import type { Metadata } from "next"
import { Itinerary } from "@/types/itinerary"
import {
  getItineraryById,
  getRestrictedItineraryById,
} from "@/lib/actions/itinerary.actions"
import { collectAllPhotos } from "@/lib/utils/photos"
import { redirect } from "next/navigation"
import createClient from "@/utils/supabase/server"
import BasicTemplate from "@/components/templates/basic-template"
import DiscoverTemplate from "@/components/templates/discover-template"
import ExploreTemplate from "@/components/templates/explore-template"
import {
  editPermissionEnum,
  ItineraryStatusEnum,
  viewPermissionEnum,
} from "@/enums/itineraryStatusEnum"
import JourneyTemplate from "@/components/templates/journey-template"
import {
  getCanonicalItineraryPath,
  isCanonicalItineraryPath,
  resolveItineraryByPrefixAndSlug,
  type ItineraryRouteMeta,
} from "@/lib/itinerary-route"
import { getItineraryPath } from "@/lib/utils/itinerary-url"
import WonderTemplate from "@/components/templates/wonder"
import { getCachedSellerSalesEnabled } from "@/lib/sync-stripe-connect-account"
import { JsonLd, buildItineraryJsonLd } from "@/lib/seo/json-ld"

type PageParams = { id: string; slug: string }

async function loadItineraryPage(idPrefix: string, slug: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const currentUserId = user?.id

  const itineraryMeta = await resolveItineraryByPrefixAndSlug(idPrefix, slug)

  if (!itineraryMeta) {
    redirect("/not-found")
  }

  if (!isCanonicalItineraryPath(itineraryMeta, idPrefix, slug)) {
    redirect(getCanonicalItineraryPath(itineraryMeta))
  }

  const itineraryId = itineraryMeta.id

  let hasFullAccess = true
  let isRestricted = false

  if (itineraryMeta.is_paid) {
    const isCreator = currentUserId === itineraryMeta.creator_id
    hasFullAccess = isCreator

    if (!isCreator) {
      const { data: purchaseData } = await supabase
        .from("itinerary_purchases")
        .select("id")
        .eq("itinerary_id", itineraryId)
        .eq("user_id", currentUserId || "")
        .maybeSingle()

      hasFullAccess = !!purchaseData
    }
    isRestricted = !hasFullAccess
  }

  const itinerary = (
    isRestricted
      ? await getRestrictedItineraryById(itineraryId)
      : await getItineraryById(itineraryId)
  ) as Itinerary | null

  if (!itinerary || !itinerary.creator) {
    redirect("/not-found")
  }

  itinerary.slug = itineraryMeta.slug ?? undefined

  const creator = itinerary.creator
  const isPrivate = itinerary.creator?.isPrivate
  const countries =
    itinerary.days
      ?.map((day) => day.countryName)
      .filter((value, index, self) => self.indexOf(value) === index) || []
  const photos = collectAllPhotos(itinerary)

  const viewPermission =
    typeof itineraryMeta.view_permission === "string"
      ? parseInt(itineraryMeta.view_permission, 10)
      : itineraryMeta.view_permission

  if (viewPermission === viewPermissionEnum.creator) {
    if (!currentUserId || currentUserId !== itineraryMeta.creator_id) {
      redirect("/not-authorized")
    }
  }

  if (viewPermission === viewPermissionEnum.restricted) {
    if (!currentUserId) {
      redirect("/not-authorized")
    }

    const { data: permissionData } = await supabase
      .from("permission_view")
      .select("user_id")
      .eq("itinerary_id", itineraryId)
      .eq("user_id", currentUserId)
      .maybeSingle()

    const isCreator = currentUserId === itineraryMeta.creator_id

    if (!isCreator && !permissionData) {
      redirect("/not-authorized")
    }
  }

  let paidUser = false
  if (currentUserId) {
    const { data: userPlan } = await supabase
      .from("users_settings")
      .select("plan")
      .eq("user_id", currentUserId)
      .single()
    paidUser = userPlan?.plan != "free"
  }

  let canEdit = false
  if (currentUserId) {
    const editPermission =
      typeof itineraryMeta.edit_permission === "string"
        ? parseInt(itineraryMeta.edit_permission, 10)
        : itineraryMeta.edit_permission

    if (editPermission === editPermissionEnum.creator) {
      canEdit = currentUserId === itinerary.creatorId
    } else if (editPermission === editPermissionEnum.collaborators) {
      const isCreator = currentUserId === itinerary.creatorId

      if (isCreator) {
        canEdit = true
      } else {
        const { data: editPermissionData } = await supabase
          .from("permission_edit")
          .select("user_id")
          .eq("itinerary_id", itineraryId)
          .eq("user_id", currentUserId)
          .maybeSingle()

        canEdit = !!editPermissionData
      }
    } else {
      canEdit = currentUserId === itinerary.creatorId
    }
  }

  if (isPrivate && currentUserId !== itinerary.creatorId) {
    redirect("/not-authorized")
  }

  let initialIsLiked = undefined
  let initialIsSaved = undefined
  let initialIsFollowing = undefined

  if (currentUserId) {
    const { data: likeData } = await supabase
      .from("interactions_likes")
      .select("*")
      .eq("user_id", currentUserId)
      .eq("itinerary_id", itinerary.id)
      .maybeSingle()
    initialIsLiked = !!likeData

    const { data: saveData } = await supabase
      .from("interactions_saves")
      .select("*")
      .eq("user_id", currentUserId)
      .eq("itinerary_id", itinerary.id)
      .maybeSingle()
    initialIsSaved = !!saveData

    const { data: followData } = await supabase
      .from("users_following")
      .select("*")
      .eq("user_id", currentUserId)
      .eq("following_id", itinerary.creatorId)
      .maybeSingle()
    initialIsFollowing = !!followData
  }

  // Use cached Connect status for UI (webhooks keep this fresh). Checkout still live-checks.
  let sellerPurchasesEnabled = true
  if (isRestricted && itineraryMeta.creator_id) {
    sellerPurchasesEnabled = await getCachedSellerSalesEnabled(
      itineraryMeta.creator_id
    )
  }

  const templateProps = {
    itinerary,
    countries,
    photos,
    canEdit,
    paidUser,
    initialIsLiked,
    initialIsSaved,
    initialIsFollowing,
    creator,
    currentUserId: currentUserId ?? "",
    isRestrictedView: isRestricted,
    priceCents: itineraryMeta.price_cents || 0,
    sellerPurchasesEnabled,
  }

  const jsonLd =
    itineraryMeta.status === ItineraryStatusEnum.published &&
    viewPermission === viewPermissionEnum.public
      ? buildItineraryJsonLd({
          id: itineraryMeta.id,
          title: itineraryMeta.title || itinerary.title,
          slug: itineraryMeta.slug,
          shortDescription:
            itineraryMeta.short_description || itinerary.shortDescription,
          mainImage: itineraryMeta.main_image || itinerary.mainImage,
          countries,
          duration: itinerary.duration,
          isPaid: itineraryMeta.is_paid,
          priceCents: itineraryMeta.price_cents,
          creatorName: creator.name,
          creatorUsername: creator.username,
          updatedAt: itinerary.updated,
        })
      : null

  const template = itineraryMeta.template || "basic"
  let TemplateView = <BasicTemplate {...templateProps} />
  if (template === "discover") {
    TemplateView = <DiscoverTemplate {...templateProps} />
  } else if (template === "explore") {
    TemplateView = <ExploreTemplate {...templateProps} />
  } else if (template === "journey") {
    TemplateView = <JourneyTemplate {...templateProps} />
  } else if (template === "wonder") {
    TemplateView = <WonderTemplate {...templateProps} />
  }

  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      {TemplateView}
    </>
  )
}

function buildMetadataFromMeta(meta: ItineraryRouteMeta): Metadata {
  const description =
    meta.short_description?.trim().slice(0, 160) ||
    `Explore ${meta.title ?? "this itinerary"} on Journli.`

  const canonicalPath = getItineraryPath({
    id: meta.id,
    slug: meta.slug,
    title: meta.title,
  })

  const isPublished = meta.status === ItineraryStatusEnum.published

  return {
    title: meta.title ?? "Itinerary",
    description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: isPublished
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: meta.title ?? "Itinerary",
      description,
      url: canonicalPath,
      images: meta.main_image ? [{ url: meta.main_image }] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title ?? "Itinerary",
      description,
      images: meta.main_image ? [meta.main_image] : [],
    },
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { id: idPrefix, slug } = await params
  const meta = await resolveItineraryByPrefixAndSlug(idPrefix, slug)

  if (!meta) {
    return { title: "Itinerary | Journli" }
  }

  return buildMetadataFromMeta(meta)
}

export default async function ItineraryPage({
  params,
}: {
  params: Promise<PageParams>
}) {
  const { id: idPrefix, slug } = await params
  return loadItineraryPage(idPrefix, slug)
}
