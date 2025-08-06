"use server"

import { firestore } from "@/firebase/server"
import { auth } from "@/firebase/server"
import { createSchema } from "@/validation/createSchema";

export const saveNewItinerary = async (data: {
    status: "draft" | "published",
    length: number,
    name: string,
    shortDescription: string,
    mainImage: string,
    detailedOverview?: string,
    duration: number,
    days: {
        id: string,
        image?: string,
        cityName: string,
        countryName: string,
        title: string,
        description: string,
        notes?: string,
        activities: {
            id: string,
            time?: string,
            duration?: string,
            image?: string,
            title: string,
            description: string,
            type: string,
            link?: string,
            photos?: string[],
            price?: number,
        }[],
        showAccommodation: boolean,
        accommodation: {
            name: string,
            type: string,
            location: string,
            price?: number,
            photos?: string[],
        },

    }[],
    countries: {
        value: string,
    }[],
    itineraryTags: string[],
    notes: {
        id: string,
        title: string,
        content: string,
    }[],
    token: string,
    creatorId: string,
}) => {
    const {token, ...itineraryData} = data;
    const verifiedToken = await auth.verifyIdToken(token);

    if (!verifiedToken.uid) {
        throw new Error("Unauthorized")
    }

    const validation = createSchema.safeParse(itineraryData);
    if (!validation.success) {
        throw new Error(`Invalid data ${validation.error.issues[0]?.message}`)
    }

    const itinerary = await firestore.collection('itineraries').add({
        ...itineraryData,
        created: new Date(),
        updated: new Date(),
    });

    return {
        itineraryId: itinerary.id,
    }
}