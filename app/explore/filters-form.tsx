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
import { useEffect, useState } from "react"
import { SearchIcon } from "lucide-react"

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

type FormValues = z.infer<typeof formSchema>

type AdvancedFiltersState = {
    itineraryTags: string[]
    activityTags: string[]
    regions: string[]
    continents: string[]
    accommodation: string[]
    transportation: string[]
    rating: string
    sort: string
    quickFilter: string
}

function splitParam(value: string | null): string[] {
    if (!value?.trim()) return []
    return value.split(",").map((s) => s.trim()).filter(Boolean)
}

type SearchParamsLike = {
    get: (name: string) => string | null
}

function readAdvancedFilters(searchParams: SearchParamsLike): AdvancedFiltersState {
    const itineraryTags = splitParam(searchParams.get("itineraryTags"))
    const activityTags = splitParam(searchParams.get("activityTags"))

    return {
        itineraryTags:
            itineraryTags.length > 0
                ? itineraryTags
                : splitParam(searchParams.get("itineraryTagsMap")),
        activityTags:
            activityTags.length > 0
                ? activityTags
                : splitParam(searchParams.get("activityTagsMap")),
        regions: splitParam(searchParams.get("regions")),
        continents: splitParam(searchParams.get("continents")),
        accommodation: splitParam(searchParams.get("accommodation")),
        transportation: splitParam(searchParams.get("transportation")),
        rating: searchParams.get("rating") || "",
        sort: searchParams.get("sort") || "most-recent",
        quickFilter: searchParams.get("quickFilter") || "All",
    }
}

function readFormValues(searchParams: SearchParamsLike): FormValues {
    const advanced = readAdvancedFilters(searchParams)
    return {
        destination: searchParams.get("destination") || "",
        duration: searchParams.get("duration") || "",
        budget: searchParams.get("budget") || "",
        itineraryTags: advanced.itineraryTags,
        activityTags: advanced.activityTags,
        sort: advanced.sort,
        continents: advanced.continents,
        regions: advanced.regions,
        accommodation: advanced.accommodation,
        transportation: advanced.transportation,
        rating: advanced.rating,
        quickFilter: advanced.quickFilter,
    }
}

const EMPTY_ADVANCED_FILTERS: AdvancedFiltersState = {
    itineraryTags: [],
    activityTags: [],
    regions: [],
    continents: [],
    accommodation: [],
    transportation: [],
    rating: "",
    sort: "most-recent",
    quickFilter: "All",
}

const EMPTY_FORM_VALUES: FormValues = {
    destination: "",
    duration: "",
    budget: "",
    itineraryTags: [],
    activityTags: [],
    sort: "most-recent",
    continents: [],
    regions: [],
    accommodation: [],
    transportation: [],
    rating: "",
    quickFilter: "All",
}

export default function FiltersForm({
  resultsCount,
  destinations = [],
}: {
  resultsCount?: number
  destinations?: string[]
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchKey = searchParams.toString()

    const [advancedFilters, setAdvancedFilters] = useState(() =>
        readAdvancedFilters(searchParams)
    );

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: readFormValues(searchParams),
    })

    // Keep selects in sync when Clear search (or any URL change) updates query params.
    useEffect(() => {
        const nextAdvanced = readAdvancedFilters(searchParams)
        const nextValues = readFormValues(searchParams)
        setAdvancedFilters(nextAdvanced)
        form.reset(nextValues)
        // form.reset is stable enough; only re-run when the query string changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchKey])

    const onSubmit = async (data: FormValues) => {
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
        setAdvancedFilters(filters)

        const nextValues: FormValues = {
            ...form.getValues(),
            itineraryTags: filters.itineraryTags,
            activityTags: filters.activityTags,
            regions: filters.regions,
            continents: filters.continents,
            accommodation: filters.accommodation,
            transportation: filters.transportation,
            rating: filters.rating,
            sort: filters.sort,
            quickFilter: filters.quickFilter,
        }

        form.reset(nextValues)
        void onSubmit(nextValues)
    };

    const handleClearAll = () => {
        setAdvancedFilters(EMPTY_ADVANCED_FILTERS)
        form.reset(EMPTY_FORM_VALUES)
        router.push("/explore")
    };

    const filters = {
        destinations,
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
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    <Select
                        value={form.watch("destination") || "all"}
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
                        value={form.watch("duration") || "all"}
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
                        value={form.watch("budget") || "all"}
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
                    <div className="flex justify-between items-center gap-2">
                        <div className="flex justify-end">
                            <AdvancedFilterDialog
                                itineraryTags={filters.itineraryTagsMap}
                                activityTags={filters.activityTagsMap}
                                selectedFilters={advancedFilters}
                                onFilterChange={handleAdvancedFilterChange}
                            />
                        </div>
                        <div className="flex justify-end rounded-xl gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleClearAll}
                            >
                              Clear all
                            </Button>
                            <Button type="submit" className="bg-gray-900 hidden sm:block md:hidden xl:block text-white px-4 py-2">Search</Button>
                            <Button type="submit" className="bg-gray-900 text-white px-4 py-2 block sm:hidden md:block xl:hidden"><SearchIcon /></Button>
                        </div>
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
                <p>
                  {typeof resultsCount === "number"
                    ? `${resultsCount} result${resultsCount === 1 ? "" : "s"}`
                    : "Results"}
                </p>
                <div className="flex items-center gap-2">
                    {/* <p>Sort By:</p>
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
                    </select> */}
                </div>
            </div>
        </form>
    </FormProvider>
}
