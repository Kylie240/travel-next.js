"use server";

import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { CreateItinerary } from "@/types/createItinerary";
import { supabase } from "@/utils/supabase/superbase-client";
import { ItineraryStatusEnum } from "@/enums/itineraryStatusEnum";

type CreateActivity = {
    day_id: string,
    activity_number: number,
    time: string,
    duration: string,
    image: string,
    title: string,
    description: string,
    location: string,
    type: string,
    link: string,
}

export const getItineraries = async (options?: GetItineraryOptions) => {
    const page = options?.pagination?.page || 1;
    const pageSize = options?.pagination?.pageSize || 10;
    const firstItemIndex = (page - 1) * pageSize;
    const lastItemIndex = firstItemIndex + pageSize - 1;
    const {destination, durationMin, durationMax, budgetMin, budgetMax, continents, activityTags, itineraryTags, countries, sort, quickFilter} = options?.filters ?? {};

    let query = supabase.from('itineraries').select('*')

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
         query = query.eq('status', ItineraryStatusEnum.Published)

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
         if (error) throw error
         console.log(data)

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

        const activityTags = itinerary.days.flatMap(day => day.activities?.map(activity => activity.type));
        const cities = itinerary.days.map(day => day.cityName);

        const {data: itineraryRow, error: itineraryError} = await supabase
        .from('itineraries')
        .insert([{
            creator_id: userId,
            title: itinerary.title,
            short_description: itinerary.shortDescription,
            main_image: itinerary.mainImage,
            countries: itinerary.countries,
            cities: cities,
            itinerary_tags: itinerary.itineraryTags,
            activity_tags: activityTags,
            status: itinerary.status,
            duration: itinerary.duration,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }])
        .select()
        .single();

        if (itineraryError) {
            console.error('Error creating itinerary:', itineraryError);
            throw new Error(`Failed to create itinerary: ${itineraryError.message}`);
        }

        const itineraryId = itineraryRow.id;
        console.log(itinerary);

        // Insert Days
        if (itinerary?.days?.length > 0) {
            const dayRows = itinerary.days.map((day, index) => ({
                itinerary_id: itineraryId,
                day_number: index + 1,
                title: day.title,
                description: day.description,
                notes: day.notes,
                city: day.cityName,
                country: day.countryName
            }))

            const {data: insertedDays, error: dayError} = await supabase
            .from('itinerary_days')
            .insert(dayRows)
            .select()
            
            if (dayError) throw dayError;

            // Map days for activities
            const activityRows: CreateActivity[] = [];
            for (let i = 0; i < itinerary.days.length; i++) {
                const dayId = insertedDays[i].id;
                const activities = itinerary.days[i].activities || [];

                if (activities.length > 0) {
                    const activityRow: CreateActivity[] = activities.map((activity, index) => ({
                        day_id: dayId,
                        activity_number: index + 1,
                        time: activity.time || '',
                        duration: activity.duration || '',
                        image: activity.image || '',
                        title: activity.title,
                        description: activity.description || '',
                        location: activity.location || '',
                        type: activity.type || '',
                        link: activity.link || '',
                    }))
                    activityRows.push(...activityRow);
                }

                const {error: activityError} = await supabase
                .from('itinerary_activities')
                .insert(activityRows);

                if (activityError) throw activityError;
            }
        }

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
        console.log(itineraries);
        return itineraries;
    } catch (error) {
        console.error('Error creating itinerary:', error);
        throw new Error(`Failed to create itinerary: ${error instanceof Error ? error.message : String(error)}`);
    }
    
}