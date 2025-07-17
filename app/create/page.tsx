"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Plus, Minus, Image as Hotel, Utensils, Map, Search, Car, GripVertical, Trash2 } from "lucide-react"
import { auth } from "@/lib/firebase"
import { BlackBanner } from "@/components/ui/black-banner"
import { PenSquare } from "lucide-react"
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { activityTags, itineraryTags } from "@/lib/constants/tags"

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
    link: string;
    photos?: string[];
    price?: number;
  }>;
  accommodation: {
    name: string;
    type: string;
    location: string;
    price?: number;
    photos?: string[];
  };
}

interface TripData {
  name: string;
  shortDescription: string;
  mainImage: string;
  detailedOverview: string;
  length: number;
  countries: string[];
  days: TripDay[];
  categories: string[];
  notes: {
    id: string;
    title: string;
    content: string;
  }[];
}

const INITIAL_DAY: TripDay = {
  id: '1',
  cityName: '',
  countryName: '',
  title: '',
  description: '',
  activities: [],
  accommodation: {
    name: '',
    type: '',
    location: '',
  }
};

function SortableDay({ day, onUpdate, onRemoveActivity, onAddActivity, onRemoveDay }: { 
  day: TripDay; 
  onUpdate: (updates: Partial<TripDay>) => void;
  onRemoveActivity: (activityId: string) => void;
  onAddActivity: () => void;
  onRemoveDay: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: day.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem value={day.id} className="border rounded-xl p-8 mb-4 bg-white">
        <div className="flex items-center gap-4">
          <div {...attributes} {...listeners} className="cursor-grab hover:text-gray-600">
            <GripVertical size={20} />
          </div>
          <div className="flex-1">
            <AccordionTrigger>
              <div className="flex items-center gap-4">
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold">Day {parseInt(day.id)}</h3>
                  {day.cityName && (
                    <p className="text-sm text-gray-600">
                      {day.cityName}, {day.countryName}
                    </p>
                  )}
                </div>
              </div>
            </AccordionTrigger>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onRemoveDay();
            }}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <AccordionContent>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[16px] font-medium mb-3 ml-1">City</Label>
                <Input
                  value={day.cityName}
                  onChange={e => onUpdate({ cityName: e.target.value })}
                  className="rounded-xl"
                  placeholder="Tokyo"
                />
              </div>
              <div>
                <Label className="text-[16px] font-medium mb-3 ml-1">Country</Label>
                <Input
                  value={day.countryName}
                  onChange={e => onUpdate({ countryName: e.target.value })}
                  className="rounded-xl"
                  placeholder="Japan"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-[16px] font-medium mb-3 ml-1">Title</Label>
                <Input
                  value={day.title}
                  onChange={e => onUpdate({ title: e.target.value })}
                  className="rounded-xl"
                  placeholder="Tokyo Exploration"
                />
            </div>
            
            <div>
              <Label className="text-[16px] font-medium mb-3 ml-1">Image <span className="text-gray-500 text-sm">(optional)</span></Label>
                <Input
                  value={day.image}
                  onChange={e => onUpdate({ image: e.target.value })}
                  className="rounded-xl"
                  placeholder=""
                />
            </div>

            <div>
              <Label className="text-[16px] font-medium mb-3 ml-1">Description</Label>
                <Input
                  value={day.description}
                  onChange={e => onUpdate({ description: e.target.value })}
                  placeholder="Discover the highlights of Tokyo's most famous districts"
                  className="rounded-xl"
                />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-[16px] font-medium mb-3 ml-1">Activities <span className="text-gray-500 text-sm">(optional)</span></Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={onAddActivity}
                  className="rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Activity
                </Button>
              </div>

              <div className="space-y-4">
                {day.activities.map((activity, index) => (
                  <div key={activity.id} className="border rounded-lg p-4">  
                    <div className="w-full flex justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveActivity(activity.id)}
                        className="rounded-xl"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>          
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-[16px] font-medium mb-3 ml-1">Time <span className="text-gray-500 text-sm">(optional)</span></Label>
                          <Input
                            type="time"
                            value={activity.time || ''}
                            className="rounded-xl"
                            onChange={e => onUpdate({
                              activities: day.activities.map((a, i) =>
                                i === index ? { ...a, time: e.target.value } : a
                              )
                            })}
                          />
                        </div>
                        <div>
                          <Label className="text-[16px] font-medium mb-3 ml-1">Duration <span className="text-gray-500 text-sm">(optional)</span></Label>
                          <Input
                            type="number"
                            value={activity.duration || ''}
                            className="rounded-xl"
                            onChange={e => onUpdate({
                              activities: day.activities.map((a, i) => {
                                if (i === index) {
                                  return { ...a, duration: e.target.value }
                                }
                                return a
                              })
                            })}
                          />
                        </div>
                        <div>
                          <Label className="text-[16px] font-medium mb-3 ml-1">Type</Label>
                          <select
                            value={activity.type}
                            onChange={e => onUpdate({
                              activities: day.activities.map((a, i) =>
                                i === index ? { ...a, type: e.target.value as any } : a
                              )
                            })}
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
                          value={activity.title}
                          onChange={e => onUpdate({
                            activities: day.activities.map((a, i) =>
                              i === index ? { ...a, title: e.target.value } : a
                            )
                          })}
                          placeholder="Activity title"
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                      <Label className="text-[16px] font-medium mb-3 ml-1">Image <span className="text-gray-500 text-sm">(optional)</span></Label>
                        <Input
                          value={day.image}
                          onChange={e => onUpdate({ countryName: e.target.value })}
                          className="rounded-xl"
                          placeholder=""
                        />
                      </div>
                      <div>
                        <Label className="text-[16px] font-medium mb-3 ml-1">Description</Label>
                        <textarea
                          value={activity.description}
                          onChange={e => onUpdate({
                            activities: day.activities.map((a, i) =>
                              i === index ? { ...a, description: e.target.value } : a
                            )
                          })}
                          placeholder="Activity description"
                          className="w-full p-2 border rounded-xl min-h-[100px] rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-[16px] font-medium mb-3 ml-1">Link</Label>
                          <Input
                            value={activity.link}
                            onChange={e => onUpdate({
                              activities: day.activities.map((a, i) =>
                                i === index ? { ...a, link: e.target.value } : a
                              )
                            })}
                            placeholder="Add booking link, or a link to a website with more information"
                            className="rounded-xl"
                          />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-[16px] font-medium mb-3 ml-1">Accommodation <span className="text-gray-500 text-sm">(optional)</span></Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  value={day.accommodation.name}
                  onChange={e => onUpdate({
                    accommodation: { ...day.accommodation, name: e.target.value }
                  })}
                  placeholder="Accommodation name"
                  className="rounded-xl"
                />
                <Input
                  value={day.accommodation.type}
                  onChange={e => onUpdate({
                    accommodation: { ...day.accommodation, type: e.target.value }
                  })}
                  placeholder="Type (e.g., Hotel, Hostel)"
                  className="rounded-xl"
                />
              </div>
              <div className="mt-2">
                <Input
                  value={day.accommodation.location}
                  onChange={e => onUpdate({
                    accommodation: { ...day.accommodation, location: e.target.value }
                  })}
                  placeholder="Location"
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}

export default function CreatePage() {
  const router = useRouter()
  const [user, setUser] = useState(auth.currentUser)
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [tripData, setTripData] = useState<TripData>({
    name: '',
    shortDescription: '',
    mainImage: '',
    detailedOverview: '',
    length: 1,
    countries: [''],
    days: [INITIAL_DAY],
    categories: [],
    notes: []
  })

  const updateNote = (noteId: string, updates: Partial<TripData['notes'][0]>) => {
    setTripData(prev => ({
      ...prev,
      notes: prev.notes.map(note => 
        note.id === noteId ? { ...note, ...updates } : note
      )
    }))
  }

  const removeNote = (noteId: string) => {
    setTripData(prev => ({
      ...prev,
      notes: prev.notes.filter(note => note.id !== noteId)
    }))
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Create initial days based on trip length
    const days = Array.from({ length: tripData.length }, (_, i) => ({
      ...INITIAL_DAY,
      id: (i + 1).toString()
    }))
    setTripData(prev => ({ ...prev, days }))
    setCurrentStep(2)
  }

  const handleDayPlanningSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep(3)
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to backend
    console.log(tripData)
  }

  const updateDay = (dayId: string, updates: Partial<TripDay>) => {
    setTripData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId ? { ...day, ...updates } : day
      )
    }))
  }

  const addActivity = (dayId: string) => {
    const newActivity = {
      id: Math.random().toString(),
      title: '',
      description: '',
      type: 'sightseeing' as const,
      link: ''
    }
    setTripData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId 
          ? { ...day, activities: [...day.activities, newActivity] }
          : day
      )
    }))
  }

  const updateActivity = (dayId: string, activityId: string, updates: Partial<TripDay['activities'][0]>) => {
    setTripData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId 
          ? {
              ...day,
              activities: day.activities.map(activity =>
                activity.id === activityId
                  ? { ...activity, ...updates }
                  : activity
              )
            }
          : day
      )
    }))
  }

  const removeActivity = (dayId: string, activityId: string) => {
    setTripData(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.id === dayId 
          ? {
              ...day,
              activities: day.activities.filter(a => a.id !== activityId)
            }
          : day
      )
    }))
  }

  const removeDay = (dayId: string) => {
    if (tripData.days.length <= 1) {
      return; // Don't remove the last day
    }
    
    const newDays = tripData.days.filter(day => day.id !== dayId);
    // Renumber the remaining days
    const updatedDays = newDays.map((day, index) => ({
      ...day,
      id: (index + 1).toString()
    }));
    
    setTripData(prev => ({
      ...prev,
      days: updatedDays,
      length: updatedDays.length
    }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTripData((prev) => {
        const oldIndex = prev.days.findIndex((day) => day.id === active.id);
        const newIndex = prev.days.findIndex((day) => day.id === over.id);
        
        const newDays = arrayMove(prev.days, oldIndex, newIndex);
        // Update day IDs to maintain order
        return {
          ...prev,
          days: newDays.map((day, index) => ({
            ...day,
            id: (index + 1).toString()
          }))
        };
      });
    }
  };

  const toggleCategory = (categoryId: string) => {
    setTripData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : tripData.categories.length < 3 ?
          [...prev.categories, categoryId]
        : prev.categories
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl p-12 shadow p-6">
          <div className="flex justify-between items-center py-4 mb-8">
            <h1 className="text-3xl font-semibold">Create New Itinerary</h1>
            <div className="flex gap-2">
              {[1, 2, 3].map(step => (
                <div
                  key={step}
                  className={`rounded-full w-8 h-8 flex items-center justify-center ${
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
            <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
              <div>
                <Label className="text-md font-medium mb-3 ml-1" htmlFor="name">Trip Name</Label>
                <Input
                  id="name"
                  value={tripData.name}
                  onChange={e => setTripData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Japanese Cultural Journey"
                  className="rounded-xl"
                  required
                />
              </div>

              <div>
                <Label className="text-md font-medium mb-3 ml-1" htmlFor="shortDescription">Short Description</Label>
                <textarea
                  id="shortDescription"
                  value={tripData.shortDescription}
                  onChange={e => setTripData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  placeholder="Experience the best of Japan's ancient traditions and modern wonders on this comprehensive 14-day journey through the Land of the Rising Sun."
                  className="w-full p-2 border rounded-xl h-[70px]"
                />
              </div>

              <div>
                <Label className="text-md font-medium mb-3 ml-1" htmlFor="mainImage">Main Image URL</Label>
                <Input
                  id="mainImage"
                  value={tripData.mainImage}
                  onChange={e => setTripData(prev => ({ ...prev, mainImage: e.target.value }))}
                  placeholder="URL of the main trip image"
                  className="rounded-xl"
                  required
                />
              </div>

              <div>
                <Label className="text-md font-medium mb-3 ml-1" htmlFor="detailedOverview">Detailed Overview <span className="text-gray-500 text-sm">(optional)</span></Label>
                <textarea
                  id="detailedOverview"
                  value={tripData.detailedOverview}
                  onChange={e => setTripData(prev => ({ ...prev, detailedOverview: e.target.value }))}
                  placeholder="This carefully curated journey takes you through the heart of Japan, blending ancient traditions with modern experiences. You'll explore historic temples, participate in traditional tea ceremonies, and discover the vibrant food scene. The itinerary includes stays in both luxury hotels and authentic ryokans, offering a perfect balance of comfort and cultural immersion. Suitable for first-time visitors to Japan who want to experience the country's highlights while enjoying premium accommodations and expert-guided tours."
                  className="w-full p-2 border rounded-xl min-h-[150px]"
                />
              </div>

              <div>
                <Label className="text-md font-medium mb-3 ml-1" htmlFor="length">Number of Days</Label>
                <Input
                  id="length"
                  type="number"
                  min="1"
                  value={tripData.length}
                  onChange={e => setTripData(prev => ({ ...prev, length: parseInt(e.target.value) }))}
                  className="rounded-xl"
                  required
                />
              </div>

              <div>
                <Label className="text-md font-medium mb-3 ml-1" htmlFor="countries">Countries</Label>
                <div className="space-y-2">
                  {tripData.countries.map((country, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={country}
                        onChange={e => {
                          const newCountries = [...tripData.countries]
                          newCountries[index] = e.target.value
                          setTripData(prev => ({ ...prev, countries: newCountries }))
                        }}
                        placeholder="Japan"
                        className="rounded-xl"
                        required
                      />
                      {index === tripData.countries.length - 1 ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setTripData(prev => ({ 
                            ...prev, 
                            countries: [...prev.countries, ''] 
                          }))}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newCountries = tripData.countries.filter((_, i) => i !== index)
                            setTripData(prev => ({ ...prev, countries: newCountries }))
                          }}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="submit">
                  Next: Plan Days
                </Button>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={handleDayPlanningSubmit} className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Day Planning</h2>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={tripData.days.map(day => day.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Accordion type="multiple" className="space-y-4">
                    {tripData.days.map((day) => (
                      <SortableDay
                        key={day.id}
                        day={day}
                        onUpdate={(updates) => updateDay(day.id, updates)}
                        onRemoveActivity={(activityId) => removeActivity(day.id, activityId)}
                        onAddActivity={() => addActivity(day.id)}
                        onRemoveDay={() => removeDay(day.id)}
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
                      const newDayId = (tripData.days.length + 1).toString();
                      setTripData(prev => ({
                        ...prev,
                        length: prev.length + 1,
                        days: [...prev.days, { ...INITIAL_DAY, id: newDayId }]
                      }))
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
                <Button type="submit">
                  Next: Final Details
                </Button>
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6" onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}>
              <div>
                <h2 className="text-lg font-medium mb-3 ml-1">Categories <span className="text-gray-500 text-sm">(select up to 3)</span></h2>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full">
                  {itineraryTags.map((category) => {
                    const isSelected = tripData.categories.includes(category.name)
                    const Icon = category.icon
                    return (
                      <label key={category.name} className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleCategory(category.name);
                          }}
                          className={`flex justify-center items-center gap-2 px-4 py-6 rounded-xl border hover:border-black transition-all duration-200 w-full group ${isSelected ? "ring-1 ring-black border-black border-3 bg-gray-100" : "border-gray-200 border-1 bg-white"}`}
                        >
                          <category.icon className="w-5 h-5 text-gray-700" />
                          <span className="text-gray-900 font-medium">{category.name}</span>
                        </button>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Notes</h2>
                    <p className="text-sm text-gray-600">Add important notes about your trip</p>
                  </div>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const newNoteId = (tripData.notes.length + 1).toString();
                      setTripData(prev => ({
                        ...prev,
                        notes: [...prev.notes, { id: newNoteId, title: '', content: '' }]
                      }))
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Note
                  </Button>
                </div>

                <div className="space-y-4">
                  {tripData.notes.map((note) => (
                    <div key={note.id} className="bg-white rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          <div>
                            <Label className="text-[16px] font-medium mb-3 ml-1">Title</Label>
                            <Input
                              value={note.title}
                              onChange={(e) => updateNote(note.id, { title: e.target.value })}
                              placeholder="Note title"
                              className="mb-2 rounded-xl"
                            />
                          </div>
                          <div>
                            <Label className="text-[16px] font-medium mb-3 ml-1">Content</Label>
                            <textarea
                              value={note.content}
                              onChange={(e) => updateNote(note.id, { content: e.target.value })}
                              placeholder="Write your note here..."
                              className="w-full min-h-[100px] p-2 border rounded-xl"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNote(note.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {tripData.notes.length === 0 && (
                    <div className="text-center py-8 bg-white rounded-lg border">
                      <PenSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">No notes yet. Click "Add Note" to create one.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                  Previous
                </Button>
                <Button type="submit">
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