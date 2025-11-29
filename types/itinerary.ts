import { Day } from "./Day";
import { ItineraryStatus } from "./itineraryStatus";
import { Note } from "./Note";

type City = { city: string, country: string};

export type Itinerary = {
    id: string;
    title: string;
    duration: number;
    shortDescription: string;
    detailedOverview?: string;
    mainImage: string;
    countries: string[];
    cities: City[];
    days: Day[];
    status: number;
    itineraryTags: number[];
    activityTags: number[];
    notes: Note[];
    created: string;  // ISO date string
    updated: string;  // ISO date string
    views?: number;
    rating?: number;
    budget?: number;
    likes?: number;
    quickFilter?: string;
    creatorId?: string;
    viewPermission: number;
    editPermission: number;
    creator?: any; //create new type
}