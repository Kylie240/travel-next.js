"use client"

import { useEffect, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X, SlidersHorizontal, Check } from "lucide-react"
import { Button } from "./button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion"

interface FilterOption {
  id: number
  name: string
  icon?: any
}

export type AdvancedSelectedFilters = {
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

interface AdvancedFilterDialogProps {
  itineraryTags: FilterOption[]
  activityTags: FilterOption[]
  selectedFilters: AdvancedSelectedFilters
  onFilterChange: (filters: AdvancedSelectedFilters) => void
}

const continents = [
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Africa",
  "Oceania",
  "Antarctica",
]

function emptyAdvancedFilters(
  base?: Partial<AdvancedSelectedFilters>
): AdvancedSelectedFilters {
  return {
    itineraryTags: [],
    activityTags: [],
    regions: [],
    continents: [],
    accommodation: [],
    transportation: [],
    rating: "",
    sort: base?.sort || "most-recent",
    quickFilter: base?.quickFilter || "All",
  }
}

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value]
}

export function AdvancedFilterDialog({
  itineraryTags,
  activityTags,
  selectedFilters,
  onFilterChange,
}: AdvancedFilterDialogProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<AdvancedSelectedFilters>(selectedFilters)

  // Sync draft from URL/parent whenever the dialog opens.
  useEffect(() => {
    if (open) {
      setDraft(selectedFilters)
    }
  }, [open, selectedFilters])

  const handleApply = () => {
    onFilterChange(draft)
    setOpen(false)
  }

  const handleClear = () => {
    const cleared = emptyAdvancedFilters(selectedFilters)
    setDraft(cleared)
    onFilterChange(cleared)
    setOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex items-center rounded-md gap-2 bg-white border border-1 border-gray-300 px-3 py-1.5"
        >
          <span className="text-sm hidden sm:block md:hidden">Filters</span>
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[600px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white shadow-lg z-[10000] overflow-hidden flex flex-col">
          <div className="sticky top-0 bg-white z-10 p-6 pb-4 border-b shadow-sm">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-bold">
                Advanced Filters
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div className="p-6 overflow-y-auto ">
            <div className="border-b border-1 border-gray-300 pb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                Continents
              </label>
              <div className="grid md:grid-cols-3 grid-cols-2 gap-2 space-y-1">
                {continents.map((continent) => {
                  const isSelected = draft.continents.includes(continent)
                  return (
                    <div
                      key={continent}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-md font-regular cursor-pointer border border-1 border-gray-300 hover:bg-gray-200 ${isSelected ? "bg-gray-100 ring-2 ring-gray-700" : ""}`}
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          continents: toggleValue(prev.continents, continent),
                        }))
                      }
                    >
                      {isSelected ? (
                        <Check className="h-5 w-5 bg-black p-1 text-white rounded-full" />
                      ) : (
                        <div className="h-5 w-5 bg-gray-white rounded-full border border-1 border-gray-300" />
                      )}
                      {continent}
                    </div>
                  )
                })}
              </div>
            </div>

            <Accordion type="multiple" className="w-full">
              <AccordionItem value="itinerary-tags" className="border-b py-3">
                <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:no-underline py-3">
                  <span className="flex items-center gap-2">
                    Itinerary Tags
                    {draft.itineraryTags.length > 0 ? (
                      <span className="text-sm font-normal text-gray-500">
                        ({draft.itineraryTags.length})
                      </span>
                    ) : null}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {itineraryTags.map((tag) => {
                      const Icon = tag.icon
                      const isSelected = draft.itineraryTags.includes(tag.name)
                      return (
                        <div
                          key={tag.name}
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              itineraryTags: toggleValue(
                                prev.itineraryTags,
                                tag.name
                              ),
                            }))
                          }
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-md font-regular cursor-pointer border border-1 border-gray-300 hover:bg-gray-200 ${isSelected ? "bg-gray-100 ring-2 ring-gray-700" : ""}`}
                        >
                          {Icon && <Icon className="h-5 w-5" />}
                          {tag.name}
                        </div>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="activity-tags" className="border-b py-3">
                <AccordionTrigger className="text-lg font-semibold text-gray-900 hover:no-underline py-3">
                  <span className="flex items-center gap-2">
                    Activity Tags
                    {draft.activityTags.length > 0 ? (
                      <span className="text-sm font-normal text-gray-500">
                        ({draft.activityTags.length})
                      </span>
                    ) : null}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {activityTags.map((tag) => {
                      const Icon = tag.icon
                      const isSelected = draft.activityTags.includes(tag.name)
                      return (
                        <div
                          key={tag.name}
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              activityTags: toggleValue(
                                prev.activityTags,
                                tag.name
                              ),
                            }))
                          }
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-md font-regular cursor-pointer border border-1 border-gray-300 hover:bg-gray-200 ${isSelected ? "bg-gray-100 ring-2 ring-gray-700" : ""}`}
                        >
                          {Icon && <Icon className="h-5 w-5" />}
                          {tag.name}
                        </div>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="mt-6 flex justify-between gap-3 border-t border-1 border-gray-300 p-6">
            <Button type="button" variant="outline" onClick={handleClear}>
              Clear Filters
            </Button>
            <Button
              type="button"
              className="bg-black text-white hover:bg-gray-800"
              onClick={handleApply}
            >
              Apply Filters
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
