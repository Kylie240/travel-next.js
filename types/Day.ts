import { Accommodation } from "./Accomodation";
import { Activity } from "./Activity";

export type Day = {
    id: string,
    image?: string,
    cityName: string,
    countryName: string,
    title: string,
    description?: string,
    notes?: string,
    activities: Activity[],
    showAccommodation: boolean,
    accommodation: Accommodation,
}