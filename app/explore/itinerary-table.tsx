import { getItineraries } from "@/data/itineraries";

export default async function ItineraryTable() {
    const {data} = await getItineraries();
    console.log({data});
    
    return (
        <div>
            <h1>Itinerary Table</h1>
        </div>
    )
}