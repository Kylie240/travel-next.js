import { Day } from "./Day";
import { ItineraryStatus } from "./itineraryStatus";
import { Note } from "./Note";

export type Itinerary = {
    id: string;
    name: string;
    shortDescription: string;
    detailedOverview?: string;
    mainImage: string;
    length: number;
    countries: string[];
    continents: string[];
    days: Day[];
    status: ItineraryStatus;
    itineraryTags: string[];
    activityTags: string[];
    notes: Note[];
    created: Date;
    updated: Date;
    createdBy: string;
    views?: number;
    rating?: number;
    price?: number;
    quickFilter?: string;
}