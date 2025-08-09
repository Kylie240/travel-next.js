import { Day } from "./Day";
import { ItineraryStatus } from "./itineraryStatus";
import { Note } from "./Note";

type City = { city: string, country: string};

export type Itinerary = {
    id: string;
    name: string;
    shortDescription: string;
    detailedOverview?: string;
    mainImage: string;
    length: number;
    countries: string[];
    cities: City[];
    continents: string[];
    days: Day[];
    duration: number;
    status: ItineraryStatus;
    itineraryTags: string[];
    activityTags: string[];
    notes: Note[];
    created: string;  // ISO date string
    updated: string;  // ISO date string
    createdBy: string;
    views?: number;
    rating?: number;
    price?: number;
    quickFilter?: string;
    details?: string;
    creatorId?: string;
}