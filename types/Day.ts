import { Accommodation } from "./Accommodation";
import { Activity } from "./Activity";

export type Day = {
    id: number,
    image?: string,
    cityName: string,
    provinceName?: string,
    countryName: string,
    title: string,
    description?: string,
    notes?: string,
    activities?: Activity[],
    showAccommodation: boolean,
    accommodation?: Accommodation,
}