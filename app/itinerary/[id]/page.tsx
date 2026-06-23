import { Itinerary } from "@/types/itinerary"
import { getItineraryById, getRestrictedItineraryById } from "@/lib/actions/itinerary.actions"
import { collectAllPhotos } from "@/lib/utils/photos"
import { redirect } from "next/navigation"
import createClient from "@/utils/supabase/server"
import BasicTemplate from "@/components/templates/basic-template"
import DiscoverTemplate from "@/components/templates/discover-template"
import ExploreTemplate from "@/components/templates/explore-template"
import { editPermissionEnum, viewPermissionEnum } from "@/enums/itineraryStatusEnum"
import JourneyTemplate from "@/components/templates/journey-template"

export default async function ItineraryPage({ params }: { params: Promise<any> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const currentUserId = user?.id
  const paramsValue = await params;
  const { data: itineraryMeta } = await supabase
    .from('itineraries')
    .select('is_paid, price_cents, creator_id, view_permission, edit_permission')
    .eq('id', paramsValue.id)
    .single()

  let hasFullAccess = true;
  let isRestricted = false;
  
  if (itineraryMeta?.is_paid) {
    const isCreator = currentUserId === itineraryMeta.creator_id;
    hasFullAccess = isCreator;

    if (!isCreator) {
      const { data: purchaseData } = await supabase
        .from('itinerary_purchases')
        .select('id')
        .eq('itinerary_id', paramsValue.id)
        .eq('user_id', currentUserId || '')
        .maybeSingle()
      
      hasFullAccess = !!purchaseData;
    }
    isRestricted = !hasFullAccess;
  }

  // Fetch itinerary - use restricted version if user doesn't have full access to paid content
  const itinerary = isRestricted 
    ? await getRestrictedItineraryById(paramsValue.id) as Itinerary | null
    : await getItineraryById(paramsValue.id) as Itinerary | null;
  
  // Redirect if itinerary or creator data is missing
  if (!itinerary || !itinerary.creator) {
    return redirect("/not-found");
  }
  
  const creator = itinerary.creator;
  const isPrivate = itinerary.creator?.isPrivate;
  const countries = itinerary.days?.map(day => day.countryName).filter((value, index, self) => self.indexOf(value) === index) || [];
  const photos = collectAllPhotos(itinerary);
  
  // Check view permissions using already-fetched metadata
  if (itineraryMeta) {
    const viewPermission = typeof itineraryMeta.view_permission === 'string' 
      ? parseInt(itineraryMeta.view_permission) 
      : itineraryMeta.view_permission

    // If viewPermission is 2 (creator only), check if user is the creator
    if (viewPermission === viewPermissionEnum.creator) {
      if (!currentUserId || currentUserId !== itineraryMeta.creator_id) {
        return redirect("/not-authorized");
      }
    }
    
    // If viewPermission is 3 (restricted), check if user is in permission_view table
    if (viewPermission === viewPermissionEnum.restricted) {
      if (!currentUserId) {
        return redirect("/not-authorized");
      }
      
      // Check if user is in permission_view table for this itinerary
      const { data: permissionData } = await supabase
        .from('permission_view')
        .select('user_id')
        .eq('itinerary_id', paramsValue.id)
        .eq('user_id', currentUserId)
        .maybeSingle()

      // Also check if user is the creator (creators should always have access)
      const isCreator = currentUserId === itineraryMeta.creator_id
      
      if (!isCreator && !permissionData) {
        return redirect("/not-authorized");
      }
    }
    
    // If viewPermission is 1 (public), allow access - no check needed
  }
  
  // Only fetch user plan if logged in
  let paidUser = false;
  if (currentUserId) {
    const { data: userPlan } = await supabase.from('users_settings').select('plan').eq('user_id', currentUserId).single()
    paidUser = userPlan?.plan != "free";
  }
  
  // Check edit permissions
  let canEdit = false;
  if (currentUserId && itineraryMeta) {
    const editPermission = typeof itineraryMeta.edit_permission === 'string'
      ? parseInt(itineraryMeta.edit_permission)
      : itineraryMeta.edit_permission
    
    // If editPermission is 1 (creator only), only creator can edit
    if (editPermission === editPermissionEnum.creator) {
      canEdit = currentUserId === itinerary.creatorId;
    }
    // If editPermission is 2 (collaborators), check if user is creator or in permission_edit table
    else if (editPermission === editPermissionEnum.collaborators) {
      const isCreator = currentUserId === itinerary.creatorId;
      
      if (isCreator) {
        canEdit = true;
      } else {
        // Check if user is in permission_edit table
        const { data: editPermissionData } = await supabase
          .from('permission_edit')
          .select('user_id')
          .eq('itinerary_id', paramsValue.id)
          .eq('user_id', currentUserId)
          .maybeSingle()
        
        canEdit = !!editPermissionData;
      }
    }
    // Default: only creator can edit (fallback)
    else {
      canEdit = currentUserId === itinerary.creatorId;
    }
  }

  if (isPrivate && currentUserId !== itinerary.creatorId) {
    return redirect("/not-authorized");
  }

  // Fetch initial interaction states if user is logged in
  let initialIsLiked = undefined;
  let initialIsSaved = undefined;
  let initialIsFollowing = undefined;
  
  if (currentUserId) {
    // Check if user has liked the itinerary
    const { data: likeData } = await supabase
      .from('interactions_likes')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('itinerary_id', itinerary.id)
      .maybeSingle();
    initialIsLiked = !!likeData;

    // Check if user has saved the itinerary
    const { data: saveData } = await supabase
      .from('interactions_saves')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('itinerary_id', itinerary.id)
      .maybeSingle();
    initialIsSaved = !!saveData;

    // Check if user is following the creator
    const { data: followData } = await supabase
      .from('users_following')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('following_id', itinerary.creatorId)
      .maybeSingle();
    initialIsFollowing = !!followData;
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
    priceCents: itineraryMeta?.price_cents || 0,
  }

  return <BasicTemplate {...templateProps} />
  const isDEV = process.env.DEV_ENVIRONMENT
  const template = process.env.NEXT_PUBLIC_ITINERARY_TEMPLATE
  if (isDEV !== "true") {
    return <BasicTemplate {...templateProps} />
  }
  if (template === "discover") {
    return <DiscoverTemplate {...templateProps} />
  }
  if (template === "explore") {
    return <ExploreTemplate {...templateProps} />
  }
  if (template === "journey") {
    return <JourneyTemplate {...templateProps} />
  }
  if (template === "discover") {
    return <DiscoverTemplate {...templateProps} />
  }
} 