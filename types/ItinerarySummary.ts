export type ItinerarySummary = {
    id: string;        // uuid in Postgres maps to string in TS
    title: string;
    status: number;
    mainImage: string | null; // allow null if some itineraries don't have an image
    views: number;
    likes: number;
  };