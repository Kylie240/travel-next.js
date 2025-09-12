"use server";

import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { CreateItinerary } from "@/types/createItinerary";
import { supabase } from "@/utils/supabase/superbase-client";
import { ItineraryStatusEnum } from "@/enums/itineraryStatusEnum";
import { Itinerary } from "@/types/itinerary";
import { itineraryTagsMap } from "../constants/tags";
import { ItinerarySummary } from "@/types/ItinerarySummary";

type CreateActivity = {
    itinerary_id: string,
    day_number: number,
    activity_number: number,
    time: string,
    duration: string,
    image: string,
    title: string,
    description: string,
    location: string,
    type: number,
    link: string,
}

type CreateAccommodation = {
    itinerary_id: string,
    name: string,
    type: string,
    location: string,
    link: string,
    day_number: number,
}

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
        console.error('Error getting itineraries:', error);
        throw new Error(`Failed to get itineraries: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const createItinerary = async (itinerary: CreateItinerary) => {
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

        // First check if the user exists in our users table
        const { data: existingUser, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.error('Error checking user:', userError);
            throw new Error('Failed to verify user');
        }

        if (!existingUser) {
            //return to homepage
        }

        const {data: itineraryRow, error: itineraryError} = await supabase
        .from('itineraries')
        .insert([{
            title: itinerary.title,
            short_description: itinerary.shortDescription,
            main_image: itinerary.mainImage,
            status: itinerary.status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            duration: itinerary.duration,
            budget: itinerary.budget,
            creator_id: userId,
        }])
        .select()
        .single();

        if (itineraryError) {
            console.error('Error creating itinerary:', itineraryError);
            throw new Error(`Failed to create itinerary: ${itineraryError.message}`);
        }

        const itineraryId = itineraryRow.id;
        const accommodationRows: CreateAccommodation[] = [];

        // Insert Days
        if (itinerary.days?.length > 0) {
            const dayRows = itinerary.days.map((day, index) => ({
                itinerary_id: itineraryId,
                day_number: index + 1,
                title: day.title,
                description: day.description,
                notes: day.notes,
                city: day.cityName,
                country: day.countryName,
            }))

            const {data: insertedDays, error: dayError} = await supabase
            .from('itinerary_days')
            .insert(dayRows)
            .select()
            
            if (dayError) throw dayError;

            // Insert itinerary tags
            if (itinerary.itineraryTags.length > 0) {
                const itineraryRows = itinerary.itineraryTags.map((tag, index) => ({
                    itinerary_id: itineraryId,
                    tag_number: index + 1,
                    tag_id: tag,
                }));
                const { error: itineraryTagError } = await supabase
                .from('itinerary_tags')
                .insert(itineraryRows)
                .select()
                
                if (itineraryTagError) throw itineraryTagError;
            }

            // Map days for activities
            const activityRows: CreateActivity[] = [];
            for (let i = 0; i < itinerary.days.length; i++) {
                const dayNumber = i + 1;
                const activities = itinerary.days[i].activities || [];

                if (itinerary.days[i].accommodation?.name) {
                    accommodationRows.push({
                        itinerary_id: itineraryId,
                        day_number: dayNumber,
                        name: itinerary.days[i].accommodation.name,
                        type: itinerary.days[i].accommodation.type || undefined,
                        location: itinerary.days[i].accommodation.location || undefined,
                        link: itinerary.days[i].accommodation.link || undefined,
                    })
                }

                if (activities.length > 0) {
                    const activityRow: CreateActivity[] = activities.map((activity, index) => ({
                        itinerary_id: itineraryId,
                        day_number: dayNumber,
                        activity_number: index + 1,
                        time: activity.time || undefined,
                        duration: activity.duration || undefined,
                        image: activity.image || undefined,
                        title: activity.title,
                        description: activity.description || undefined,
                        location: activity.location || undefined,
                        type: activity.type || undefined,
                        link: activity.link || undefined,
                    }))
                    activityRows.push(...activityRow);
                }

                const {error: activityError} = await supabase
                .from('itinerary_activities')
                .insert(activityRows);

                if (activityError) throw activityError;
            }
        }

        if (accommodationRows.length > 0) {
            const {error: accommodationError} = await supabase
            .from('itinerary_accommodations')
            .insert(accommodationRows);
            
            if (accommodationError) throw accommodationError;
        }

        const {error: interactionError} = await supabase
        .from('itinerary_interactions')
        .insert({
            itinerary_id: itineraryId,
            views: null,
            rating: null,
            likes: null,
        });

        if (interactionError) throw interactionError;

        // Insert notes
        if (itinerary?.notes?.length > 0) {
            const noteRows = itinerary.notes.map((note, index) => ({
                itinerary_id: itineraryId,
                note_number: index + 1,
                title: note.title,
                content: note.content,
            }))

            const {error: noteError} = await supabase
            .from('itinerary_notes')
            .insert(noteRows);

            if (noteError) throw noteError;
        }

        return {
            itineraryId,
        }
    } catch (error) {
        console.error('Error creating itinerary:', error);
        throw new Error(`Failed to create itinerary: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const updateItinerary = async (itinerary: Itinerary) => {
    const supabase = createServerActionClient({ cookies });
    const { error: itineraryError } = await supabase
    .from('itineraries')
    .update(itinerary)
    .eq('id', itinerary.id);
}

export const getItineraryByUserId = async (userId?: string) => {
    // const token = cookies().get("token");
    // if (!token) {
    //     throw new Error("Not authenticated");
    // }

    try {
        const supabase = createServerActionClient({ cookies });

        const { data: itineraries, error: itinerariesError } = await supabase
        .from('itineraries')
        .select('*')
        .eq('creator_id', userId);

        if (itinerariesError) throw itinerariesError;

        const { data: itineraryInteractions, error: itineraryInteractionsError } = await supabase
        .from('itinerary_interactions')
        .select('views, rating, likes')
        .eq('itinerary_id', itineraries.id);

        const mappedItineraries = itineraries.map((itinerary: Itinerary) => ({
            id: itinerary.id,
            title: itinerary.title,
            duration: itinerary.duration,
            shortDescription: itinerary.shortDescription,
            detailedOverview: itinerary.detailedOverview,
            mainImage: itinerary.mainImage,
            countries: itinerary.countries,
            cities: itinerary.cities,
            days: itinerary.days,
            status: itinerary.status,
            itineraryTags: itinerary.itineraryTags,
            activityTags: itinerary.activityTags,
            notes: itinerary.notes,
            created: itinerary.created,
            updated: itinerary.updated,
            views: itineraryInteractions[0].views,
            rating: itineraryInteractions[0].rating,
            budget: itinerary.budget,
            likes: itineraryInteractions[0].likes,
            quickFilter: itinerary.quickFilter,
            creator_id: itinerary.creator_id,

        }));

        return mappedItineraries;
    } catch (error) {
        console.error('Error fetching itineraries:', error);
        throw new Error(`Failed to fetch itineraries: ${error instanceof Error ? error.message : String(error)}`);
    }
    
}

export const getItinerarySummaries = async (userId?: string) => {
    const { data, error } = await supabase
    .rpc("get_itinerary_summary", { p_creator_id: userId }) as { 
        data: ItinerarySummary[] | null, 
        error: Error | null };

    if (error) {
    console.error("Error fetching itineraries:", error);
    } else {
    console.log("User itineraries:", data);
    }

    return data;
}

export const updateItineraryStatus = async (itineraryId: string, status: number) => {
    const { error } = await supabase
    .from('itineraries')
    .update({ status: status })
    .eq('id', itineraryId);

    if (error) {
        console.error("Error updating itinerary status:", error);
    } else {
        console.log("Itinerary status updated successfully");
    }
    return { success: true };
}

export const getItineraryById = async (itineraryId: string) => {
    try {
        const supabase = createServerActionClient({ cookies });

        const { data: itinerary, error: itineraryError } = await supabase
        .from('itineraries')
        .select('id, title, duration, short_description, detailed_overview, main_image, created_at, updated_at, duration, budget, creator_id, status')
        .eq('id', itineraryId)
        .single();

        console.log(itinerary);
        
        if (itineraryError) throw itineraryError;
        
        const { data: itineraryDays, error: itineraryDaysError } = await supabase
        .from('itinerary_days')
        .select('*')
        .eq('itinerary_id', itineraryId);
        // .order('day_number', { ascending: true });
        //sort by day number
        console.log(itineraryDays);

        if (itineraryDaysError) throw itineraryDaysError;

        const { data: itineraryAccommodations, error: itineraryAccommodationsError } = await supabase
        .from('itinerary_accommodations')
        .select('*')
        .eq('itinerary_id', itineraryId);

        if (itineraryAccommodationsError) throw itineraryAccommodationsError;

        const { data: itineraryActivities, error: itineraryActivitiesError } = await supabase
        .from('itinerary_activities')
        .select('*')
        .eq('itinerary_id', itineraryId);

        if (itineraryActivitiesError) throw itineraryActivitiesError;
        
        const { data: itineraryNotes, error: itineraryNotesError } = await supabase
        .from('itinerary_notes')
        .select('*')
        .eq('itinerary_id', itineraryId);

        if (itineraryNotesError) throw itineraryNotesError;

        const { data: itineraryTags, error: itineraryTagsError } = await supabase
        .from('itinerary_tags')
        .select('*')
        .eq('itinerary_id', itineraryId);

        if (itineraryTagsError) throw itineraryTagsError;

        const {data: itinerary_interactions, error: itinerary_interactionsError} = await supabase
        .from('itinerary_interactions')
        .select('views, rating, likes')
        .eq('itinerary_id', itineraryId);

        if (itinerary_interactionsError) throw itinerary_interactionsError;

        const countries = itineraryDays.map((day: any) => day.country);
        const cities = itineraryDays.map((day: any) => day.city);
        const itineraryTagList = itineraryTags.map((tag: any) => itineraryTagsMap[tag.tag_id].name);
        const activityTagList = itineraryActivities.map((activity: any) => activity.tag_id);
        // const continents = itineraryDays.map((day: any) => day.continent);

        // Sanitize the data
        const returnItinerary: Itinerary = {
            id: itinerary.id,
            title: itinerary.title,
            duration: itinerary.duration,
            shortDescription: itinerary.short_description,
            detailedOverview: itinerary.detailed_overview,
            mainImage: itinerary.main_image,
            countries: countries,
            cities: cities,
            days: itineraryDays,
            status: itinerary.status,
            itineraryTags: itineraryTagList,
            activityTags: activityTagList,
            notes: itineraryNotes,
            budget: itinerary.budget,
            created: itinerary.created_at,
            updated: itinerary.updated_at,
            views: itinerary_interactions[0].views,
            rating: itinerary_interactions[0].rating,
            likes: itinerary_interactions[0].likes,
            creator_id: itinerary.creator_id,
        }

        returnItinerary.days.forEach((day: any) => {
            day.activities = itineraryActivities.filter((activity: any) => activity.day_number === day.day_number);
        });
        
        return returnItinerary;
    } catch (error) {
        console.error('Error retrieving itinerary:', error);
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
        
        // Verify user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error("Not authenticated");
        }

        // Delete the itinerary
        const { error: itineraryError } = await supabase
        .from('itineraries')
        .delete()
        .eq('id', itineraryId);

        if (itineraryError) {
            throw itineraryError;
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting itinerary:', error);
        throw new Error(`Failed to delete itinerary: ${error instanceof Error ? error.message : String(error)}`);
    }
}
