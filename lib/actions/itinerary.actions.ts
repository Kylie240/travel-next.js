"use server";

import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { CreateItinerary } from "@/types/createItinerary";
import { supabase } from "@/utils/supabase/superbase-client";
import { ItineraryStatusEnum } from "@/enums/itineraryStatusEnum";
import { ItinerarySummary } from "@/types/ItinerarySummary";
import { SavedItinerary } from "@/types/savedItinerary";

export const getItineraries = async (options?: GetItineraryOptions) => {
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

export const getItineraryDataByUserId = async (userId: string) => {
    const { data, error } = await supabase
    .rpc("get_profile_itineraries", { p_creator_id: userId }) as { 
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
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });

        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        if (!userId) {
            throw new Error("User ID not found");
        }

        const { data: existingUser, error: userError } = await supabase.auth.getUser();

        if (userError) {
            throw new Error('Failed to verify user');
        }

        if (!existingUser) {
            //return to homepage
        }

        const { data, error } = await supabase.rpc("create_itinerary", {
            p_itinerary: itinerary,
            p_creator_id: userId,
        });

        if (error && error.message == "Maximum number of itineraries reached.") {
            throw new Error("Maximum number of itineraries reached.");
        } else if (error) throw new Error(error.message);

        return data;
    } catch (error) {
        throw new Error(`Failed to create itinerary: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const updateItinerary = async (id: string, itinerary: CreateItinerary) => {
     // Mey need to check if the user is authenticated
     const token = cookies().get("sb-access-token");
     if (!token) {
         throw new Error("Not authenticated");
        }
        
        try {
            const supabase = createServerActionClient({ cookies });
            
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;
            
            if (!userId) {
                throw new Error("User ID not found");
            }
            
        const { data: existingUser, error: userError } = await supabase.auth.getUser();

        if (userError) {
            throw new Error('Failed to verify user');
        }
        
        if (!existingUser) {
            throw new Error('Please login and try again');
        }
        const { data, error } = await supabase.rpc("update_itinerary", {
            p_itinerary: itinerary,
            p_creator_id: userId,
            p_itinerary_id: id,
        });

        if (error) throw new Error(error.message);

        return { success: true };
    } catch (error) {
        throw new Error(`Failed to update itinerary: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const getItinerarySummaries = async (userId?: string) => {
    const { data, error } = await supabase
    .rpc("get_my_itinieraries", { p_creator_id: userId }) as { 
        data: ItinerarySummary[] | null, 
        error: Error | null };

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export const updateItineraryStatus = async (itineraryId: string, status: number, creatorId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error("Not authenticated");
        }

    const { data, error } = await supabase.rpc("update_itinerary_status", {
        p_creator_id: creatorId,
        p_itinerary_id: itineraryId,
        p_status: status,
    });

    if (error) throw new Error(error.message);

        return { success: true };
    } catch (error) {
        throw new Error(`Failed to update itinerary status: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const getItineraryById = async (itineraryId: string) => {
    try {
        const supabase = createServerActionClient({ cookies });

        const { data, error } = await supabase.rpc("get_itinerary", {
        p_itinerary_id: itineraryId,
        });

        if (error) throw new Error(error.message);
        
        return data;
    } catch (error) {
        throw new Error(`Failed to retrieve itinerary: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const deleteItinerary = async (itineraryId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error("Not authenticated");
        }

        const { error: itineraryError } = await supabase
        .from('itineraries')
        .delete()
        .eq('id', itineraryId);

        if (itineraryError) {
            throw itineraryError;
        }

        const { data: galleryUUID } = await supabase
        .from('itinerary_gallery')
        .select('gallery_id')
        .eq('itinerary_id', itineraryId)
        .maybeSingle();

        //logic for deleting

        // const { error: galleryError } = await supabase
        // .from('itinerary_gallery')
        // .delete()
        // .eq('itinerary_id', itineraryId);

        return { success: true };
    } catch (error) {
        throw new Error(`Failed to delete itinerary: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const incrementItineraryViewCount = async (itineraryId: string) => {
    const supabase = createServerActionClient({ cookies });
    
    const { data, error } = await supabase
    .rpc("increment_itinerary_view", { p_itinerary_id: itineraryId });

    if (error) {
        console.log("Error incrementing view count:", error)
    } 
}

export const getSavesByUserId = async (userId: string, creatorId: string = null) => {
    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data, error } = await supabase
        .rpc("get_saved_itineraries", { p_user_id: userId, p_creator_id: creatorId }) as { 
            data: SavedItinerary[] | null, 
            error: Error | null 
        };

        if (error) {
            throw new Error(error.message);
        } 

        return data;
    } catch (error) {
        throw new Error(`Failed to get saved itineraries: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const getSavesByCreatorId = async (userId: string, creatorId: string = null) => {
    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data, error } = await supabase
        .rpc("get_saved_itinerary_ids", { p_current_user_id: userId, p_creator_id: creatorId }) as { 
            data: string[] | null, 
            error: Error | null 
        };

        if (error) {
            throw new Error(error.message);
        } 

        return data;
    } catch (error) {
        throw new Error(`Failed to get saved itineraries: ${error instanceof Error ? error.message : String(error)}`);
    }
}

//Interactions
export const LikeItinerary = async (itineraryId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error("Not authenticated");
        }

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
    } catch (error) {
        throw new Error(`Failed to bookmark itinerary: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const UnlikeItinerary = async (itineraryId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error("Not authenticated");
        }

        const { error: itineraryError } = await supabase
        .from('interactions_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('itinerary_id', itineraryId);

        if (itineraryError) {
            throw itineraryError;
        }

        return { success: true };
    } catch (error) {
        throw new Error(`Failed to unlike itinerary: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const SaveItinerary = async (itineraryId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error("Not authenticated");
        }

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
    } catch (error) {
        throw new Error(
            `Failed to save itinerary: ${
                error instanceof Error
                ? error.message
                : JSON.stringify(error, null, 2)
            }`
        );
    }
}

export const UnsaveItinerary = async (itineraryId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error("Not authenticated");
        }

        const { error: itineraryError } = await supabase
        .from('interactions_saves')
        .delete()
        .eq('user_id', user.id)
        .eq('itinerary_id', itineraryId);

        if (itineraryError) {
            throw itineraryError;
        }

        return { success: true };
    } catch (error) {
        throw new Error(`Failed to unsave itinerary: ${error instanceof Error ? error.message : String(error)}`);
    }
}
