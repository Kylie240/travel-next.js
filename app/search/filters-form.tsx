"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdvancedFilterDialog } from "@/components/ui/advanced-filter-dialog"
import { activityTags, itineraryTags, quickFilters, sortOptions } from "@/lib/constants/tags"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { QuickFilterList } from "@/components/ui/quick-filter-list"

const formSchema = z.object({
    destination: z.string().optional(),
    duration: z.string().optional(),
    budget: z.string().optional(),
    itineraryTags: z.array(z.string()).optional(),
    activityTags: z.array(z.string()).optional(),
    sort: z.string().optional(),
    continents: z.array(z.string()).optional(),
    quickFilter: z.string().optional(),
})

export default function FiltersForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            destination: searchParams.get("destination") || "",
            duration: searchParams.get("duration") || "",
            budget: searchParams.get("budget") || "",
            itineraryTags: searchParams.get("itineraryTags") ? searchParams.get("itineraryTags")?.split(",") : [],
            activityTags: searchParams.get("activityTags") ? searchParams.get("activityTags")?.split(",") : [],
            sort: searchParams.get("sort") || "most-recent",
            continents: searchParams.get("continents") ? searchParams.get("continents")?.split(",") : [],
            quickFilter: searchParams.get("quickFilter") || "All"
        }
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        console.log('onSubmit', data)
        const newSearchParams = new URLSearchParams();
        if (data.destination) newSearchParams.set("destination", data.destination);
        if (data.duration) newSearchParams.set("duration", data.duration);
        if (data.budget) newSearchParams.set("budget", data.budget);
        if (data.itineraryTags && data.itineraryTags.length > 0) newSearchParams.set("itineraryTags", data.itineraryTags.join(","));
        if (data.activityTags && data.activityTags.length > 0) newSearchParams.set("activityTags", data.activityTags.join(","));
        if (data.sort) newSearchParams.set("sort", data.sort);
        if (data.continents && data.continents.length > 0) newSearchParams.set("continents", data.continents.join(","));
        newSearchParams.set("page", "1");

        router.push(`/search?${newSearchParams.toString()}`);
    }

    const filters = {
        destinations: ["Japan", "Italy", "Costa Rica", "Thailand", "Greece", "Switzerland"],
        duration: ["1-3 days", "4-7 days", "8-14 days", "15-21 days", "21+ days"],
        budget: ["Under $1000", "$1000-$2000", "$2000-$3000", "$3000-$5000", "$5000+"],
        quickFilters,
        sortOptions,
        itineraryTags,
        activityTags,
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
                            <SelectItem key={dur} value={dur}>
                            {dur}
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
                    <Button type="submit">Search</Button>
                    </div>
                    <div className="flex justify-end rounded-xl">
                    {/* <AdvancedFilterDialog
                        destinations={filters.destinations}
                        duration={filters.duration}
                        budget={filters.budget}
                        itineraryTags={filters.itineraryTags}
                        activityTags={filters.activityTags}
                        selectedFilters={selectedFilters}
                        onFilterChange={setSelectedFilters}
                    /> */}
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