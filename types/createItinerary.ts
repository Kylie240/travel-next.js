import { Day } from "./Day";
import { ItineraryStatus } from "./itineraryStatus";
import { Note } from "./Note";

type City = { city: string, country: string};

export type CreateItinerary = {
    status: number;
    title: string;
    shortDescription: string;
    mainImage: string;
    detailedOverview?: string;
    duration: number;
    countries?: string[];
    cities?: City[];
    days: Day[];
    itineraryTags?: number[];
    notes?: Note[];
    budget?: number;
}