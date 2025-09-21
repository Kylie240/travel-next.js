export type SavedItinerary = {
    id: string;        // uuid in Postgres maps to string in TS
    title: string;
    shortDescription: string;
    mainImage: string | null; // allow null if some itineraries don't have an image
    creatorName: string;
    creatorId: string;
    creatorImage: string;
    creatorUsername: string;
    countries: string[];
    views: number;
    likes: number;
    saves: number;
  };