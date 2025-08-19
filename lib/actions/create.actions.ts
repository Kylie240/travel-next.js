"use server";

import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { CreateItinerary } from "@/types/createItinerary";

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

export const createItinerary = async (itinerary: CreateItinerary) => {
    const token = cookies().get("token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });

        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        // First check if the user exists in our users table
        const { data: existingUser, error: userError } = await supabase
            .from('user_id')
            .select('id')
            .eq('user_id', userId)
            .single();

        let creatorId = userId;
        
        // If we have a users table and the user exists, use their Supabase ID
        if (existingUser?.id) {
            creatorId = existingUser.id;
        }

        const {data: itineraryRow, error: itineraryError} = await supabase
        .from('itineraries')
        .insert([{
            creator_id: userId,
            title: itinerary.title,
            short_description: itinerary.shortDescription,
            main_image: itinerary.mainImage,
            countries: itinerary.countries,
            tags: itinerary.itineraryTags,
            status: itinerary.status,
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