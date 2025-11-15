 "use client"

 import React from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Plus, Minus, GripVertical, Trash2, ChevronDown, ChevronUp, X, Check, Upload, ChevronLeft, ChevronRight, CalendarPlus, PencilRuler, Flag, Loader2 } from "lucide-react"
import { BlackBanner } from "@/components/ui/black-banner"
import { PenSquare } from "lucide-react"
import { useForm, useFieldArray, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import* as z from "zod"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { activityTagsMap, itineraryTagsMap } from "@/lib/constants/tags"
import { createSchema } from "@/validation/createSchema"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { accommodations } from "@/lib/constants/accommodations"
import { Accommodation } from "@/types/Accommodation"
import { createItinerary, getItineraryById, updateItinerary } from "@/lib/actions/itinerary.actions"
import createClient from "@/utils/supabase/client"
import { CreateItinerary } from "@/types/createItinerary"
import { Day } from "@/types/Day"
import { Note } from "@/types/Note"
import { Activity } from "@/types/Activity"
import { supabase } from "@/utils/supabase/superbase-client"
import { ItineraryStatusEnum } from "@/enums/itineraryStatusEnum"
import { ItineraryStatus } from "@/types/itineraryStatus"
import { UpgradeDialog } from "@/components/ui/upgrade-dialog"
import { ImageUpload } from "@/components/ui/image-upload"
import { v4 as uuidv4 } from 'uuid'
import { countries } from "@/lib/constants/countries"

type City = { city: string; country: string };
type FormData = {
  status: number;
  title: string;
  shortDescription: string;
  mainImage: string;
  detailedOverview?: string;
  duration: number;
  cities?: City[];
  provinces?: string[];
  days: Day[];
  itineraryTags?: number[];
  notes?: Note[];
  budget?: number;
};

const INITIAL_DAY: Day = {
  id: 1,
  cityName: '',
  countryName: '',
  title: '',
  description: '',
  activities: [],
  image: '',
  notes: '',
  showAccommodation: false,
  accommodation: {
    name: '',
    type: '',
    location: '',
    link: '',
  }
};

function SortableDay({ day, index, form, onRemoveDay, userId, itineraryId, disabled, enableDates }: { 
  day: any; // Temporarily use any to fix type issues
  index: number;
  form: ReturnType<typeof useForm<FormData>>;
  onRemoveDay: (index: number) => void;
  disabled: boolean;
  userId: string;
  itineraryId: string;
  enableDates: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: day.id });

  const { fields: activityFields, append: appendActivity, remove: removeActivity } = useFieldArray({
    control: form.control,
    name: `days.${index}.activities`
  });

  // Get the list of unique countries from step 1
  const existingCities = form.getValues('cities') || [];
  const existingProvinces = form.getValues('provinces') || [];
  
  // Filter out empty/null values
  const [countrySearch, setCountrySearch] = useState<Record<number, string>>({});
  // Add state for accommodation selection
  const [showNewAccommodation, setShowNewAccommodation] = useState(false);
  const [activityTags, setActivityTags] = useState<Array<{id: number; name: string; icon: any}>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchActivityTags = async () => {
      try {
        const { data, error } = await supabase
        .from('tags_activity')
        .select('*')
        .order('name')
        
        if (error) {
          throw error
        }

        const transformedTags = data.map(tag => ({
          id: tag.id,
          name: tag.name,
          icon: tag.icon || PenSquare // Using PenSquare as default icon if none provided
        }))

        setActivityTags(transformedTags)
      } catch (error) {
        toast.error('Failed to load activity tags')
      }
    }

    fetchActivityTags()
  }, [])
  
  // Get existing accommodations from all days
  const getExistingAccommodations = () => {
    const days = form.getValues('days');
    return days
      .filter(d => d.showAccommodation && d.accommodation?.name)
      .map(d => ({
        name: d.accommodation?.name,
        type: d.accommodation?.type,
        location: d.accommodation?.location
      }))
      .filter((acc, index, self) => 
        index === self.findIndex(a => a.name === acc.name)
      );
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem value={day.id} className="border rounded-xl py-2 px-4 sm:p-4 sm:px-6 md:p-8 mb-4 bg-white">
        <div className="flex items-center gap-4">
          <div {...attributes} {...listeners} className="cursor-grab hover:text-gray-600">
            <GripVertical size={20} />
          </div>
          <div className="flex-1">
            <AccordionTrigger>
              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    {form.watch(`days.${index}.title`) ? (
                      <h3 className="text-lg flex items-center font-semibold"> {form.watch(`days.${index}.title`)} </h3>
                    ) : (
                      <h3 className="text-lg font-semibold md:ml-2">Day {index + 1}</h3>
                    )}
                  </div>
                  {form.watch(`days.${index}.cityName`) && (
                    <p className="text-sm text-gray-600 md:ml-2">
                      {form.watch(`days.${index}.cityName`)}, {form.watch(`days.${index}.countryName`)}
                    </p>
                  )}
                </div>
                {index > 0 && (
                  <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation()
                    if (confirm('Are you sure you want to delete this day?')) {
                      onRemoveDay(index)
                    }
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                )}
              </div>
            </AccordionTrigger>
          </div>
        </div>
        <AccordionContent>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {enableDates && (
                <div className="flex sm:flex-col gap-2 items-center sm:items-start sm:gap-0">
                  <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none">Date</Label>
                  <Input
                    type="date"
                    {...form.register(`days.${index}.date`)}
                    className="rounded-xl"
                    disabled={disabled}
                  />
                </div>
              )}
              <div className="flex sm:flex-col gap-2 items-center sm:items-start sm:gap-0">
                <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none">City*</Label>
                <Input
                  {...form.register(`days.${index}.cityName`)}
                  className="rounded-xl"
                  placeholder="Tokyo"
                  disabled={disabled}
                />
                {form.formState.errors.days?.[index]?.cityName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.days[index]?.cityName?.message}</p>
                )}
              </div>
              <div className="flex sm:flex-col gap-2 items-center sm:items-start sm:gap-0">
                <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none">State / Province</Label>
                <Input
                  {...form.register(`days.${index}.provinceName`)}
                  className="rounded-xl"
                  placeholder=""
                  disabled={disabled}
                />
              </div>
              <div className="flex sm:flex-col gap-2 items-center sm:items-start sm:gap-0">
                <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none">Country*</Label>
                  <Select
                  value={form.watch(`days.${index}.countryName`) || ''}
                    onValueChange={(value: string) => {
                        form.setValue(`days.${index}.countryName`, value, {
                          shouldValidate: true,
                          shouldDirty: true,
                          shouldTouch: true
                        });
                    setCountrySearch(prev => ({ ...prev, [index]: '' }));
                    }}
                  required
                  disabled={disabled}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <div className="p-2 sticky top-0 bg-white border-b z-10">
                      <Input
                        placeholder="Search countries..."
                        value={countrySearch[index] || ''}
                        onChange={(e) => setCountrySearch(prev => ({ ...prev, [index]: e.target.value }))}
                        className="rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        disabled={disabled}
                      />
                    </div>
                    <div className="overflow-y-auto max-h-[250px]">
                      {(() => {
                        // Get all selected countries from other days
                        const allDays = form.watch('days') || [];
                        const selectedCountries = new Set(
                          allDays
                            .map((day, dayIndex) => dayIndex !== index ? day.countryName : null)
                            .filter(Boolean) as string[]
                        );
                        
                        // Filter countries
                        const filteredCountries = countries.filter((country) =>
                          country.name.toLowerCase().includes((countrySearch[index] || '').toLowerCase())
                        );
                        
                        // Separate selected and unselected countries
                        const selectedFiltered = filteredCountries.filter(c => selectedCountries.has(c.name));
                        const unselectedFiltered = filteredCountries.filter(c => !selectedCountries.has(c.name));
                        
                        // Sort each group alphabetically
                        selectedFiltered.sort((a, b) => a.name.localeCompare(b.name));
                        unselectedFiltered.sort((a, b) => a.name.localeCompare(b.name));
                        
                        if (filteredCountries.length === 0) {
                          return (
                            <div className="py-2 px-3 text-sm text-gray-500 text-center">
                              No countries found
                            </div>
                          );
                        }
                        
                        return (
                          <>
                            {selectedFiltered.length > 0 && (
                              <>
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-white">
                                  Recently Selected
                                </div>
                                {selectedFiltered.map((country) => (
                                  <SelectItem key={country.code} value={country.name}>
                                    {country.name}
                        </SelectItem>
                      ))}
                                <div className="py-2"></div>
                              </>
                            )}
                            {unselectedFiltered.map((country) => (
                              <SelectItem key={country.code} value={country.name}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </>
                        );
                      })()}
                    </div>
                    </SelectContent>
                  </Select>
                {form.formState.errors.days?.[index]?.countryName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.days[index]?.countryName?.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex sm:flex-col gap-2 items-center sm:items-start sm:gap-0">
              <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none">Title*</Label>
              <Input
                {...form.register(`days.${index}.title`)}
                className="rounded-xl"
                placeholder="Tokyo Exploration"
                disabled={disabled}
              />
              {form.formState.errors.days?.[index]?.title && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.days[index]?.title?.message}</p>
              )}
              {!form.formState.errors.days?.[index]?.title && form.watch(`days.${index}.title`).length > 50 && (
                <p className="text-red-500 text-sm mt-1">
                  Title must be less than 50 characters
                </p>
              )}
            </div>
            
            <div>
              <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none">Cover Image</Label>
              <ImageUpload
                value={form.watch(`days.${index}.image`)}
                onChange={(url) => form.setValue(`days.${index}.image`, url)}
                onRemove={() => form.setValue(`days.${index}.image`, "")}
                disabled={disabled}
                bucket="itinerary-images"
                folder={`${userId}/${itineraryId}/days/${index}`}
              />
            </div>

            <div>
              <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none">Description</Label>
              <Textarea
                {...form.register(`days.${index}.description`)}
                placeholder="Discover the highlights of Tokyo's most famous districts"
                className="rounded-xl"
                rows={6}
                disabled={disabled}
              />
              {form.formState.errors.days?.[index]?.description && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.days[index]?.description?.message}</p>
              )}
            </div>

            <div className="py-4">
              <div className="flex justify-between items-end mb-2">
                <div className="ml-1">
                  <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none">Activities</Label>
                  <p className="text-sm text-gray-500">Add activities to your day, providing as much detail as you want.</p>
                </div>
                {(activityFields.length === 0 || !activityFields) && <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => appendActivity({
                    id: activityFields.length + 1,
                    title: '',
                    description: '',
                    type: undefined as unknown as number | undefined,
                    link: '',
                    time: undefined,
                    duration: null
                  })}
                  className="rounded-xl"
                  disabled={disabled}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Activity
                </Button>}
              </div>

              <div className="space-y-4">
                {activityFields.map((activity, activityIndex) => (
                  <div key={activity.id} className="border rounded-lg px-4">
                    <AccordionItem value={activity.id}>
                      <div className="flex-1">
                        <AccordionTrigger>
                          <div className="flex w-full justify-between ml-2">
                            <p className="text-lg font-thin text-left line-clamp-1">{`${form.watch(`days.${index}.activities.${activityIndex}.title`)}` ? `${form.watch(`days.${index}.activities.${activityIndex}.title`)}` : `Activity ${activityIndex + 1}`}</p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  if (confirm('Are you sure you want to delete this activity?')) {
                                    removeActivity(activityIndex)
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                disabled={disabled}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                        </AccordionTrigger>
                      </div>
                      <AccordionContent>
                        <div key={activity.id} className="p-2 sm:p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="flex sm:flex-col gap-2 items-center sm:items-start sm:gap-0">
                                <Label className="text-[16px] min-w-[75px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none">Start Time</Label>
                                <Input
                                  type="time"
                                  {...form.register(`days.${index}.activities.${activityIndex}.time`, {
                                    setValueAs: (value) => {
                                      if (!value) return undefined;
                                      // Ensure the time is in HH:MM:SS format for PostgreSQL
                                      const [hours, minutes] = value.split(':');
                                      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
                                    }
                                  })}
                                  className="rounded-xl w-auto sm:w-full"
                                  disabled={disabled}
                                />
                              </div>
                              <div className="flex sm:flex-col gap-2 items-center sm:items-start sm:gap-0">
                                <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none">Duration</Label>
                                <div className="flex gap-2 items-center w-full">
                                  <div className="relative flex-1 flex flex-col gap-1">
                                    <Input
                                      type="number"
                                      min="0"
                                      value={(() => {
                                        const totalMinutes = form.watch(`days.${index}.activities.${activityIndex}.duration`);
                                        return totalMinutes !== null && totalMinutes !== undefined 
                                          ? Math.floor(totalMinutes / 60).toString() 
                                          : '';
                                      })()}
                                      onChange={(e) => {
                                        const hours = parseInt(e.target.value) || 0;
                                        const currentMinutes = form.watch(`days.${index}.activities.${activityIndex}.duration`) || 0;
                                        const existingMinutes = currentMinutes % 60;
                                        const totalMinutes = (hours * 60) + existingMinutes;
                                        form.setValue(`days.${index}.activities.${activityIndex}.duration`, totalMinutes || null, {
                                          shouldValidate: true,
                                          shouldDirty: true
                                        });
                                      }}
                                      className="rounded-xl"
                                      disabled={disabled}
                                    />
                                    <span className="absolute top-[12px] right-[30px] text-xs text-gray-500 text-center">HR</span>
                                  </div>
                                  <div className="relative flex-1 flex flex-col gap-1">
                                    <Input
                                      type="number"
                                      min="0"
                                      max="59"
                                      value={(() => {
                                        const totalMinutes = form.watch(`days.${index}.activities.${activityIndex}.duration`);
                                        return totalMinutes !== null && totalMinutes !== undefined 
                                          ? (totalMinutes % 60).toString() 
                                          : '';
                                      })()}
                                      onChange={(e) => {
                                        const minutes = parseInt(e.target.value) || 0;
                                        const clampedMinutes = Math.min(59, Math.max(0, minutes));
                                        const currentMinutes = form.watch(`days.${index}.activities.${activityIndex}.duration`) || 0;
                                        const existingHours = Math.floor(currentMinutes / 60);
                                        const totalMinutes = (existingHours * 60) + clampedMinutes;
                                        form.setValue(`days.${index}.activities.${activityIndex}.duration`, totalMinutes || null, {
                                          shouldValidate: true,
                                          shouldDirty: true
                                        });
                                      }}
                                      className="rounded-xl"
                                      disabled={disabled}
                                    />
                                    <span className="absolute top-[12px] right-[30px] text-xs text-gray-500 text-center">MIN</span>
                                  </div>
                                </div>
                              </div>
                                <div className="flex sm:flex-col gap-2 items-center sm:items-start sm:gap-0">
                                  <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none">Type</Label>
                                  <Select key={activity.id}
                                    value={form.watch(`days.${index}.activities.${activityIndex}.type`)?.toString()}
                                    onValueChange={(value: string) => {
                                      const numValue = parseInt(value);
                                      form.setValue(`days.${index}.activities.${activityIndex}.type`, numValue === 0 ? undefined : numValue, {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                        shouldTouch: true
                                      });
                                    }}
                                    disabled={disabled}
                                  >
                                    <SelectTrigger className="rounded-xl">
                                      <SelectValue placeholder="Select a type">
                                        {form.watch(`days.${index}.activities.${activityIndex}.type`) 
                                          ? activityTags.find(t => t.id === form.watch(`days.${index}.activities.${activityIndex}.type`))?.name 
                                          : "Select a type"}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent position="popper" side="bottom" align="start" className="max-h-[200px] overflow-y-auto">
                                      {form.watch(`days.${index}.activities.${activityIndex}.type`) !== undefined && (
                                        <SelectItem value={undefined} key={0} className="text-red-500 cursor-pointer">
                                          Clear selection
                                        </SelectItem>
                                      )}
                                      {activityTags.map(tag => (
                                        <SelectItem key={tag.id} value={tag.id.toString()} className="cursor-pointer">
                                          <div className="flex items-center gap-2">
                                          {activityTagsMap.find(tag => tag.id === activity.type)?.icon && (
                                            React.createElement(activityTagsMap.find(tag => tag.id === activity.type)!.icon)
                                          )} {tag.name}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex sm:flex-col gap-2 items-center sm:items-start sm:gap-0">
                              <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none">Title*</Label>
                              <Input
                                {...form.register(`days.${index}.activities.${activityIndex}.title`)}
                                placeholder="Activity title"
                                className="rounded-xl"
                                disabled={disabled}
                              />
                              {form.formState.errors.days?.[index]?.activities?.[activityIndex]?.title && (
                                <p className="text-red-500 text-sm mt-1">
                                  {form.formState.errors.days[index]?.activities?.[activityIndex]?.title?.message}
                                </p>
                              )}
                              {!form.formState.errors.days?.[index]?.activities?.[activityIndex]?.title && form.watch(`days.${index}.activities.${activityIndex}.title`).length > 50 && (
                                <p className="text-red-500 text-sm mt-1">
                                  Title must be less than 50 characters
                                </p>
                              )}
                            </div>
                            <div>
                              <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none">Description</Label>
                              <textarea
                                {...form.register(`days.${index}.activities.${activityIndex}.description`)}
                                placeholder="Activity description"
                                className="w-full p-2 border rounded-xl min-h-[100px] text-base sm:text-sm"
                                disabled={disabled}
                              />
                              {form.formState.errors.days?.[index]?.activities?.[activityIndex]?.description && (
                                <p className="text-red-500 text-sm mt-1">
                                  {form.formState.errors.days[index]?.activities?.[activityIndex]?.description?.message}
                                </p>
                              )}
                            </div>
                            <div className="flex sm:flex-col gap-2 items-center sm:items-start sm:gap-0">
                              <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none">Location</Label>
                              <Input
                                {...form.register(`days.${index}.activities.${activityIndex}.location`)}
                                placeholder="Location"
                                className="rounded-xl"
                                disabled={disabled}
                              />
                              {form.formState.errors.days?.[index]?.activities?.[activityIndex]?.location && (
                                <p className="text-red-500 text-sm mt-1">
                                  {form.formState.errors.days[index]?.activities?.[activityIndex]?.location?.message}
                                </p>
                              )}
                            </div>
                            <div className="flex sm:flex-col gap-2 items-center sm:items-start sm:gap-0">
                              <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none">Link</Label>
                              <Input
                                {...form.register(`days.${index}.activities.${activityIndex}.link`)}
                                placeholder="Add booking link, or a link to a website with more information"
                                className="rounded-xl"
                                disabled={disabled}
                              />
                              {(form.formState.errors.days?.[index]?.activities?.[activityIndex]?.link 
                                && form.watch(`days.${index}.activities.${activityIndex}.link`) !== '') && (
                                <p className="text-red-500 text-sm mt-1">
                                  {form.formState.errors.days[index]?.activities?.[activityIndex]?.link?.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </div>
                ))}
              </div>
              {activityFields.length > 0 && <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => appendActivity({
                    id: activityFields.length + 1,
                    title: '',
                    description: '',
                    type: undefined,
                    link: '',
                    time: undefined,
                    duration: null
                  })}
                  className="rounded-xl mt-2"
                  disabled={disabled}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Activity
                </Button>}
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="ml-1">
                  <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none">Accommodation</Label>
                  <p className="text-sm text-gray-500">Add where you're staying during this day.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const isCurrentlyShown = form.watch(`days.${index}.showAccommodation`);
                    if (isCurrentlyShown) {
                      // If removing, clear all accommodation data
                      form.setValue(`days.${index}.accommodation`, {
                        name: '',
                        type: '',
                        location: '',
                        link: ''
                      });
                      form.setValue(`days.${index}.showAccommodation`, false);
                      setShowNewAccommodation(false); // Reset the new accommodation form state
                    } else {
                      // If adding, show the section and determine which view to show
                      form.setValue(`days.${index}.showAccommodation`, true);
                      // Show the dropdown if there are existing accommodations
                      setShowNewAccommodation(getExistingAccommodations().length === 0);
                    }
                  }}
                  className={`rounded-xl ${form.watch(`days.${index}.showAccommodation`) ? 'bg-gray-100' : ''}`}
                  disabled={disabled}
                >
                  {form.watch(`days.${index}.showAccommodation`) ? 
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </div> : 
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Accommodation
                    </div>
                  }
                </Button>
              </div>
              {form.watch(`days.${index}.showAccommodation`) && (
                <>
                  {!showNewAccommodation && getExistingAccommodations().length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Select
                          defaultValue={form.watch(`days.${index}.accommodation.name`)}
                          value={form.watch(`days.${index}.accommodation.name`)}
                          onValueChange={(value: string) => {
                            if (value === 'new') {
                              form.setValue(`days.${index}.accommodation`, {
                                name: '',
                                type: '',
                                location: '',
                                link: ''
                              });
                              setShowNewAccommodation(true);
                            } else {
                              const selectedAccommodation = getExistingAccommodations().find(a => a.name === value);
                              if (selectedAccommodation) {
                                form.setValue(`days.${index}.accommodation`, selectedAccommodation as Accommodation, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                  shouldTouch: true
                                });
                                // Keep the accommodation section open
                                form.setValue(`days.${index}.showAccommodation`, true);
                                // Don't close the dropdown
                                // setShowNewAccommodation(false);
                              }
                            }
                          }}
                          disabled={disabled}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select an accommodation">
                              {form.watch(`days.${index}.accommodation.name`) || "Select an accommodation"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {getExistingAccommodations().map((acc) => (
                              <SelectItem key={acc.name || ''} value={acc.name || ''}>
                                {acc.name} in {acc.location}
                              </SelectItem>
                            ))}
                            <SelectItem value="new">+ Add New Accommodation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          {...form.register(`days.${index}.accommodation.name`)}
                          placeholder="Accommodation name"
                          className="rounded-xl"
                          disabled={disabled}
                        />
                        <Select
                          value={form.watch(`days.${index}.accommodation.type`) || ''}
                          onValueChange={(value: string) => {
                            form.setValue(`days.${index}.accommodation.type`, value);
                          }}
                          disabled={disabled}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                          <SelectContent>
                            {accommodations.map((acc) => (  
                              <SelectItem key={acc.name} value={acc.name}>
                                {acc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mt-2">
                        <Input
                          {...form.register(`days.${index}.accommodation.location`)}
                          placeholder="Location"
                          className="rounded-xl"
                          disabled={disabled}
                        />
                      </div>
                      <div>
                        <Input
                          {...form.register(`days.${index}.accommodation.link`)}
                          placeholder="Add booking link, or a link to a website with more information"
                          className="rounded-xl"
                          disabled={disabled}
                        />
                        {form.formState.errors.days?.[index]?.accommodation?.link && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.days[index]?.accommodation?.link?.message}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        {getExistingAccommodations().length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowNewAccommodation(false)}
                            className="rounded-xl"
                            disabled={disabled}
                          >
                            Back to List
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            const currentAccommodation = form.getValues(`days.${index}.accommodation`);
                            if (currentAccommodation.name) {
                              form.setValue(`days.${index}.showAccommodation`, true);
                              setShowNewAccommodation(false);
                            } else {
                              toast.error('Please enter an accommodation name');
                            }
                          }}
                          className="rounded-xl"
                          disabled={disabled}
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            form.setValue(`days.${index}.showAccommodation`, false);
                            form.setValue(`days.${index}.accommodation`, {
                              name: '',
                              type: '',
                              location: '',
                              link: ''
                            });
                            setShowNewAccommodation(false);
                          }}
                          className="rounded-xl"
                          disabled={disabled}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}

export default function CreatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialItineraryId = searchParams.get('itineraryId')
  const [ItineraryId, setItineraryId] = useState<string | null>(initialItineraryId)
  const [itineraryStatus, setItineraryStatus] = useState<number>(ItineraryStatusEnum.draft)
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [itineraryLoading, setItineraryLoading] = useState(false)
  const [itineraryTags, _] = useState<Array<{id: number; name: string; icon: any}>>(itineraryTagsMap)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [pendingItineraryData, setPendingItineraryData] = useState<any>(null)
  const [enableDates, setEnableDates] = useState(false)
  const countriesList = countries;

  // Generate itinerary ID if one doesn't exist
  useEffect(() => {
    if (!initialItineraryId) {
      const newItineraryId = uuidv4()
      setItineraryId(newItineraryId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount to generate ID if needed

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        setUser(null)
      } 
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])
  
  const [currentStep, setCurrentStep] = useState(ItineraryId ? 1 : 0)

  const form = useForm<FormData>({
    resolver: zodResolver(createSchema),
    mode: 'onSubmit',
    defaultValues: {
      status: ItineraryStatusEnum.draft,
      title: '',
      shortDescription: '',
      mainImage: '',
      detailedOverview: '',
      duration: 1,
      cities: [],
      provinces: [],
      days: [{
        ...INITIAL_DAY
      }],
      itineraryTags: [],
      notes: [],
      // budget: null
    }
  })

  const { fields: countryFields, append: appendCountry, remove: removeCountry } = useFieldArray({
    control: form.control,
    name: "countries" as const
  } as any) // Type assertion needed due to form field array limitations

  const { fields: cityFields, append: appendCity, remove: removeCity } = useFieldArray({
    control: form.control,
    name: "cities"
  })

  const { fields: dayFields, append: appendDay, remove: removeDay, move: moveDay } = useFieldArray<FormData>({
    control: form.control,
    name: "days" as const
  })

  const { fields: noteFields, append: appendNote, remove: removeNote } = useFieldArray<FormData>({
    control: form.control,
    name: "notes" as const
  })

  // Add the removeDay handler
  const handleRemoveDay = (index: number) => {
    if (dayFields.length <= 1) {
      return // Don't remove the last day
    }
    
    removeDay(index)
    
    // Update the length field
    const newLength = form.getValues('duration') - 1
    form.setValue('duration', newLength)
    
    // Update remaining days' IDs and titles
    const updatedDays = form.getValues('days')
    updatedDays.forEach((day, idx) => {
      day.id = (idx + 1)
      day.title = ""
    })
    form.setValue('days', updatedDays)
  }

  useEffect(() => {
    const init = async () => {
      const itineraryId = searchParams.get('itineraryId')
      // Only try to load if the ID existed in the original URL params (not newly generated)
      // If initialItineraryId was null, we generated the ID, so don't try to load it
      if (itineraryId && initialItineraryId) {
        try {
          setItineraryLoading(true)
          const itinerary = await getItineraryById(itineraryId) as CreateItinerary;
          setItineraryStatus(itinerary.status)
          
          // Extract unique countries and cities from days
          const countries = new Set<string>();
          const cities = new Set<{ city: string; country: string }>();
          const provinces = new Set<string>();

          itinerary.days.forEach(day => {
            if (day.countryName && !countries.has(day.countryName)) {
              countries.add(day.countryName);
            }
            if (day.cityName && day.countryName && !cities.has({ city: day.cityName, country: day.countryName })) {
              cities.add({
                city: day.cityName,
                country: day.countryName
              });
            }
            if (day.provinceName && !provinces.has(day.provinceName)) {
              provinces.add(day.provinceName);
            }
          });

          // Update the itinerary object with extracted countries and cities
          itinerary.countries = Array.from(countries);
          itinerary.cities = Array.from(cities);

          // Set showAccommodation to true for days that have accommodation data
          itinerary.days = itinerary.days.map(day => ({
            ...day,
            showAccommodation: !!(day.accommodation && day.accommodation.name)
          }));

          form.reset(itinerary);
        } catch (error) {
          toast.error('Failed to load itinerary')
        } finally {
          setItineraryLoading(false)
        }
      }
    }
    init()
  }, [searchParams, form, initialItineraryId])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Also update the length input handler to update days in real-time
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (value < 1) {
      e.target.value = '1'
      form.setValue('duration', 1)
      return
    }
    
    const currentDays = form.getValues('days')
    
    // If reducing days, check if any data would be lost
    if (value < currentDays.length) {
      const daysToRemove = currentDays.slice(value)
      const hasData = daysToRemove.some(day => 
        day.title || 
        day.cityName || 
        day.countryName || 
        day.description || 
        (day.activities && day.activities.length > 0) ||
        (day.showAccommodation && day.accommodation?.name)
      )

      if (hasData) {
        if (!confirm('Reducing the number of days will delete some days that have data. Are you sure you want to continue?')) {
          e.target.value = currentDays.length.toString()
          return
        }
      }
      form.setValue('days', currentDays.slice(0, value))
    } else if (value > currentDays.length) {
      // Add new days
      const newDays = [...currentDays]
      for (let i = currentDays.length; i < value; i++) {
        newDays.push({
          ...INITIAL_DAY,
          id: (i + 1),
          title: ""
        })
      }
      form.setValue('days', newDays)
    }
    
    form.setValue('duration', value)
  }

  const handleFinalSubmit = async (data: z.infer<typeof createSchema>) => {
    setIsSubmitting(true);
    try {
      // Clean up and validate days
      const nonEmptyDays = data.days.map((day, index) => {
        const activities = (day.activities || []).map(activity => ({
          id: activity.id,
          time: activity.time || '',
          duration: activity.duration || null,
          image: activity.image || '',
          title: activity.title || '',
          description: activity.description || '',
          type: activity.type || null,
          link: activity.link || '',
          photos: activity.photos || [],
          price: activity.price || 0,
          location: activity.location || null,
        } as Activity));

          return {
            ...day,
            id: index + 1,
          cityName: day.cityName || '',
          countryName: day.countryName || '',
          title: day.title || '',
          showAccommodation: day.showAccommodation || false,
          activities
        } as Day;
      }).filter(day => day.title && day.cityName && day.countryName);
      
      if (nonEmptyDays.length > 0) {
        form.setValue('days', nonEmptyDays)
      }

      // Clean up empty city fields
      const nonEmptyCities = data.cities.map(city => ({
        city: city.city || '',
        country: city.country || ''
      })).filter(city => city.city.length > 0 && city.country.length > 0)
      
      if (nonEmptyCities.length > 0) {
        form.setValue('cities', nonEmptyCities)
      }

      // Clean up empty notes
      const nonEmptyNotes = data.notes.map(note => ({
        id: note.id,
        title: note.title || '',
        content: note.content || '',
        expanded: note.expanded ?? false
      } as Note)).filter(note => note.title.length > 0 || note.content.length > 0)
      
      form.setValue('notes', nonEmptyNotes)

      // Set status to published
      form.setValue('status', ItineraryStatusEnum.published)

      await handleSaveItinerary()
    } catch (error) {
      if (error instanceof Error && !error.message.includes('Maximum number of itineraries reached.')) {
      toast.error('Error submitting form')
    }
    } finally {
      setIsSubmitting(false);
    }
  }

  const buildItineraryData = () => {
      const formData = form.getValues();
    return {
        id: ItineraryId,
        status: formData.status as number,
        title: formData.title,
        shortDescription: formData.shortDescription,
        mainImage: formData.mainImage,
        detailedOverview: formData.detailedOverview,
        duration: formData.duration,
        provinces: formData.provinces,
        cities: formData.cities.map(city => ({
          city: city.city,
          country: city.country
        })),
        days: formData.days.map(day => {
          const activities = (day.activities || []).map(activity => ({
            id: activity.id,
            time: activity.time || null,
            duration: activity.duration || null,
            image: activity.image || '',
            title: activity.title || '',
            description: activity.description || '',
            type: activity.type || '',
            link: activity.link || '',
            photos: activity.photos || [],
            price: activity.price || 0,
            location: activity.location || null
          } as Activity));

          return {
            ...day,
            id: day.id,
            cityName: day.cityName || '',
            countryName: day.countryName || '',
            title: day.title || '',
            showAccommodation: day.showAccommodation || false,
            activities
          } as Day;
        }),
        itineraryTags: formData.itineraryTags,
        notes: formData.notes.map(note => ({
          id: note.id,
          title: note.title || '',
          content: note.content || '',
          expanded: note.expanded ?? true
        } as Note)),
        budget: formData.budget
    };
  };

  const saveItineraryAsDraft = async () => {
    setIsSubmitting(true);
    try {
      const itineraryData = buildItineraryData();
      // Force status to draft
      itineraryData.id = ItineraryId;
      itineraryData.status = ItineraryStatusEnum.draft;
      
      if (initialItineraryId) {
        await updateItinerary(ItineraryId, itineraryData);
      } else {
        await createItinerary(itineraryData);
      }
      toast.success('Itinerary saved as draft');
      return true;
    } catch (error) {
      // If it fails, just show a generic error
      toast.error('Failed to save draft');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpgradeClick = async () => {
    setShowUpgradeDialog(false);
    const saved = await saveItineraryAsDraft();
    if (saved) {
      router.push('/plans');
    }
  };

  const handleSaveDraftClick = async () => {
    setShowUpgradeDialog(false);
    const saved = await saveItineraryAsDraft();
    if (saved) {
      router.push('/my-itineraries');
    }
  };

  const handleSaveItinerary = async () => {
    setIsSubmitting(true);
    try {
      if (!user) {
        toast.error('Please log in to save your itinerary')
        router.push('/login')
        return
      }
      
      const itineraryData = buildItineraryData();
      
      try {
        let response = null;
        console.log(itineraryData)
        if (ItineraryId) {
          response = await updateItinerary(ItineraryId, itineraryData)
          toast.success('Itinerary updated successfully')
        } else {
          response = await createItinerary(itineraryData)
          toast.success('Itinerary created successfully')
        }
        router.push('/my-itineraries')
      } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
          throw error;
        } else if (error instanceof Error && error.message.includes('Maximum number of itineraries reached.')) {
          throw error;
        } else {
        throw new Error('Failed to save itinerary');
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        toast.error('Session expired. Please log in again.')
        router.push('/')
        throw error
      } else if (error instanceof Error && error.message.includes('Maximum number of itineraries reached.')) {
        // Show upgrade dialog instead of toast
        setPendingItineraryData(buildItineraryData());
        setShowUpgradeDialog(true);
        // Don't throw - dialog handles the flow
      } else {
        toast.error('Error saving itinerary')
        throw error
      }
    } finally {
      setIsSubmitting(false);
    }
  }

    const onSubmit = form.handleSubmit(async (data) => {
      try {
        // Pre-submission validation check
        const hasEmptyActivities = data.days.some(day => 
          day.activities?.some(activity => !activity.title || activity.title.trim() === '')
        )
        
        if (hasEmptyActivities) {
          toast.error('Please add titles to all activities before publishing')
          return
        }
        
        const isValid = await form.trigger()
        if (isValid) {
          await handleFinalSubmit(data)
        } else {
          // Get specific validation errors
          const errors = form.formState.errors
          console.log('Validation errors:', errors)
          
          // Check for specific missing fields
          if (errors.title) {
            toast.error('Title is required')
          } else if (errors.shortDescription) {
            toast.error('Short description is required')
          } else if (errors.mainImage) {
            toast.error('Main image URL is required')
          } else if (errors.duration) {
            toast.error('Duration must be at least 1 day')
          } else if (errors.cities) {
            toast.error('At least one city is required')
          } else if (errors.days) {
            // Check for specific day errors
            const dayErrors = errors.days
            if (Array.isArray(dayErrors)) {
              for (let i = 0; i < dayErrors.length; i++) {
                const dayError = dayErrors[i]
                if (dayError?.title) {
                  toast.error(`Day ${i + 1}: Title is required`)
                  break
                } else if (dayError?.cityName) {
                  toast.error(`Day ${i + 1}: City name is required`)
                  break
                } else if (dayError?.countryName) {
                  toast.error(`Day ${i + 1}: Country name is required`)
                  break
                } else if (dayError?.activities) {
                  // Check for specific activity errors
                  const activityErrors = dayError.activities
                  if (Array.isArray(activityErrors)) {
                    for (let j = 0; j < activityErrors.length; j++) {
                      const activityError = activityErrors[j]
                      if (activityError?.title) {
                        toast.error(`Day ${i + 1}, Activity ${j + 1}: Title is required`)
                        break
                      }
                    }
                  } else {
                    toast.error(`Day ${i + 1}: Activity titles are required`)
                  }
                  break
                }
              }
            } else {
              toast.error('At least one day is required')
            }
          } else {
            toast.error('Please fill in all required fields')
          }
        }
      } catch (error) {
        toast.error('Error submitting form')
      }
    }, (errors) => {
      console.log('Form validation errors:', errors)
      toast.error('Please fill in all required fields')
    })
  
  const saveDraft = async () => {
    if ( checkForEmptyValues() ) {
      toast.error('Please add a title and at least one day')
      return
    }
    
    setIsSubmitting(true)
    try {
      if (!user) {
        toast.error('Please log in to save your itinerary')
        router.push('/')
        return
      }

      const formData = form.getValues()
      const itineraryData: CreateItinerary = {
        ...formData,
        id: ItineraryId,
        status: ItineraryStatusEnum.draft
      }

      let response = null;
      if (initialItineraryId) {
        response = await updateItinerary(ItineraryId, itineraryData)
      } else {
        response = await createItinerary(itineraryData)
      }
      
      if (response) {
        toast.success('Itinerary saved successfully')
        router.push('/my-itineraries')
      } else {
        throw new Error('Failed to save itinerary')
      }
    } catch (error) {
      toast.error('Error saving itinerary')
    } finally {
      setIsSubmitting(false)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const checkForEmptyValues = () => {
    return form.getValues('title') === '' || form.getValues('days').length === 0
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = dayFields.findIndex((day) => day.id === active.id)
      const newIndex = dayFields.findIndex((day) => day.id === over.id)
      
      // Move the day to the new position
      moveDay(oldIndex, newIndex)
      
      // Update all day IDs and titles to maintain order
      const updatedDays = form.getValues('days')
      updatedDays.forEach((day, index) => {
        day.id = (index + 1)
        day.title = day.title.replace(/Day \d+/, "")
      })
      form.setValue('days', updatedDays)
    }
  }

  const toggleCategory = (categoryId: number) => {
    const currentTags = form.getValues('itineraryTags') || []
    const newTags = currentTags.includes(categoryId)
      ? currentTags.filter(c => c !== categoryId)
      : currentTags.length < 5 ? [...currentTags, categoryId] : currentTags
    form.setValue('itineraryTags', newTags)
  }

  if (loading || itineraryLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <BlackBanner
        icon={<PenSquare className="w-4 h-4" />}
        subtitle="Create an Itinerary"
        title="Log in to Start Creating"
        description="Join our community to create and share your travel experiences with fellow adventurers."
      />
    )
  }

  const isFormDisabled = isSubmitting || form.formState.isSubmitting;

  return (
    <FormProvider {...form}> 
      <form 
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(e)
        }} 
        className="min-h-screen bg-gray-50 py-4 md:py-8 relative"
        noValidate
      >
        {/* Loading Overlay */}
        {isFormDisabled && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-black" />
              <p className="text-lg font-medium">Saving itinerary...</p>
            </div>
          </div>
        )}
        <div className={`md:container mx-auto md:px-4 md:max-w-4xl ${isFormDisabled ? 'pointer-events-none opacity-75' : ''}`}>
          <div className="bg-white md:rounded-2xl min-h-screen md:min-h-0 p-4 md:p-12 md:shadow">
            {currentStep !== 0 && <div className="flex justify-between items-center py-4 mb-2 md:mb-8">
              <h1 className="text-xl md:text-2xl font-semibold">{!ItineraryId ? "Create New" : "Edit"} Itinerary</h1>
              <div className="flex gap-2">
                {[1, 2, 3].map(step => (
                  <div onClick={() => setCurrentStep(step)}
                    key={step}
                    className={`rounded-full w-8 h-8 flex items-center justify-center cursor-pointer ${
                      currentStep === step 
                        ? 'bg-black' 
                        : currentStep > step 
                          ? 'bg-green-500' 
                          : 'bg-white border border-gray-200'
                    }`}
                  >
                    <span className={`${currentStep === step ? "text-white" : "text-gray-700"}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>}
            <div className="h-full">
              {currentStep === 0 && (
                <div className="space-y-4 mx-4 sm:mx-6 py-4 mb-2 md:mb-8">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold">Itinerary Builder</h1>
                  <p className="pb-4 text-md sm:text-lg lg:text-xl text-gray-500">Creating an itinerary has never been easier, just fill in the details and we'll take care of the rest. Save your itinerary as a draft or publish it to share with the world.</p>
                  <div className="space-y-4">
                    <div className="flex gap-4 md:gap-6">
                      <p className="text-xl md:text-2xl font-medium w-[20px]">1</p>
                      <div className="w-full sm:mr-2">
                        <p className="text-xl md:text-2xl font-medium">Start with the basics</p>
                        <p className="text-md md:text-lg lg:text-xl text-gray-500">Add general information about your trip, like the duration and description.</p>
                      </div>
                      <div className="w-[40px] h-[40px]">
                        <PencilRuler className="w-full h-full" />
                      </div>
                    </div>

                    <div className="flex gap-4 md:gap-6">
                      <p className="text-xl md:text-2xl font-medium w-[20px]">2</p>
                      <div className="w-full sm:mr-2">
                        <p className="text-xl md:text-2xl font-medium">Create the schedule</p>
                        <p className="text-md md:text-lg lg:text-xl text-gray-500">Use the day scheduler to include as much information about daily activities as you want.</p>
                      </div>
                      <div className="w-[40px] h-[40px]">
                        <CalendarPlus className="w-full h-full" />
                      </div>
                    </div>

                    <div className="flex gap-4 md:gap-6">
                      <p className="text-xl md:text-2xl font-medium w-[20px]">3</p>
                      <div className="w-full sm:mr-2">
                        <p className="text-xl md:text-2xl font-medium">Add the final details</p>
                        <p className="text-md md:text-lg lg:text-xl text-gray-500">Help other travelers budget for this trip, provide special notes, and categorize your itinerary.</p>
                      </div>
                      <div className="w-[40px] h-[40px]">
                        <Flag className="w-full h-full" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center mx-10 pt-4">
                    <Button className="w-full md:w-[300px]" onClick={() => setCurrentStep(1)}>Get Started</Button>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex sm:flex-col gap-2 items-center sm:items-start sm:gap-0">
                    <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none" htmlFor="title">Trip Name*</Label>
                    <Input
                      id="title"
                      {...form.register("title")}
                      placeholder="Japanese Cultural Journey"
                      className="rounded-xl"
                      disabled={isFormDisabled}
                    />
                    {form.formState.errors.title && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                    )}
                    {!form.formState.errors.title && form.watch('title').length > 50 && (
                      <p className="text-red-500 text-sm mt-1">
                        Title must be less than 50 characters
                      </p>
                    )}
                  </div>

                  <div >
                    <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none" htmlFor="shortDescription">Short Description*</Label>
                    <textarea
                      id="shortDescription"
                      {...form.register("shortDescription")}
                      placeholder="Experience the best of Japan's ancient traditions and modern wonders on this comprehensive 14-day journey through the Land of the Rising Sun."
                      className="w-full text-base sm:text-sm md:text-md p-2 border rounded-xl h-[150px] md:h-[100px]"
                      disabled={isFormDisabled}
                    />
                    {form.formState.errors.shortDescription && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.shortDescription.message}</p>
                    )}
                    {!form.formState.errors.title && form.watch('title').length > 300 && (
                      <p className="text-red-500 text-sm mt-1">
                        Title must be less than 300 characters
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none" htmlFor="mainImage">Cover Image*</Label>
                    <ImageUpload
                      value={form.watch("mainImage")}
                      onChange={(url) => form.setValue("mainImage", url)}
                      onRemove={() => form.setValue("mainImage", "")}
                      disabled={isFormDisabled}
                      bucket="itinerary-images"
                      folder={`${user?.id}/${ItineraryId}/main`}
                    />
                    {form.formState.errors.mainImage && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.mainImage.message}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading none" htmlFor="detailedOverview">Detailed Overview</Label>
                    <textarea
                      id="detailedOverview"
                      {...form.register("detailedOverview")}
                      placeholder="This carefully curated journey takes you through the heart of Japan, blending ancient traditions with modern experiences. You'll explore historic temples, participate in traditional tea ceremonies, and discover the vibrant food scene. The itinerary includes stays in both luxury hotels and authentic ryokans, offering a perfect balance of comfort and cultural immersion. Suitable for first-time visitors to Japan who want to experience the country's highlights while enjoying premium accommodations and expert-guided tours."
                      className="w-full text-base sm:text-sm md:text-md p-2 border rounded-xl min-h-[210px] md:min-h-[150px]"
                      disabled={isFormDisabled}
                    />
                  </div>

                  <div className="flex sm:flex-col gap-2 items-center sm:items-start sm:gap-0">
                    <Label className="text-[16px] font-thin sm:mb-1 md:mb-2 ml-1 leading-none" htmlFor="length">Number of Days</Label>
                    <Input
                      id="length"
                      type="number"
                      min="1"
                      {...form.register("duration", { valueAsNumber: true })}
                      className="rounded-xl"
                      onChange={handleDurationChange}
                      disabled={isFormDisabled}
                    />
                    {form.formState.errors.duration && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.duration.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-10 md:pt-0">
                    {ItineraryId && itineraryStatus !== ItineraryStatusEnum.archived && 
                      <Button type="button" variant="outline" onClick={itineraryStatus === ItineraryStatusEnum.published ? onSubmit : saveDraft} disabled={isFormDisabled}>
                        {itineraryStatus === ItineraryStatusEnum.published ? 'Save' : 'Draft'}
                      </Button>
                    }

                    <Button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentStep(2)
                        scrollToTop()
                      }}
                      disabled={isFormDisabled}
                    >
                      <ChevronRight className="sm:hidden"/>
                        <p className="hidden sm:flex">
                          Next
                          <span className="hidden md:block">: Plan Days</span>
                        </p>
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      color="crimson"
                      className="text-red hover:bg-red-500 hover:text-white"
                      disabled={isFormDisabled}
                      onClick={(e) => {
                        if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
                          router.push('/my-itineraries')
                        }
                      }}
                    >
                      <X className="sm:hidden"/>
                      <span className="hidden sm:block">Cancel</span>
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="h-full">
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl md:font-semibold p-2">Day Scheduler</h2>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="enable-dates" className="text-sm">Add Specific Dates</Label>
                        <Switch
                          id="enable-dates"
                          checked={enableDates}
                          onCheckedChange={setEnableDates}
                        />
                      </div>
                    </div>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={dayFields.map(day => day.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <Accordion type="multiple" className="space-y-4">
                          {dayFields.map((day, index) => (
                            <SortableDay
                              key={day.id}
                              day={day}
                              index={index}
                              form={form}
                              onRemoveDay={handleRemoveDay}
                              disabled={isFormDisabled}
                              userId={user?.id}
                              itineraryId={ItineraryId}
                              enableDates={enableDates}
                            />
                          ))}
                        </Accordion>
                      </SortableContext>
                    </DndContext>

                    <div className="flex w-full justify-start items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newDayId = (dayFields.length + 1);
                          appendDay({ ...INITIAL_DAY, id: newDayId })
                          form.setValue('duration', dayFields.length + 1)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        <span className="hidden sm:block">Add Day</span>
                      </Button>
                    </div>

                    <div className="flex justify-end gap-2 pt-10 md:pt-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentStep(1)
                          scrollToTop()
                        }}
                        disabled={isFormDisabled}
                      >
                        <span className="hidden sm:block">Back</span>
                        <ChevronLeft className="sm:hidden" />
                      </Button>
                      {itineraryStatus !== ItineraryStatusEnum.archived && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={itineraryStatus === ItineraryStatusEnum.published ? onSubmit : saveDraft}
                          disabled={isFormDisabled}
                        >
                          {itineraryStatus === ItineraryStatusEnum.published ? 'Save' : 'Draft'}
                        </Button>
                      )}
                      <Button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentStep(3)
                          scrollToTop()
                        }}
                        disabled={isFormDisabled}
                      >
                        <ChevronRight className="sm:hidden"/>
                        <p className="hidden sm:flex">
                          Next
                          <span className="hidden md:block">: Final Details</span>
                        </p>
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        color="crimson"
                        className="text-red hover:bg-red-500 hover:text-white"
                        disabled={isFormDisabled}
                        onClick={(e) => {
                          if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
                            router.push('/my-itineraries')
                          }
                        }}
                      >
                        <X className="sm:hidden"/>
                        <span className="hidden sm:block">Cancel</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-thin sm:mb-1 md:mb-2 ml-1">Estimated Expense</h2>
                    <p className="text-xs sm:text-sm p-1 sm:p-0">Help other travelers budget their trip</p>
                      <Input
                        {...form.register('budget', {
                          setValueAs: (value) => value === "" ? null : Number.isNaN(parseInt(value)) ? null : parseInt(value)
                        })}
                        placeholder="Estimated cost per person"
                        type="number"
                        className="rounded-xl"
                      />
                  </div>

                  <div>
                    <h2 className="text-lg font-medium mb-3 ml-1">Categories <span className="text-gray-500 text-sm">(select up to 5)</span></h2>
                    <div className="md:grid-cols-4 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                      {itineraryTags.map((category) => {
                        const currentTags = form.watch('itineraryTags') || []
                        const isSelected = currentTags.includes(category.id)
                        const Icon = category.icon
                        return (
                          <label key={category.name} className="flex items-center gap-2">
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleCategory(category.id);
                              }}
                              className={`flex justify-center items-center gap-2 px-4 py-3 sm:py-4 md:gap-2 md:py-5 rounded-xl border hover:border-black transition-all duration-200 w-full group ${isSelected ? "ring-1 ring-black border-black border-3 bg-gray-100" : "border-gray-200 border-1 bg-white"}`}
                              disabled={isFormDisabled}
                            >
                              <category.icon className="w-5 h-5 text-gray-700" />
                              <span className="text-gray-900 leading-none">{category.name}</span>
                            </button>
                          </label>
                        )
                      })}
                    </div>
                    {form.formState.errors.itineraryTags && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.itineraryTags.message}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h2 className="text-lg font-semibold">Notes</h2>
                        <p className="text-sm text-gray-600">Add important notes about your trip</p>
                      </div>
                      {noteFields.length === 0 && (
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newNoteId = (noteFields.length + 1);
                            appendNote({ id: newNoteId, title: '', content: '', expanded: true })
                          }}
                          className="flex items-center gap-2"
                          disabled={isFormDisabled}
                        >
                          <Plus className="h-4 w-4" />
                          Add Note
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {noteFields.map((note, index) => (
                        <div key={note.id} className="bg-white rounded-lg border p-4 cursor-pointer"
                            onClick={() => form.setValue(`notes.${index}.expanded`, !form.watch(`notes.${index}.expanded`))}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div>
                                <div className="flex justify-between items-center">
                                  <div className="flex justify-between items-center">
                                    {form.watch(`notes.${index}.expanded`) ? (
                                      <Label className="text-[16px] font-medium ml-1">Title</Label>
                                    ) : (
                                      <Label className="text-[16px] font-medium ml-1">{form.watch(`notes.${index}.title`)}</Label>
                                    )}
                                  </div>
                                    <div className="flex gap-2 pb-2">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                        disabled={isFormDisabled}
                                      >
                                        {form.watch(`notes.${index}.expanded`) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={(event) => {
                                          event.stopPropagation()
                                          if (confirm('Are you sure you want to delete this note?')) {
                                            removeNote(index)
                                          }
                                        }}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        disabled={isFormDisabled}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                </div>
                              </div>
                              {form.watch(`notes.${index}.expanded`) && (
                                <div onClick={(e) => e.stopPropagation()}>
                                  <Input
                                    {...form.register(`notes.${index}.title`)}
                                    placeholder="Note title"
                                    className="mb-2 rounded-xl"
                                    disabled={isFormDisabled}
                                  />
                                  {form.formState.errors.notes?.[index]?.title && (
                                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.notes[index]?.title?.message}</p>
                                  )}
                                  <Label className="text-[16px] font-medium mb-3 ml-1">Content</Label>
                                  <textarea
                                    {...form.register(`notes.${index}.content`)}
                                    placeholder="Write your note here..."
                                    className="w-full min-h-[100px] p-2 border rounded-xl text-base sm:text-sm"
                                    disabled={isFormDisabled}
                                  />
                                  {form.formState.errors.notes?.[index]?.content && (
                                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.notes[index]?.content?.message}</p>
                                  )}
                                </div>
                              )}
                            </div>
                            
                          </div>
                        </div>
                      ))}

                      {noteFields.length === 0 && (
                        <div className="text-center py-8 bg-white rounded-lg border">
                          <PenSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500">No notes yet. Click "Add Note" to create one.</p>
                        </div>
                      )}
                    </div>
                    {noteFields.length > 0 && (
                    <div className="flex w-full justify-start items-center gap-4 mt-4 ">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newNoteId = (noteFields.length + 1);
                          appendNote({ id: newNoteId, title: '', content: '', expanded: true });
                        }}
                        disabled={isFormDisabled}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Note
                      </Button>
                    </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-10 md:pt-0">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentStep(2)
                        scrollToTop()
                      }}
                    >
                      <span className="hidden sm:block">Back</span>
                      <ChevronLeft className="sm:hidden" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={itineraryStatus === ItineraryStatusEnum.published ? onSubmit : saveDraft}
                      disabled={isFormDisabled}
                    >
                      {itineraryStatus === ItineraryStatusEnum.published ? 'Save' : 'Draft'}
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-black text-white hover:bg-gray-800"
                      disabled={isFormDisabled}
                    >
                      {itineraryStatus === ItineraryStatusEnum.draft || itineraryStatus == ItineraryStatusEnum.archived ? "Publish" : "Update"}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      color="crimson"
                      className="text-red hover:bg-red-500 hover:text-white"
                      disabled={isFormDisabled}
                      onClick={(e) => {
                        if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
                          router.push('/my-itineraries')
                        }
                      }}
                    >
                      <X className="sm:hidden"/>
                      <span className="hidden sm:block">Cancel</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
      
      <UpgradeDialog
        isOpen={showUpgradeDialog}
        setIsOpen={setShowUpgradeDialog}
        onUpgrade={handleUpgradeClick}
        onSaveDraft={handleSaveDraftClick}
        showDraftButton={true}
      />
    </FormProvider>
  )
} 