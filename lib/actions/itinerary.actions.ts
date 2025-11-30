"use server";

import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { CreateItinerary } from "@/types/createItinerary";
import { ItineraryStatusEnum } from "@/enums/itineraryStatusEnum";
import { ItinerarySummary } from "@/types/ItinerarySummary";
import { SavedItinerary } from "@/types/savedItinerary";
import createClient from "@/utils/supabase/server";

export const getItineraries = async (options?: GetItineraryOptions) => {
    const supabase = await createClient()
    const page = options?.pagination?.page || 1;
    const pageSize = options?.pagination?.pageSize || 10;
    const firstItemIndex = (page - 1) * pageSize;
    const lastItemIndex = firstItemIndex + pageSize - 1;
    const {destination, durationMin, durationMax, budgetMin, budgetMax, continents, activityTags, itineraryTags, countries, sort, quickFilter} = options?.filters ?? {};

    let query = supabase.from('itineraries').select(
        'id, title, duration, short_description, main_image, countries, cities, itinerary_tags, activity_tags, featured_categories, creator_id, creator_name, creator_image'
    )

         if (destination) {
            query = query.contains('countries', [destination])
         }
         if (durationMin !== null && durationMin !== undefined) {
            query = query.gte('duration', durationMin)
         }
         if (durationMax !== null && durationMax !== undefined) {
            query = query.lte('duration', durationMax)
         }
         // find how to query actiivty tags
        //  if (activityTags) {
        //     query = query.in('duration', activityTags)
        //  }
         if (itineraryTags) {
            query = query.contains('itineraryTags', itineraryTags)
         }
         if (countries) {
            query = query.contains('countries', countries)
         }
        //  // Not Yet Using
        //  if (budgetMin) {
        //     query = query.gte('budget', durationMin)
        //  }
        //  if (budgetMax) {
        //     query = query.lte('budget', durationMax)
        //  }
        //  if (continents) {
        //     query = query.in('continents', continents)
        //  }

        //  //Sort Handling
        //  if (sort) {
        //     switch(sort) {
        //         case 'most-recent':
        //             query = query.order('updated', { ascending: false });
        //             break;
        //         case 'most-viewed':
        //             query = query.order('views', { ascending: false });
        //             break;
        //         case 'best-rated':
        //             query = query.order('rating', { ascending: false });
        //             break;
        //         case 'price-low':
        //             query = query.order('price', { ascending: true });
        //             break;
        //         case 'price-high':
        //             query = query.order('price', { ascending: false });
        //             break;
        //         default:
        //             query = query.order('updated', { ascending: false });
        //     }
        //  } else {
        //     query = query.order('updated', { ascending: false })
        //  }
        //  // add logic
        //  if (quickFilter) {
        //     // logic
        //  }

    try {
         const { data, error } = await query
         .range(firstItemIndex, lastItemIndex)
         .eq('status', ItineraryStatusEnum.published);
         if (error) throw error

         const total = data.length;

         return {
            data,
            total,
            totalPages: Math.ceil(total / pageSize),
            currentPage: page
        }
    } catch (error) {
        throw new Error(`Failed to get itineraries: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const getItineraryDataByUserId = async (userId: string, currentUserId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
    .rpc("get_profile_itineraries", { p_creator_id: userId, p_current_user_id: currentUserId }) as { 
        data: ItinerarySummary[] | null, 
        error: Error | null };

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export const createItinerary = async (itinerary: CreateItinerary) => {
    itinerary.days.forEach((x, i) => x.id = i + 1)
    // Mey need to check if the user is authenticated
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

        const { data, error } = await supabase.rpc("create_itinerary", {
            p_itinerary: itinerary,
            p_creator_id: user.id,
        });

        if (error && error.message == "Maximum number of itineraries reached.") {
            throw new Error("Maximum number of itineraries reached.");
        } else if (error) throw new Error(error.message);

        return data;
}

export const updateItinerary = async (id: string, itinerary: CreateItinerary) => {
     const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")
        console.log("itinerary", itinerary)
      const { error } = await supabase.rpc("update_itinerary", {
          p_itinerary: itinerary,
          p_user_id: user.id,
          p_itinerary_id: id,
      });

      if (error) throw new Error(error.message);

      return { success: true };
}

export const getItinerarySummaries = async (userId?: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")
    
    const { data, error } = await supabase
    .rpc("get_my_itineraries", { p_user_id: user.id }) as { 
        data: ItinerarySummary[] | null, 
        error: Error | null };

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export const getItineraryPermissions = async (userId?: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
    .rpc("get_itineraries_permissions", { p_user_id: userId }) as { 
        data: ItineraryPermissions[] | null, 
        error: Error | null };

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export const updateItineraryStatus = async (itineraryId: string, status: number, creatorId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase.rpc("update_itinerary_status", {
        p_creator_id: creatorId,
        p_itinerary_id: itineraryId,
        p_status: status,
    });

    if (error && error.message == "Maximum number of itineraries reached.") {
        throw new Error("Maximum number of itineraries reached.");
    } else if (error) throw new Error(error.message);
    
    return { success: true };
}

export const getItineraryById = async (itineraryId: string) => {
    const supabase = await createClient()
    
    const { data, error } = await supabase.rpc("get_itinerary", {
        p_itinerary_id: itineraryId,
    });

    if (error) throw new Error(error.message);
    
    return data;
}

export const deleteItinerary = async (itineraryId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

        const { error: itineraryError } = await supabase
        .from('itineraries')
        .delete()
        .eq('id', itineraryId);

        if (itineraryError) {
            throw itineraryError;
        }

        // await deleteFolderRecursively(user.id, itineraryId);
        const { error: galleryError } = await supabase
        .from('gallery_removal')
        .insert({
            itinerary_id: itineraryId,
        });

        if (galleryError) {
            throw galleryError;
        }

        return { success: true };
}

export const incrementItineraryViewCount = async (itineraryId: string) => {
    const supabase = await createClient()
    
    const { data, error } = await supabase
    .rpc("increment_itinerary_view", { p_itinerary_id: itineraryId });

    if (error) {
        console.log("Error incrementing view count:", error)
    } 
}

export const getSavesByUserId = async (userId: string, creatorId: string = null) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")
        
      const { data, error } = await supabase
      .rpc("get_saved_itineraries", { p_user_id: userId, p_creator_id: creatorId }) as { 
          data: SavedItinerary[] | null, 
          error: Error | null 
      };

      if (error) {
          throw new Error(error.message);
      } 

      return data;
}

export const getSavesByCreatorId = async (userId: string, creatorId: string = null) => {
    const supabase = await createClient()   
        
    const { data, error } = await supabase
    .rpc("get_saved_itinerary_ids", { p_current_user_id: userId, p_creator_id: creatorId }) as { 
        data: string[] | null, 
        error: Error | null 
    };

    if (error) {
        throw new Error(error.message);
    } 

    return data;
}

//Interactions
export const LikeItinerary = async (itineraryId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

        const { error: itineraryError } = await supabase
        .from('interactions_likes')
        .insert({
            itinerary_id: itineraryId,
            user_id: user.id,
        });

        if (itineraryError) {
            throw itineraryError;
        }

        return { success: true };
}

export const UnlikeItinerary = async (itineraryId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

        const { error: itineraryError } = await supabase
        .from('interactions_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('itinerary_id', itineraryId);

        if (itineraryError) {
            throw itineraryError;
        }

        return { success: true };
}

export const SaveItinerary = async (itineraryId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

        const { error: itineraryError } = await supabase
        .from('interactions_saves')
        .insert({
            itinerary_id: itineraryId,
            user_id: user.id,
        });

        if (itineraryError) {
            if (itineraryError.code === "23505") {
                return { success: true, message: "Already saved" };
            }
            throw itineraryError;
        }

        return { success: true };
}

export const UnsaveItinerary = async (itineraryId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

        const { error: itineraryError } = await supabase
        .from('interactions_saves')
        .delete()
        .eq('user_id', user.id)
        .eq('itinerary_id', itineraryId);

        if (itineraryError) {
            throw itineraryError;
        }

        return { success: true };
}

async function deleteFolderRecursively(userId: string, itineraryId: string) {
    const supabase = await createClient()
    const bucket = "itinerary-images";
  const galleryPath = `${userId}/${itineraryId}/`;

  // Helper to delete all files in a folder
  async function deleteAllInFolder(path) {
    const { data: files, error } = await supabase.storage.from(bucket).list(path, { limit: 100 });
    if (error) throw error;

    if (!files || files.length === 0) return;

    const filePaths = files.map((f) => `${path}${f.name}`);
    await supabase.storage.from(bucket).remove(filePaths);
  }

  try {
    // 1️⃣ Delete files directly inside gallery folder (just in case)
    await deleteAllInFolder(galleryPath);

    // 2️⃣ Delete all files inside main/
    await deleteAllInFolder(`${galleryPath}main/`);

    // 3️⃣ Delete all files inside each days/day# folder
    const { data: daysFolders } = await supabase.storage.from(bucket).list(`${galleryPath}days/`, { limit: 100 });

    if (daysFolders && daysFolders.length > 0) {
      for (const dayFolder of daysFolders) {
        await deleteAllInFolder(`${galleryPath}days/${dayFolder.name}/`);
      }
    }

    console.log(`✅ Deleted gallery ${galleryPath} successfully.`);
  } catch (err) {
    console.error("Error deleting gallery:", err.message);
  }
  }

export interface ItineraryPermissions {
  viewPermission: 'public' | 'private' | 'restricted';
  editPermission: 'creator' | 'collaborators';
  allowedViewers?: string[];
  allowedEditors?: string[];
}

export const getItineraryPermissionsById = async (
  itineraryId: string,
  permissions: ItineraryPermissions
) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  // First verify the user is the creator
  const { data: itinerary, error: fetchError } = await supabase
    .from('itineraries')
    .select('creator_id')
    .eq('id', itineraryId)
    .single()

  if (fetchError) throw new Error("Itinerary not found")
  if (itinerary.creator_id !== user.id) throw new Error("You are not authorized to update this itinerary")

  const { data, error } = await supabase.rpc(
    "get_itinerary_permissions",
    { p_itinerary_id: itineraryId }
  );

  if (error) {
    console.error("Failed to fetch permissions:", error);
    return null;
  }

  console.log("data", data)
  return data as ItineraryPermissions;
}

export const updateItineraryPermissions = async (
  itineraryId: string,
  permissions: ItineraryPermissions
) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  // First verify the user is the creator
  const { data: itinerary, error: fetchError } = await supabase
    .from('itineraries')
    .select('creator_id')
    .eq('id', itineraryId)
    .single()

  if (fetchError) throw new Error("Itinerary not found")
  if (itinerary.creator_id !== user.id) throw new Error("You are not authorized to update this itinerary")

    console.log("permissions", permissions)
  const { error } = await supabase.rpc(
    "update_itinerary_permissions",
    {
      p_user_id: user.id,
      p_itinerary_id: itineraryId,
      p_permissions: permissions,
    }
  );

  if (error) {
    console.error("RPC Error:", error);
    throw new Error(error.message);
  }

  return { success: true };
}