// import "server-only"
// import { ItineraryStatus } from "@/types/itineraryStatus"
// import { Itinerary } from "@/types/itinerary"

// type GetItineraryOptions = {
//     filters?: {
//         destination?: string,
//         duration?: string,
//         durationMin?: number,
//         durationMax?: number,
//         continents?: string[],
//         activityTags?: string[],
//         itineraryTags?: string[],
//         countries?: string[],
//         budgetMin?: number,
//         budgetMax?: number,
//         status?: ItineraryStatus[] | null,
//         sort?: string,
//         quickFilter?: string,
//     },
//     pagination?: {
//         pageSize?: number;
//         page?: number;
//     }
// }

// export const getItineraries = async (options?: GetItineraryOptions) => {
//     const page = options?.pagination?.page || 1
//     const pageSize = options?.pagination?.pageSize || 10
//     const {destination, duration, durationMin, durationMax, budgetMin, budgetMax, continents, activityTags, itineraryTags, countries, status, sort, quickFilter} = options?.filters || {}

//     let query = firestore
//         .collection('itineraries')
//         .orderBy('created', 'desc')

//     if (destination) {
//         query = query.where('countries', 'array-contains', destination)
//         query = query.where('cities', 'array-contains', destination)
//     }
//     if (duration) {
//         const [min, max] = duration.split('-').map(Number)
//         if (min && max) {
//             query = query.where('duration', '>=', min).where('duration', '<=', max)
//         } else if (min) {
//             query = query.where('duration', '>=', min)
//         } else if (max) {
//             query = query.where('duration', '<=', max)
//         }
//     }
//     if (durationMin !== null && durationMin !== undefined) {
//         query = query.where('duration', '>=', durationMin)
//     }
//     if (durationMax !== null && durationMax !== undefined) {
//         query = query.where('duration', '<=', durationMax)
//     }
//     if (continents && continents.length === 1) {
//         query = query.where('continents', 'array-contains', continents[0])
//     }
//     if (activityTags && activityTags.length === 1) {
//         query = query.where('activityTags', 'array-contains', activityTags[0])
//     }
//     if (itineraryTags && itineraryTags.length === 1) {
//         query = query.where('itineraryTags', 'array-contains', itineraryTags[0])
//     }
//     if (countries && countries.length === 1) {
//         query = query.where('countries', 'array-contains', countries[0])
//     }
//     if (budgetMin !== null && budgetMin !== undefined) {
//         query = query.where('budget', '>=', budgetMin)
//     }
//     if (budgetMax !== null && budgetMax !== undefined) {
//         query = query.where('budget', '<=', budgetMax)
//     }
//     if (status && status.length > 0) {
//         query = query.where('status', 'in', status)
//     }

//     // Handle sorting
//     if (sort) {
//         switch(sort) {
//             case 'most-recent':
//                 query = query.orderBy('updated', 'desc');
//                 break;
//             case 'most-viewed':
//                 query = query.orderBy('views', 'desc');
//                 break;
//             case 'best-rated':
//                 query = query.orderBy('rating', 'desc');
//                 break;
//             case 'price-low':
//                 query = query.orderBy('price', 'asc');
//                 break;
//             case 'price-high':
//                 query = query.orderBy('price', 'desc');
//                 break;
//             default:
//                 query = query.orderBy('updated', 'desc');
//         }
//     } else {
//         query = query.orderBy('updated', 'desc')
//     }

//     if (quickFilter && quickFilter !== 'All') {
//         query = query.where('quickFilter', '==', quickFilter)
//     }

//     try {
//         // If we have multiple tags to filter by, we need to do it in memory
//         let itinerariesSnapshot = await query
//             .limit(pageSize * 3) // Fetch more to account for post-filtering
//             .offset((page - 1) * pageSize)
//             .get();

//         // Get initial results
//         let itineraries = itinerariesSnapshot.docs.map(
//             doc => {
//                 const data = doc.data();
//                 return {
//                     id: doc.id,
//                     ...data,
//                     // Convert Firestore Timestamps to ISO strings
//                     created: data.created?.toDate().toISOString(),
//                     updated: data.updated?.toDate().toISOString(),
//                 } as Itinerary
//             }
//         );

//         // Apply additional filters in memory if needed
//         if (continents && continents.length > 1) {
//             itineraries = itineraries.filter(item => 
//                 item.continents?.some(c => continents.includes(c)) || false
//             );
//         }
//         if (activityTags && activityTags.length > 1) {
//             itineraries = itineraries.filter(item => 
//                 item.activityTags?.some(tag => activityTags.includes(tag)) || false
//             );
//         }
//         if (itineraryTags && itineraryTags.length > 1) {
//             itineraries = itineraries.filter(item => 
//                 item.itineraryTags?.some(tag => itineraryTags.includes(tag)) || false
//             );
//         }
//         if (countries && countries.length > 1) {
//             itineraries = itineraries.filter(item => 
//                 item.countries?.some(c => countries.includes(c)) || false
//             );
//         }

//         // Slice to get the correct page
//         const total = itineraries.length;
//         itineraries = itineraries.slice(0, pageSize);

//         return {
//             data: itineraries,
//             total,
//             totalPages: Math.ceil(total / pageSize),
//             currentPage: page
//         }
//     } catch (error) {
//         console.error('Error fetching itineraries:', error);
//         throw error;
//     }
// }

// export const getItineraryById = async (id: string) => {
//     const itinerary = await firestore
//     .collection('itineraries')
//     .doc(id)
//     .get()

//     const itineraryData = {
//         id: itinerary.id,
//         ...itinerary.data(),
//     } as Itinerary;
//     return itineraryData;
// }

// export const getItineraryByUserId = async (userId?: string) => {
//     if (!userId) {
//         return [];
//     }
    
//     const itinerariesSnapshot = await firestore
//         .collection("itineraries")
//         .where("creatorId", "==", userId)
//         .get();

//     const itinerariesData = itinerariesSnapshot.docs.map(
//         (doc) => ({
//             id: doc.id,
//             ...doc.data(),
//         } as Itinerary)
//     );
    
//     return itinerariesData;
// }

// export const deleteItineraryById = async (id: string) => {
//     await firestore.collection('itineraries').doc(id).delete()
// }

// export const updateItineraryById = async (id: string, data: Partial<Itinerary>) => {
//     await firestore.collection('itineraries').doc(id).update(data)
// }