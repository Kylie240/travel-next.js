import { Suspense } from "react";
import FiltersForm from "./filters-form";
import { getItineraries } from "@/data/itineraries";

export default async function SearchPage({
searchParams
}: {
    searchParams: Promise<any>
}
) {
    const searchParamsValues = await searchParams;
    const page = searchParamsValues.page;
    const sort = searchParamsValues.sort;
    const quickFilter = searchParamsValues.quickFilter;
    const destination = searchParamsValues.destination;
    const durationMin = searchParamsValues?.durationMin;
    const durationMax = searchParamsValues?.durationMax;
    const budgetMin = searchParamsValues?.budgetMin;
    const budgetMax = searchParamsValues?.budgetMax;
    const itineraryTags = searchParamsValues.itineraryTags;
    const activityTags = searchParamsValues.activityTags;
    const continents = searchParamsValues.continents;

    const itineraries = await getItineraries({
        pagination: {
            page: parseInt(searchParamsValues.page || "1"),
            pageSize: 10
        },
        filters: {
            sort,
            quickFilter,
            destination,
            durationMin,
            durationMax,
            budgetMin,
            budgetMax,
            itineraryTags,
            activityTags,
            continents,
            status: ['published'],
        },
    })

    console.log(itineraries)
    
    return (
        <div className="min-h-screen bg-white py-8">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
                {/* Filters Bar */}
                <div className="flex flex-col mb-8">
                    <Suspense fallback={<div>Loading...</div>}>
                        <FiltersForm />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}