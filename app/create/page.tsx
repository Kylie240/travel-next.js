 "use client"

 import React from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Plus, Minus, GripVertical, Trash2, ChevronDown, ChevronUp, X, Check, Upload } from "lucide-react"
import { BlackBanner } from "@/components/ui/black-banner"
import { PenSquare } from "lucide-react"
import { useForm, useFieldArray, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { accommodations } from "@/lib/constants/accommodations"
import { Accommodation } from "@/types/Accommodation"
import { createItinerary, getItineraryById, updateItinerary } from "@/lib/actions/itinerary.actions"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { CreateItinerary } from "@/types/createItinerary"
import { Day } from "@/types/Day"
import { Note } from "@/types/Note"
import { Activity } from "@/types/Activity"
import { supabase } from "@/utils/supabase/superbase-client"
import { ItineraryStatusEnum } from "@/enums/itineraryStatusEnum"
import { ItineraryStatus } from "@/types/itineraryStatus"
import { ImageUpload } from "@/components/ui/image-upload"
import { v4 as uuidv4 } from 'uuid'

type City = { city: string; country: string };
type FormData = {
  status: number;
  title: string;
  shortDescription: string;
  mainImage: string;
  detailedOverview?: string;
  duration: number;
  countries?: string[];
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

function SortableDay({ day, index, form, onRemoveDay, userId }: { 
  day: any; // Temporarily use any to fix type issues
  index: number;
  form: ReturnType<typeof useForm<FormData>>;
  onRemoveDay: (index: number) => void;
  disabled: boolean;
  userId: string;
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
  const existingCountries = form.getValues('countries') || [];
  const existingCities = form.getValues('cities') || [];
  const existingProvinces = form.getValues('provinces') || [];
  
  // Filter out empty/null values
  const filteredCountries = existingCountries.filter(Boolean);
  const filteredCities = existingCities.filter(Boolean);
  const filteredProvinces = existingProvinces.filter(Boolean);
  const [showCustomCountry, setShowCustomCountry] = useState(false);
  const [customCountry, setCustomCountry] = useState('');
  const [showCustomCity, setShowCustomCity] = useState(false);
  const [customCity, setCustomCity] = useState({ city: '', country: '' });
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
  }, [supabase])
  
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

  const handleCustomCountrySubmit = () => {
    if (customCountry.trim()) {
      // Update the day's country
      form.setValue(`days.${index}.countryName`, customCountry.trim(), {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });

      // Add to main countries list if not already there
      const countriesField = form.getValues('countries');
      if (!countriesField.includes(customCountry.trim())) {
        form.setValue('countries', [...countriesField, customCountry], {
          shouldValidate: true
        });
      }
      setShowCustomCountry(false);
      setCustomCountry('');
    }
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
                    <h3 className="text-lg font-semibold">Day {index + 1} {day.title && `: ${form.watch(`days.${index}.title`)}`}</h3>
                  </div>
                  {form.watch(`days.${index}.cityName`) && (
                    <p className="text-sm text-gray-600">
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
                    if (confirm('Are you sure you want to delete this note?')) {
                      onRemoveDay(index)
                    }
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={form.formState.isSubmitting}
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
              <div>
                <Label className="text-[16px] font-medium mb-3 ml-1">City *</Label>
                <Input
                  {...form.register(`days.${index}.cityName`)}
                  className="rounded-xl"
                  placeholder="Tokyo"
                />
                {/* {showCustomCity || filteredCities.length === 0 ? (
                  <div className="flex gap-2">
                    <Input
                      value={customCity.city}
                      onChange={(e) => setCustomCity({ ...customCity, city: e.target.value })}
                      className="rounded-xl"
                      placeholder="Tokyo"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCustomCitySubmit();
                        }
                      }}
                    />
                    {customCity.city.trim() && (
                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        variant="ghost"
                        onClick={handleCustomCitySubmit}
                        className="rounded-xl"
                        disabled={!customCity.city.trim()}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setShowCustomCity(false);
                          setCustomCity({ city: '', country: '' });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    )}
                  </div>
                ) : (
                  <Select
                    value={form.watch(`days.${index}.cityName`) || ''}
                    onValueChange={(value: string) => {
                      if (value === 'custom') {
                        setShowCustomCity(true);
                      } else {
                        const selectedCity = filteredCities.find(c => c.city === value);
                        if (selectedCity) {
                          // Update both city and country
                          form.setValue(`days.${index}.cityName`, selectedCity.city);
                          form.setValue(`days.${index}.countryName`, selectedCity.country);
                          
                          // Add to countries list if not already there
                          const currentCountries = form.getValues('countries') || [];
                          if (!currentCountries.includes(selectedCity.country)) {
                            form.setValue('countries', [...currentCountries, selectedCity.country]);
                          }
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(new Set(filteredCities.map(city => city.city))).map((cityName) => {
                        const city = filteredCities.find(c => c.city === cityName);
                        return (
                          <SelectItem key={cityName} value={cityName}>
                            {cityName} ({city?.country})
                          </SelectItem>
                        );
                      })}
                      <SelectItem value="custom">+ Add New City</SelectItem>
                    </SelectContent>
                  </Select>
                )} */}
                {form.formState.errors.days?.[index]?.cityName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.days[index]?.cityName?.message}</p>
                )}
              </div>
              <div>
                <Label className="text-[16px] font-medium mb-3 ml-1">State / Province</Label>
                <Input
                  {...form.register(`days.${index}.provinceName`)}
                  className="rounded-xl"
                  placeholder="" 
                />
              </div>
              <div>
                <Label className="text-[16px] font-medium mb-3 ml-1">Country *</Label>
                {showCustomCountry || filteredCountries.length === 0 ? (
                  <div className="flex gap-2">
                    <Input
                      value={customCountry}
                      onChange={(e) => setCustomCountry(e.target.value)}
                      className="rounded-xl"
                      placeholder="Japan"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCustomCountrySubmit();
                        }
                      }}
                    />
                    {customCountry.trim() && (
                      <div className="flex gap-2">
                      <Button 
                        type="button"
                        variant="ghost"
                        onClick={handleCustomCountrySubmit}
                        className="rounded-xl"
                        disabled={!customCountry.trim()}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setShowCustomCountry(false);
                          setCustomCountry('');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    )}
                  </div>
                ) : (
                  <Select
                    defaultValue={form.getValues(`days.${index}.countryName`) || ''}
                    onValueChange={(value: string) => {
                      if (value === 'custom') {
                        setShowCustomCountry(true);
                      } else {
                        form.setValue(`days.${index}.countryName`, value, {
                          shouldValidate: true,
                          shouldDirty: true,
                          shouldTouch: true
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCountries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">+ Add New Country</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {form.formState.errors.days?.[index]?.countryName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.days[index]?.countryName?.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label className="text-[16px] font-medium mb-3 ml-1">Title *</Label>
              <Input
                {...form.register(`days.${index}.title`)}
                className="rounded-xl"
                placeholder="Tokyo Exploration"
              />
              {form.formState.errors.days?.[index]?.title && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.days[index]?.title?.message}</p>
              )}
            </div>
            
            <div>
              <Label className="text-[16px] font-medium mb-3 ml-1">Cover Image</Label>
              <ImageUpload
                value={form.watch(`days.${index}.image`)}
                onChange={(url) => form.setValue(`days.${index}.image`, url)}
                onRemove={() => form.setValue(`days.${index}.image`, "")}
                disabled={form.formState.isSubmitting}
                bucket="itinerary-images"
                folder={`itineraries/${userId}/days`}
              />
            </div>

            <div>
              <Label className="text-[16px] font-medium mb-3 ml-1">Description</Label>
              <Textarea
                {...form.register(`days.${index}.description`)}
                placeholder="Discover the highlights of Tokyo's most famous districts"
                className="rounded-xl"
                rows={6}
              />
              {form.formState.errors.days?.[index]?.description && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.days[index]?.description?.message}</p>
              )}
            </div>

            <div className="py-4">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-[16px] font-medium mb-3 ml-1">Activities</Label>
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
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Activity
                </Button>}
              </div>

              <div className="space-y-4">
                {activityFields.map((activity, activityIndex) => (
                  <div className="border rounded-lg px-4">
                    <AccordionItem value={activity.id}>
                      <div className="flex-1">
                        <AccordionTrigger>
                          <div className="flex w-full justify-between ml-2">
                            <p className="text-lg font-light">{`${form.watch(`days.${index}.activities.${activityIndex}.title`)}` ? `${form.watch(`days.${index}.activities.${activityIndex}.title`)}` : `Activity ${activityIndex + 1}`}</p>
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
                                disabled={form.formState.isSubmitting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                        </AccordionTrigger>
                      </div>
                      <AccordionContent>
                        <div key={activity.id} className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              <div>
                                <Label className="text-[16px] font-medium mb-3 ml-1">Start Time</Label>
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
                                  className="rounded-xl"
                                />
                              </div>
                              <div>
                                <Label className="text-[16px] font-medium mb-3 ml-1">Duration <span className="text-gray-500 text-sm">(minutes)</span></Label>
                                <Input
                                  type="number"
                                  {...form.register(`days.${index}.activities.${activityIndex}.duration`, {
                                    setValueAs: (value) => value === "" ? null : Number.isNaN(parseInt(value, 10)) ? null : parseInt(value, 10)
                                  })}
                                  className="rounded-xl"
                                />
                              </div>
                                <div>
                                  <Label className="text-[16px] font-medium mb-3 ml-1">Type</Label>
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
                            <div>
                              <Label className="text-[16px] font-medium mb-3 ml-1">Title *</Label>
                              <Input
                                {...form.register(`days.${index}.activities.${activityIndex}.title`)}
                                placeholder="Activity title"
                                className="rounded-xl"
                              />
                              {form.formState.errors.days?.[index]?.activities?.[activityIndex]?.title && (
                                <p className="text-red-500 text-sm mt-1">
                                  {form.formState.errors.days[index]?.activities?.[activityIndex]?.title?.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label className="text-[16px] font-medium mb-3 ml-1">Description</Label>
                              <textarea
                                {...form.register(`days.${index}.activities.${activityIndex}.description`)}
                                placeholder="Activity description"
                                className="w-full p-2 border rounded-xl min-h-[100px]"
                              />
                              {form.formState.errors.days?.[index]?.activities?.[activityIndex]?.description && (
                                <p className="text-red-500 text-sm mt-1">
                                  {form.formState.errors.days[index]?.activities?.[activityIndex]?.description?.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label className="text-[16px] font-medium mb-3 ml-1">Link</Label>
                              <Input
                                {...form.register(`days.${index}.activities.${activityIndex}.link`)}
                                placeholder="Add booking link, or a link to a website with more information"
                                className="rounded-xl"
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
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Activity
                </Button>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-[16px] font-medium mb-3 ml-1">Accommodation</Label>
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
                >
                  {form.watch(`days.${index}.showAccommodation`) ? 
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remove Accommodation
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
                        />
                        <Select
                          value={form.watch(`days.${index}.accommodation.type`) || ''}
                          onValueChange={(value: string) => {
                            form.setValue(`days.${index}.accommodation.type`, value);
                          }}
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
                        />
                      </div>
                      <div>
                        <Input
                          {...form.register(`days.${index}.accommodation.link`)}
                          placeholder="Add booking link, or a link to a website with more information"
                          className="rounded-xl"
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
  const ItineraryId = useSearchParams().get('itineraryId')
  const [itineraryStatus, setItineraryStatus] = useState<number>(ItineraryStatusEnum.draft)
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [itineraryLoading, setItineraryLoading] = useState(false)
  const [itineraryTags, _] = useState<Array<{id: number; name: string; icon: any}>>(itineraryTagsMap)

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
  
  const [currentStep, setCurrentStep] = useState(1)

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
      countries: [],
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
      if (itineraryId) {
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
  }, [searchParams, form])

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
          price: activity.price || 0
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

      // Clean up empty country fields
      const nonEmptyCountries = data.countries.filter(country => country && country.length > 0)
      if (nonEmptyCountries.length > 0) {
        form.setValue('countries', nonEmptyCountries)
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
      toast.error('Error submitting form')
    }
  }

      const handleSaveItinerary = async () => {
    try {
      if (!user) {
        toast.error('Please sign in to save your itinerary')
        router.push('/') // Redirect to home/login page
        return
      }
      
      const formData = form.getValues();
      const itineraryData = {
        status: formData.status as number,
        title: formData.title,
        shortDescription: formData.shortDescription,
        mainImage: formData.mainImage,
        detailedOverview: formData.detailedOverview,
        duration: formData.duration,
        countries: formData.countries,
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
            price: activity.price || 0
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
      
      try {
        let response = null;
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
        }
        throw new Error('Failed to save itinerary');
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        toast.error('Session expired. Please sign in again.')
        router.push('/')
      } else {
        toast.error('Error saving itinerary')
      }
      throw error // Re-throw to be caught by handleFinalSubmit
    }
  }

    const onSubmit = form.handleSubmit(async (data) => {
      try {
        const isValid = await form.trigger()
        if (isValid) {
          await handleFinalSubmit(data)
        } else {
          toast.error('Please fill in all required fields')
        }
      } catch (error) {
        toast.error('Error submitting form')
      }
    }, (errors) => {
      toast.error('Please fill in all required fields')
    })
  
  const saveDraft = async () => {
    setIsSubmitting(true)
    try {
      if (!user) {
        toast.error('Please sign in to save your itinerary')
        router.push('/')
        return
      }

      const formData = form.getValues()
      const itineraryData: CreateItinerary = {
        ...formData,
        status: itineraryStatus === ItineraryStatusEnum.archived ? ItineraryStatusEnum.archived : ItineraryStatusEnum.draft
      }

      console.log(itineraryData)
      let response = null;
      if (ItineraryId) {
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
        title="Sign in to Start Creating"
        description="Join our community to create and share your travel experiences with fellow adventurers."
      />
    )
  }

  return (
    <FormProvider {...form}> 
      <form 
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(e)
        }} 
        className="min-h-screen bg-gray-50 py-4 md:py-8"
        noValidate
      >
        <div className="md:container mx-auto md:px-4 md:max-w-4xl">
          <div className="bg-white md:rounded-2xl p-4 md:p-12 md:shadow">
            <div className="flex justify-between items-center py-4 mb-8">
              <h1 className="text-2xl ms:text-3xl font-semibold">{!ItineraryId ? "Create New" : "Edit"} Itinerary</h1>
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
            </div>
            <div>
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-md font-medium mb-3 ml-1" htmlFor="title">Trip Name *</Label>
                    <Input
                      id="title"
                      {...form.register("title")}
                      placeholder="Japanese Cultural Journey"
                      className="rounded-xl"
                      disabled={form.formState.isSubmitting}
                    />
                    {form.formState.errors.title && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-md font-medium mb-3 ml-1" htmlFor="shortDescription">Short Description *</Label>
                    <textarea
                      id="shortDescription"
                      {...form.register("shortDescription")}
                      placeholder="Experience the best of Japan's ancient traditions and modern wonders on this comprehensive 14-day journey through the Land of the Rising Sun."
                      className="w-full p-2 border rounded-xl h-[150px] md:h-[100px]"
                      disabled={form.formState.isSubmitting}
                    />
                    {form.formState.errors.shortDescription && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.shortDescription.message}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-md font-medium mb-3 ml-1" htmlFor="mainImage">Cover Image *</Label>
                    <ImageUpload
                      value={form.watch("mainImage")}
                      onChange={(url) => form.setValue("mainImage", url)}
                      onRemove={() => form.setValue("mainImage", "")}
                      disabled={form.formState.isSubmitting}
                      bucket="itinerary-images"
                      folder={`itineraries/${user?.id}/main`}
                    />
                    {form.formState.errors.mainImage && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.mainImage.message}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-md font-medium mb-3 ml-1" htmlFor="detailedOverview">Detailed Overview</Label>
                    <textarea
                      id="detailedOverview"
                      {...form.register("detailedOverview")}
                      placeholder="This carefully curated journey takes you through the heart of Japan, blending ancient traditions with modern experiences. You'll explore historic temples, participate in traditional tea ceremonies, and discover the vibrant food scene. The itinerary includes stays in both luxury hotels and authentic ryokans, offering a perfect balance of comfort and cultural immersion. Suitable for first-time visitors to Japan who want to experience the country's highlights while enjoying premium accommodations and expert-guided tours."
                      className="w-full p-2 border rounded-xl min-h-[210px] md:min-h-[150px]"
                      disabled={form.formState.isSubmitting}
                    />
                  </div>

                  <div>
                    <Label className="text-md font-medium mb-3 ml-1" htmlFor="length">Number of Days</Label>
                    <Input
                      id="length"
                      type="number"
                      min="1"
                      {...form.register("duration", { valueAsNumber: true })}
                      className="rounded-xl"
                      onChange={handleDurationChange}
                      disabled={form.formState.isSubmitting}
                    />
                    {form.formState.errors.duration && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.duration.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={saveDraft} disabled={form.formState.isSubmitting}>
                      Save
                    </Button>
                    <Button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentStep(2)
                        scrollToTop()
                      }}
                      disabled={form.formState.isSubmitting}
                    >
                      Next: Plan Days
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      className="text-red hover:bg-red-500 hover:text-white"
                      disabled={form.formState.isSubmitting}
                      onClick={(e) => {
                        router.push('/my-itineraries')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Day Planning</h2>
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
                            disabled={form.formState.isSubmitting}
                            userId={user?.id}
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
                      Add Day
                    </Button>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentStep(1)
                        scrollToTop()
                      }}
                      disabled={form.formState.isSubmitting}
                    >
                      Previous
                    </Button>
                    <Button type="button" variant="outline" onClick={saveDraft} disabled={form.formState.isSubmitting}>
                      Save
                    </Button>
                    <Button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentStep(3)
                        scrollToTop()
                      }}
                      disabled={form.formState.isSubmitting}
                    >
                      Next: Final Details
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      className="text-red hover:bg-red-500 hover:text-white"
                      disabled={form.formState.isSubmitting}
                      onClick={(e) => {
                        router.push('/my-itineraries')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium mb-3 ml-1">Estimated Expense</h2>
                    <p>Help other travelers budget their trip. Not sure? Select a budget range instead</p>
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
                    <div className="flex flex-wrap sm:grid sm:grid-cols-3 md:grid-cols-4 gap-3 w-full">
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
                              disabled={form.formState.isSubmitting}
                            >
                              <category.icon className="w-5 h-5 text-gray-700" />
                              <span className="text-gray-900 font-medium">{category.name}</span>
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
                          disabled={form.formState.isSubmitting}
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
                                        disabled={form.formState.isSubmitting}
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
                                        disabled={form.formState.isSubmitting}
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
                                    disabled={form.formState.isSubmitting}
                                  />
                                  {form.formState.errors.notes?.[index]?.title && (
                                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.notes[index]?.title?.message}</p>
                                  )}
                                  <Label className="text-[16px] font-medium mb-3 ml-1">Content</Label>
                                  <textarea
                                    {...form.register(`notes.${index}.content`)}
                                    placeholder="Write your note here..."
                                    className="w-full min-h-[100px] p-2 border rounded-xl"
                                    disabled={form.formState.isSubmitting}
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
                        disabled={form.formState.isSubmitting}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Note
                      </Button>
                    </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentStep(2)
                        scrollToTop()
                      }}
                    >
                      Previous
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={saveDraft}
                      disabled={form.formState.isSubmitting}
                    >
                      Save
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-black text-white hover:bg-gray-800"
                      disabled={form.formState.isSubmitting}
                    >
                      {itineraryStatus === ItineraryStatusEnum.draft ? "Publish" : "Update"}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      className="text-red hover:bg-red-500 hover:text-white"
                      disabled={form.formState.isSubmitting}
                      onClick={(e) => {
                        router.push('/my-itineraries')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
} 