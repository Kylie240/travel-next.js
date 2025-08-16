"use server"

import { firestore } from "@/firebase/server"
import { auth } from "@/firebase/server"
import { Day } from "@/types/Day";
import { Note } from "@/types/Note";
import { createSchema } from "@/validation/createSchema";

export const saveNewItinerary = async (data: {
    status: "draft" | "published",
    title: string,
    shortDescription: string,
    mainImage: string,
    detailedOverview?: string,
    duration: number,
    days: Day[],
    countries: {
        value: string,
    }[],
    itineraryTags: string[],
    notes: Note[],
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