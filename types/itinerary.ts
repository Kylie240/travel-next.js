import { Day } from "./Day";
import { ItineraryStatus } from "./itineraryStatus";
import { Note } from "./Note";

type Country = string | { value: string };

export type Itinerary = {
    id: string;
    name: string;
    shortDescription: string;
    detailedOverview?: string;
    mainImage: string;
    length: number;
    countries: Country[];
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
}