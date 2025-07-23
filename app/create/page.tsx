"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Plus, Minus, GripVertical, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { auth } from "@/firebase/client"
import { BlackBanner } from "@/components/ui/black-banner"
import { PenSquare } from "lucide-react"
import { useForm, useFieldArray } from "react-hook-form"
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
import { activityTags, itineraryTags } from "@/lib/constants/tags"
import { sampleItinerary } from "@/lib/constants/sample-itinerary"
import { createSchema } from "@/validation/createSchema"

type FormData = z.infer<typeof createSchema>

interface TripDay {
  id: string;
  image?: string;
  cityName: string;
  countryName: string;
  title: string;
  description: string;
  notes?: string;
  activities: Array<{
    id: string;
    time?: string;
    duration?: string;
    image?: string;
    title: string;
    description: string;
    type: 'food' | 'sightseeing' | 'culture' | 'transportation' | 'accommodation';
    link?: string; // Make link optional to match the schema
    photos?: string[];
    price?: number;
  }>;
  showAccommodation: boolean;
  accommodation: {
    name: string;
    type: string;
    location: string;
    price?: number;
    photos?: string[];
  };
}

const INITIAL_DAY: TripDay = {
  id: '1',
  cityName: '',
  countryName: '',
  title: '',
  description: '',
  activities: [],
  showAccommodation: false,
  accommodation: {
    name: '',
    type: '',
    location: '',
  }
};

function SortableDay({ day, index, form, onRemoveDay }: { 
  day: any; // Temporarily use any to fix type issues
  index: number;
  form: ReturnType<typeof useForm<FormData>>;
  onRemoveDay: (index: number) => void;
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
              <div className="flex items-center gap-4">
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Day {index + 1}</h3>
                    
                  </div>
                  {form.watch(`days.${index}.cityName`) && (
                    <p className="text-sm text-gray-600">
                      {form.watch(`days.${index}.cityName`)}, {form.watch(`days.${index}.countryName`)}
                    </p>
                  )}
                </div>
              </div>
            </AccordionTrigger>
          </div>
        </div>
        <AccordionContent>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-[16px] font-medium mb-3 ml-1">City</Label>
                <Input
                  {...form.register(`days.${index}.cityName`)}
                  className="rounded-xl"
                  placeholder="Tokyo"
                />
                {form.formState.errors.days?.[index]?.cityName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.days[index]?.cityName?.message}</p>
                )}
              </div>
              <div>
                <Label className="text-[16px] font-medium mb-3 ml-1">Country</Label>
                <Input
                  {...form.register(`days.${index}.countryName`)}
                  className="rounded-xl"
                  placeholder="Japan"
                />
                {form.formState.errors.days?.[index]?.countryName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.days[index]?.countryName?.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label className="text-[16px] font-medium mb-3 ml-1">Title</Label>
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
              <Label className="text-[16px] font-medium mb-3 ml-1">Image <span className="text-gray-500 text-sm">(optional)</span></Label>
              <Input
                {...form.register(`days.${index}.image`)}
                className="rounded-xl"
                placeholder=""
              />
            </div>

            <div>
              <Label className="text-[16px] font-medium mb-3 ml-1">Description</Label>
              <Input
                {...form.register(`days.${index}.description`)}
                placeholder="Discover the highlights of Tokyo's most famous districts"
                className="rounded-xl"
              />
              {form.formState.errors.days?.[index]?.description && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.days[index]?.description?.message}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-[16px] font-medium mb-3 ml-1">Activities <span className="text-gray-500 text-sm">(optional)</span></Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => appendActivity({
                    id: Math.random().toString(),
                    title: '',
                    description: '',
                    type: 'sightseeing',
                    link: ''
                  })}
                  className="rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Activity
                </Button>
              </div>

              <div className="space-y-4">
                {activityFields.map((activity, activityIndex) => (
                  <div key={activity.id} className="border rounded-lg p-4">
                    <div className="w-full flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeActivity(activityIndex)}
                        className="rounded-xl"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-[16px] font-medium mb-3 ml-1">Time <span className="text-gray-500 text-sm">(optional)</span></Label>
                          <Input
                            type="time"
                            {...form.register(`days.${index}.activities.${activityIndex}.time`)}
                            className="rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-[16px] font-medium mb-3 ml-1">Duration <span className="text-gray-500 text-sm">(optional)</span></Label>
                          <Input
                            type="number"
                            {...form.register(`days.${index}.activities.${activityIndex}.duration`)}
                            className="rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-[16px] font-medium mb-3 ml-1">Type</Label>
                          <select
                            {...form.register(`days.${index}.activities.${activityIndex}.type`)}
                            className="w-full p-2 border rounded-xl cursor-pointer"
                          >
                            {activityTags.map(tag => (
                              <option key={tag.name} value={tag.name}>
                                {tag.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-[16px] font-medium mb-3 ml-1">Title</Label>
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
                        {form.formState.errors.days?.[index]?.activities?.[activityIndex]?.link && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.days[index]?.activities?.[activityIndex]?.link?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-[16px] font-medium mb-3 ml-1">Accommodation<span className="text-gray-500 text-sm">(optional)</span></Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => form.setValue(`days.${index}.showAccommodation`, !form.watch(`days.${index}.showAccommodation`))}
                  className={`rounded-xl ${form.watch(`days.${index}.showAccommodation`) ? 'bg-gray-100' : ''}`}
                >
                  {form.watch(`days.${index}.showAccommodation`) ? 'Remove' : 'Add'}
                </Button>
              </div>
              {form.watch(`days.${index}.showAccommodation`) && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      {...form.register(`days.${index}.accommodation.name`)}
                      placeholder="Accommodation name"
                      className="rounded-xl"
                    />
                    <Input
                      {...form.register(`days.${index}.accommodation.type`)}
                      placeholder="Type (e.g., Hotel, Hostel)"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="mt-2">
                    <Input
                      {...form.register(`days.${index}.accommodation.location`)}
                      placeholder="Location"
                      className="rounded-xl"
                    />
                  </div>
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
  const isNewItinerary = useSearchParams().get('itineraryId') === null
  const searchParams = useSearchParams()
  const [user, setUser] = useState(auth.currentUser)
  const [currentStep, setCurrentStep] = useState(1)

  const form = useForm<FormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      status: 'draft',
      name: '',
      shortDescription: '',
      mainImage: '',
      detailedOverview: '',
      length: 1,
      countries: [{ value: '' }],
      days: [INITIAL_DAY],
      itineraryTags: [],
      notes: []
    }
  })

  const { fields: countryFields, append: appendCountry, remove: removeCountry } = useFieldArray<FormData>({
    control: form.control,
    name: "countries" as const
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
    const newLength = form.getValues('length') - 1
    form.setValue('length', newLength)
    
    // Update remaining days' IDs and titles
    const updatedDays = form.getValues('days')
    updatedDays.forEach((day, idx) => {
      day.id = (idx + 1).toString()
      day.title = `Day ${idx + 1}`
    })
    form.setValue('days', updatedDays)
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/")
        return
      }
      setUser(user)
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    const itineraryId = searchParams.get('itineraryId')    
    if (itineraryId) {
      // Map the itinerary data to the form structure
      const mappedData: FormData = {
        status: 'draft',
        name: sampleItinerary.title,
        shortDescription: sampleItinerary.description,
        mainImage: sampleItinerary.image,
        detailedOverview: sampleItinerary.details,
        length: sampleItinerary.schedule.length,
        countries: sampleItinerary.countries.map(country => ({ value: country })),
        days: sampleItinerary.schedule.map((day: any, index: number) => ({
          id: (index + 1).toString(),
          image: day.image,
          cityName: day.activities[0]?.location?.split(', ')[0] || '',
          countryName: day.activities[0]?.location?.split(', ')[1] || '',
          title: day.title,
          description: day.description,
          notes: day.notes,
          activities: day.activities.map((activity: any, actIndex: number) => ({
            id: `${index + 1}-${actIndex + 1}`,
            time: activity.time,
            duration: '',
            image: activity.image,
            title: activity.title,
            description: activity.details,
            type: activity.type as any,
            link: '',
            price: 0,
          })),
          showAccommodation: !!day.accommodation,
          accommodation: {
            name: day.accommodation?.name || '',
            type: day.accommodation?.type || '',
            location: day.accommodation?.location || '',
            price: 0,
            photos: day.accommodation?.image ? [day.accommodation.image] : [],
          }
        })),
        itineraryTags: sampleItinerary.itineraryTags,
        notes: sampleItinerary.creator.notes.map((note: any, index: number) => ({
          id: (index + 1).toString(),
          title: note.title,
          content: note.content,
          expanded: false,
        }))
      }
      form.reset(mappedData)
    }
  }, [searchParams, form])

  const handleBasicInfoSubmit = async (data: FormData) => {
    // Generate days based on the length input
    const newDays = Array.from({ length: data.length }, (_, i) => ({
      ...INITIAL_DAY,
      id: (i + 1).toString(),
      cityName: '',
      countryName: '',
      title: `Day ${i + 1}`,
      description: '',
      activities: [],
      showAccommodation: false,
      accommodation: {
        name: '',
        type: '',
        location: '',
      }
    }))
    form.setValue('days', newDays)

    // Clean up empty country fields
    const nonEmptyCountries = data.countries.filter(country => country.value.trim() !== '')
    if (nonEmptyCountries.length > 0) {
      form.setValue('countries', nonEmptyCountries)
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Also update the length input handler to update days in real-time
  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (value < 1) {
      e.target.value = '1'
      form.setValue('length', 1)
      return
    }
    
    form.setValue('length', value)
    
    // Update days array when length changes
    const currentDays = form.getValues('days')
    if (value > currentDays.length) {
      // Add new days
      const newDays = [...currentDays]
      for (let i = currentDays.length; i < value; i++) {
        newDays.push({
          ...INITIAL_DAY,
          id: (i + 1).toString(),
          title: `Day ${i + 1}`
        })
      }
      form.setValue('days', newDays)
    } else if (value < currentDays.length) {
      // Remove excess days
      form.setValue('days', currentDays.slice(0, value))
    }
  }

  const handleDayPlanningSubmit = async (data: FormData) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setCurrentStep(3)
  }

  const handleFinalSubmit = async () => {
    const data = form.getValues()
    console.log('Saving draft:', data)
    try {
      // Clean up empty country fields
      const nonEmptyCountries = data.countries.filter(country => country.value.trim() !== '')
      if (nonEmptyCountries.length > 0) {
        form.setValue('countries', nonEmptyCountries)
      }

      // Clean up empty notes
      const nonEmptyNotes = data.notes.filter(note => note.title.trim() !== '' || note.content.trim() !== '')
      form.setValue('notes', nonEmptyNotes)

      // Set status to published
      form.setValue('status', 'published')

      const finalData = form.getValues()
      console.log('Final form data:', finalData)

      // TODO: Submit to backend
      // router.push('/my-itineraries')
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const saveDraft = async () => {
    const data = form.getValues()
    // TODO: Save draft to backend
    console.log('Saving draft:', data)
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
        day.id = (index + 1).toString()
        day.title = day.title.replace(/Day \d+/, `Day ${index + 1}`)
      })
      form.setValue('days', updatedDays)
    }
  }

  const toggleCategory = (categoryId: string) => {
    const currentTags = form.getValues('itineraryTags')
    const newTags = currentTags.includes(categoryId)
      ? currentTags.filter(c => c !== categoryId)
      : currentTags.length < 3 ? [...currentTags, categoryId] : currentTags
    form.setValue('itineraryTags', newTags)
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
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="md:container mx-auto md:px-4 md:max-w-4xl">
        <div className="bg-white md:rounded-2xl p-4 md:p-12 md:shadow">
          <div className="flex justify-between items-center py-4 mb-8">
            <h1 className="text-2xl ms:text-3xl font-semibold">{isNewItinerary ? "Create New" : "Edit"} Itinerary</h1>
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

          {currentStep === 1 && (
            <form onSubmit={form.handleSubmit(handleBasicInfoSubmit)} className="space-y-6">
              <div>
                <Label className="text-md font-medium mb-3 ml-1" htmlFor="name">Trip Name</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Japanese Cultural Journey"
                  className="rounded-xl"
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <Label className="text-md font-medium mb-3 ml-1" htmlFor="shortDescription">Short Description</Label>
                <textarea
                  id="shortDescription"
                  {...form.register("shortDescription")}
                  placeholder="Experience the best of Japan's ancient traditions and modern wonders on this comprehensive 14-day journey through the Land of the Rising Sun."
                  className="w-full p-2 border rounded-xl h-[150px] md:h-[70px]"
                />
                {form.formState.errors.shortDescription && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.shortDescription.message}</p>
                )}
              </div>

              <div>
                <Label className="text-md font-medium mb-3 ml-1" htmlFor="mainImage">Main Image URL</Label>
                <Input
                  id="mainImage"
                  {...form.register("mainImage")}
                  placeholder="URL of the main trip image"
                  className="rounded-xl"
                />
                {form.formState.errors.mainImage && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.mainImage.message}</p>
                )}
              </div>

              <div>
                <Label className="text-md font-medium mb-3 ml-1" htmlFor="detailedOverview">Detailed Overview <span className="text-gray-500 text-sm">(optional)</span></Label>
                <textarea
                  id="detailedOverview"
                  {...form.register("detailedOverview")}
                  placeholder="This carefully curated journey takes you through the heart of Japan, blending ancient traditions with modern experiences. You'll explore historic temples, participate in traditional tea ceremonies, and discover the vibrant food scene. The itinerary includes stays in both luxury hotels and authentic ryokans, offering a perfect balance of comfort and cultural immersion. Suitable for first-time visitors to Japan who want to experience the country's highlights while enjoying premium accommodations and expert-guided tours."
                  className="w-full p-2 border rounded-xl min-h-[200px] md:min-h-[150px]"
                />
              </div>

              <div>
                <Label className="text-md font-medium mb-3 ml-1" htmlFor="length">Number of Days</Label>
                <Input
                  id="length"
                  type="number"
                  min="1"
                  {...form.register("length", { valueAsNumber: true })}
                  className="rounded-xl"
                  onChange={handleLengthChange}
                />
                {form.formState.errors.length && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.length.message}</p>
                )}
              </div>

              <div>
                <Label className="text-md font-medium mb-3 ml-1">Countries</Label>
                <div className="space-y-2">
                  {countryFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        {...form.register(`countries.${index}.value`)}
                        placeholder="Japan"
                        className="rounded-xl"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (index === countryFields.length - 1) {
                            appendCountry({ value: '' })
                          } else {
                            removeCountry(index)
                          }
                        }}
                      >
                        {index === countryFields.length - 1 ? (
                          <Plus className="w-4 h-4" />
                        ) : (
                          <Minus className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                  {form.formState.errors.countries && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.countries.message}
                    </p>
                  )}
                  {countryFields.map((field, index) => (
                    form.formState.errors.countries?.[index]?.value && (
                      <p key={field.id} className="text-red-500 text-sm mt-1">
                        {form.formState.errors.countries[index]?.value?.message}
                      </p>
                    )
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                {form.getValues("status") === 'draft' && (
                  <Button type="button" variant="outline" onClick={saveDraft}>
                    Save as Draft
                  </Button>
                )}
                <Button type="submit" onClick={() => setCurrentStep(2)}>
                  Next: Plan Days
                </Button>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={form.handleSubmit(handleDayPlanningSubmit)} className="space-y-6">
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
                    const newDayId = (dayFields.length + 1).toString();
                    appendDay({ ...INITIAL_DAY, id: newDayId })
                    form.setValue('length', dayFields.length + 1)
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
                  onClick={() => setCurrentStep(1)}
                >
                  Previous
                </Button>
                <Button type="button" variant="outline" onClick={saveDraft}>
                  Save as Draft
                </Button>
                <Button type="submit" onClick={() => setCurrentStep(3)}>
                  Next: Final Details
                </Button>
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-6">
              <div>
                <h2 className="text-lg font-medium mb-3 ml-1">Categories <span className="text-gray-500 text-sm">(select up to 3)</span></h2>
                <div className="flex flex-wrap sm:grid sm:grid-cols-3 md:grid-cols-4 gap-2 w-full">
                  {itineraryTags.map((category) => {
                    const isSelected = form.watch('itineraryTags').includes(category.name)
                    const Icon = category.icon
                    return (
                      <label key={category.name} className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleCategory(category.name);
                          }}
                          className={`flex justify-center items-center gap-2 px-4 py-3 sm:py-4 md:gap-2 md:py-6 rounded-xl border hover:border-black transition-all duration-200 w-full group ${isSelected ? "ring-1 ring-black border-black border-3 bg-gray-100" : "border-gray-200 border-1 bg-white"}`}
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
                    <h2 className="text-lg font-semibold">Notes <span className="text-gray-500 text-sm">(optional)</span></h2>
                    <p className="text-sm text-gray-600">Add important notes about your trip</p>
                  </div>
                  {noteFields.length === 0 && (
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newNoteId = (noteFields.length + 1).toString();
                        appendNote({ id: newNoteId, title: '', content: '', expanded: true })
                      }}
                      className="flex items-center gap-2"
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
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                  >
                                    {form.watch(`notes.${index}.expanded`) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeNote(index)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                            </div>
                          </div>
                          {form.watch(`notes.${index}.expanded`) && (
                            <div>
                              <Input
                                {...form.register(`notes.${index}.title`)}
                                placeholder="Note title"
                                className="mb-2 rounded-xl"
                              />
                              {form.formState.errors.notes?.[index]?.title && (
                                <p className="text-red-500 text-sm mt-1">{form.formState.errors.notes[index]?.title?.message}</p>
                              )}
                              <Label className="text-[16px] font-medium mb-3 ml-1">Content</Label>
                              <textarea
                                {...form.register(`notes.${index}.content`)}
                                placeholder="Write your note here..."
                                className="w-full min-h-[100px] p-2 border rounded-xl"
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
                      const newNoteId = (noteFields.length + 1).toString();
                      appendNote({ id: newNoteId, title: '', content: '', expanded: true });
                    }}
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
                  onClick={() => setCurrentStep(2)}
                >
                  Previous
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={saveDraft}
                >
                  Save as Draft
                </Button>
                <Button 
                  type="submit"
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Create Itinerary
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 