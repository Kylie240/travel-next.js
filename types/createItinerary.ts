import { Day } from "./Day";
import { ItineraryStatus } from "./itineraryStatus";
import { Note } from "./Note";

type City = { city: string, country: string};

export type CreateItinerary = {
    status: ItineraryStatus;
    title: string;
    shortDescription: string;
    mainImage: string;
    detailedOverview?: string;
    duration: number;
    countries: string[];
    cities: City[];
    days: Day[];
    itineraryTags: string[];
    notes: Note[];
    budget?: number;
}