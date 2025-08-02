import "server-only"
import { firestore } from "@/firebase/server"
import { ItineraryStatus } from "@/types/itineraryStatus"
import { Itinerary } from "@/types/itinerary"

type GetItineraryOptions = {
    filters?: {
        destination?: string,
        durationMin?: number,
        durationMax?: number,
        continents?: string[],
        activityTags?: string[],
        itineraryTags?: string[],
        countries?: string[],
        budgetMin?: number,
        budgetMax?: number,
        status?: ItineraryStatus[] | null,
        sort?: string,
        quickFilter?: string,
    },
    pagination?: {
        pageSize?: number;
        page?: number;
    }
}

export const getItineraries = async (options?: GetItineraryOptions) => {
    const page = options?.pagination?.page || 1
    const pageSize = options?.pagination?.pageSize || 10
    const {destination, durationMin, durationMax, budgetMin, budgetMax, continents, activityTags, itineraryTags, countries, status, sort, quickFilter} = options?.filters || {}

    let query = firestore
        .collection('itineraries')
        .orderBy('created', 'desc')

    if (destination) {
        query = query.where('countries', 'array-contains-any', [destination])   
    }
    if (durationMin !== null && durationMin !== undefined) {
        query = query.where('duration', '>=', durationMin)
    }
    if (durationMax !== null && durationMax !== undefined) {
        query = query.where('duration', '<=', durationMax)
    }
    if (continents && continents.length > 0) {
        query = query.where('continents', 'array-contains-any', continents)
    }
    if (activityTags && activityTags.length > 0) {
        query = query.where('activityTags', 'array-contains-any', activityTags)
    }
    if (itineraryTags && itineraryTags.length > 0) {
        query = query.where('itineraryTags', 'array-contains-any', itineraryTags)
    }
    if (countries && countries.length > 0) {
        query = query.where('countries', 'array-contains-any', countries)
    }
    if (budgetMin !== null && budgetMin !== undefined) {
        query = query.where('budget', '>=', budgetMin)
    }
    if (budgetMax !== null && budgetMax !== undefined) {
        query = query.where('budget', '<=', budgetMax)
    }
    if (status) {
        query = query.where('status', 'in', status)
    }

    // Handle sorting
    if (sort) {
        switch(sort) {
            case 'most-recent':
                query = query.orderBy('updated', 'desc');
                break;
            case 'most-viewed':
                query = query.orderBy('views', 'desc');
                break;
            case 'best-rated':
                query = query.orderBy('rating', 'desc');
                break;
            case 'price-low':
                query = query.orderBy('price', 'asc');
                break;
            case 'price-high':
                query = query.orderBy('price', 'desc');
                break;
            default:
                query = query.orderBy('updated', 'desc');
        }
    } else {
        query = query.orderBy('updated', 'desc')
    }

    if (quickFilter && quickFilter !== 'All') {
        query = query.where('quickFilter', '==', quickFilter)
    }

    try {
        const itinerariesSnapshot = await query
            .limit(pageSize)
            .offset((page - 1) * pageSize)
            .get();

        const itineraries = itinerariesSnapshot.docs.map(
            doc => {
                const data = doc.data()
                return {
                    id: doc.id,
                    ...data,
                } as Itinerary
            }
        )

        const totalQuery = query.count();
        const totalSnapshot = await totalQuery.get();
        const total = totalSnapshot.data().count;

        return {
            data: itineraries,
            total,
            totalPages: Math.ceil(total / pageSize),
            currentPage: page
        }
    } catch (error) {
        console.error('Error fetching itineraries:', error);
        throw error;
    }
}

export const getItineraryById = async (id: string) => {
    const itinerary = await firestore.collection('itineraries').doc(id).get()
    return itinerary.data() as Itinerary
}

export const getItineraryByUserId = async (userId: string) => {
    const itineraries = await firestore.collection('itineraries').where('userId', '==', userId).get()
    return itineraries.docs.map(doc => doc.data() as Itinerary)
}

export const deleteItineraryById = async (id: string) => {
    await firestore.collection('itineraries').doc(id).delete()
}

export const updateItineraryById = async (id: string, data: Partial<Itinerary>) => {
    await firestore.collection('itineraries').doc(id).update(data)
}