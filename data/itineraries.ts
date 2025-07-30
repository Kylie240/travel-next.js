import "server-only"
import { firestore } from "@/firebase/server"
import { ItineraryStatus } from "@/types/itineraryStatus"

type GetItineraryOptions = {
    filters?: {
        destination?: string,
        duration?: string,
        budget?: string,
        continents?: string[],
        activityTags?: string[],
        itineraryTags?: string[],
        countries?: string[],
        price?: {
            min?: number;
            max?: number;
        }
        status?: ItineraryStatus[] | null,
        pagination?: {
            pageSize?: number;
            page?: number;
        }
    }
}

export const getItineraries = async (options?: GetItineraryOptions) => {
    const page = options?.filters?.pagination?.page || 1
    const pageSize = options?.filters?.pagination?.pageSize || 10
    const {destination, duration, budget, continents, activityTags, itineraryTags, countries, price, status} = options?.filters || {}

    const query = firestore.collection('itineraries').orderBy('updated', 'desc')

    if (destination) {
        query.where('destination', '==', destination)
    }
    if (duration) {
        query.where('duration', '==', duration)
    }
    if (budget) {
        query.where('budget', '==', budget)
    }
    if (continents) {
        query.where('continents', 'array-contains-any', continents)
    }
    if (activityTags) {
        query.where('activityTags', 'array-contains-any', activityTags)
    }
    if (itineraryTags) {
        query.where('itineraryTags', 'array-contains-any', itineraryTags)
    }
    if (countries) {
        query.where('countries', 'array-contains-any', countries)
    }
    if (price) {
        query.where('price', '>=', price.min)
        query.where('price', '<=', price.max)
    }
    if (status) {
        query.where('status', 'in', status)
    }

    const itinerariesSnapshot = await query
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .get();

    const itineraries = itinerariesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }))

    return {
        data: itineraries,
        total: itinerariesSnapshot.size,
    }
}