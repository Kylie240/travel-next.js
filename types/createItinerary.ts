import { Day } from "./Day";
import { ItineraryStatus } from "./itineraryStatus";
import { Note } from "./Note";

type Country = { value: string};
type City = { city: string, country: string};

export type CreateItinerary = {
    status: ItineraryStatus;
    title: string;
    shortDescription: string;
    mainImage: string;
    detailedOverview?: string;
    duration: number;
    countries: Country[];
    days: Day[];
    itineraryTags: string[];
    notes: Note[];
}