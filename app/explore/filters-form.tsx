"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdvancedFilterDialog } from "@/components/ui/advanced-filter-dialog"
import { activityTagsMap, itineraryTagsMap, quickFilters, sortOptions } from "@/lib/constants/tags"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { QuickFilterList } from "@/components/ui/quick-filter-list"
import { useState } from "react"

const formSchema = z.object({
    destination: z.string().optional(),
    duration: z.string().optional(),
    budget: z.string().optional(),
    itineraryTags: z.array(z.string()).optional(),
    activityTags: z.array(z.string()).optional(),
    sort: z.string().optional(),
    continents: z.array(z.string()).optional(),
    regions: z.array(z.string()).optional(),
    accommodation: z.array(z.string()).optional(),
    transportation: z.array(z.string()).optional(),
    rating: z.string().optional(),
    quickFilter: z.string().optional(),
})

export default function FiltersForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [advancedFilters, setAdvancedFilters] = useState({
        itineraryTags: searchParams.get("itineraryTagsMap")?.split(",") || [],
        activityTags: searchParams.get("activityTagsMap")?.split(",") || [],
        regions: searchParams.get("regions")?.split(",") || [],
        continents: searchParams.get("continents")?.split(",") || [],
        accommodation: searchParams.get("accommodation")?.split(",") || [],
        transportation: searchParams.get("transportation")?.split(",") || [],
        rating: searchParams.get("rating") || "",
        sort: searchParams.get("sort") || "most-recent",
        quickFilter: searchParams.get("quickFilter") || "All"
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            destination: searchParams.get("destination") || "",
            duration: searchParams.get("duration") || "",
            budget: searchParams.get("budget") || "",
            itineraryTags: advancedFilters.itineraryTags,
            activityTags: advancedFilters.activityTags,
            sort: advancedFilters.sort,
            continents: advancedFilters.continents,
            regions: advancedFilters.regions,
            accommodation: advancedFilters.accommodation,
            transportation: advancedFilters.transportation,
            rating: advancedFilters.rating,
            quickFilter: advancedFilters.quickFilter
        }
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        const newSearchParams = new URLSearchParams();
        if (data.destination) newSearchParams.set("destination", data.destination);
        if (data.duration) newSearchParams.set("duration", data.duration);
        if (data.budget) newSearchParams.set("budget", data.budget);
        if (data.itineraryTags && data.itineraryTags.length > 0) newSearchParams.set("itineraryTags", data.itineraryTags.join(","));
        if (data.activityTags && data.activityTags.length > 0) newSearchParams.set("activityTags", data.activityTags.join(","));
        if (data.sort) newSearchParams.set("sort", data.sort);
        if (data.continents && data.continents.length > 0) newSearchParams.set("continents", data.continents.join(","));
        if (data.regions && data.regions.length > 0) newSearchParams.set("regions", data.regions.join(","));
        if (data.accommodation && data.accommodation.length > 0) newSearchParams.set("accommodation", data.accommodation.join(","));
        if (data.transportation && data.transportation.length > 0) newSearchParams.set("transportation", data.transportation.join(","));
        if (data.rating) newSearchParams.set("rating", data.rating);
        if (data.quickFilter) newSearchParams.set("quickFilter", data.quickFilter);
        newSearchParams.set("page", "1");

        router.push(`/explore?${newSearchParams.toString()}`);
    }

    const handleAdvancedFilterChange = (filters: typeof advancedFilters) => {
        setAdvancedFilters(filters);
        
        // Update form values
        form.setValue("itineraryTags", filters.itineraryTags);
        form.setValue("activityTags", filters.activityTags);
        form.setValue("regions", filters.regions);
        form.setValue("continents", filters.continents);
        form.setValue("accommodation", filters.accommodation);
        form.setValue("transportation", filters.transportation);
        form.setValue("rating", filters.rating);
        form.setValue("sort", filters.sort);
        form.setValue("quickFilter", filters.quickFilter);

        // Trigger form submission
        form.handleSubmit(onSubmit)();
    };

    const filters = {
        destinations: ["Japan", "Italy", "Costa Rica", "Thailand", "Greece", "Switzerland"],
        duration: [
            {label: "1-3 days", value: "1-3"},
            {label: "4-7 days", value: "4-7"},
            {label: "8-14 days", value: "8-14"},
            {label: "15-21 days", value: "15-21"},
            {label: "21+ days", value: "21+"}
        ],
        budget: ["Budget Friendly", "Standard", "Mid-Range", "Upscale", "Luxury"],
        quickFilters,
        sortOptions,
        itineraryTagsMap,
        activityTagsMap,
    }

    return <FormProvider {...form}> 
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col mb-8">     
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Select
                        value={form.watch("destination")}
                        onValueChange={(value) =>
                        form.setValue("destination", value === "all" ? "" : value)
                        }
                        disabled={form.formState.isSubmitting}
                    >
                        <SelectTrigger className="w-full rounded-xl px-3 py-2.5">
                        <SelectValue placeholder="Destination" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">All Destinations</SelectItem>
                        {filters.destinations.map((dest) => (
                            <SelectItem key={dest} value={dest}>
                            {dest}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={form.watch("duration")}
                        onValueChange={(value) =>
                        form.setValue("duration", value === "all" ? "" : value)
                        }
                        disabled={form.formState.isSubmitting}
                    >
                        <SelectTrigger className="w-full rounded-xl px-3 py-2.5">
                        <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">Any Duration</SelectItem>
                        {filters.duration.map((dur) => (
                            <SelectItem key={dur.value} value={dur.value}>
                            {dur.label}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={form.watch("budget")}
                        onValueChange={(value) =>
                        form.setValue("budget", value === "all" ? "" : value)
                        }
                        disabled={form.formState.isSubmitting}
                    >
                        <SelectTrigger className="w-full rounded-xl px-3 py-2.5">
                        <SelectValue placeholder="Budget" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">Any Budget</SelectItem>
                        {filters.budget.map((b) => (
                            <SelectItem key={b} value={b}>
                            {b}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <div className="flex justify-between">
                        <div className="flex justify-end rounded-xl">
                            <AdvancedFilterDialog
                                itineraryTags={filters.itineraryTagsMap}
                                activityTags={filters.activityTagsMap}
                                selectedFilters={advancedFilters}
                                onFilterChange={handleAdvancedFilterChange}
                            />
                        </div>
                        <Button type="submit" className="bg-gray-900 text-white rounded-xl px-4 py-2">Search</Button>
                    </div>
                </div>
                <div className="hidden justify-between items-center max-w-screen-lg mx-auto gap-2">
                    {/* Quick Filters */}
                    <div className="mt-2 flex-1">
                        <QuickFilterList
                            filters={filters.quickFilters}
                            selectedFilter={form.watch("quickFilter") || "All"}
                            onFilterChange={(filter) =>
                            form.setValue("quickFilter", filter)
                            }
                        />
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center mb-8">
                <p>1000 Results</p>
                <div className="flex items-center gap-2">
                    <p>Sort By:</p>
                    <select
                        className="px-4 py-2 cursor-pointer border rounded-lg focus:outline-none focus:ring-2 focus:ring-travel-900 bg-white"
                        value={form.watch("sort")}
                        onChange={(e) =>
                        form.setValue("sort", e.target.value)
                        }
                    >
                        {filters.sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                        ))}
                    </select>
                </div>
            </div>
        </form>
    </FormProvider>
}