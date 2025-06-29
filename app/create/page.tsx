"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ChevronRight, ChevronLeft, Plus, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

// Form validation schema
const activitySchema = z.object({
  time: z.string().min(1, "Time is required"),
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Type is required"),
  details: z.string().min(1, "Details are required"),
  location: z.string().min(1, "Location is required"),
})

const daySchema = z.object({
  title: z.string().min(1, "Day title is required"),
  description: z.string().min(1, "Day description is required"),
  activities: z.array(activitySchema).min(1, "At least one activity is required"),
  accommodation: z.object({
    name: z.string().min(1, "Accommodation name is required"),
    type: z.string().min(1, "Accommodation type is required"),
    location: z.string().min(1, "Accommodation location is required"),
  }),
  transport: z.object({
    type: z.string().min(1, "Transport type is required"),
    details: z.string().min(1, "Transport details are required"),
  }),
})

const itinerarySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  duration: z.number().min(1, "Duration must be at least 1 day"),
  destinations: z.array(z.string()).min(1, "At least one destination is required"),
  price: z.number().min(0, "Price must be a positive number"),
  schedule: z.array(daySchema),
})

type ItineraryFormData = z.infer<typeof itinerarySchema>

const steps = [
  { id: 1, name: "Basic Info" },
  { id: 2, name: "Schedule" },
  { id: 3, name: "Media" },
  { id: 4, name: "Review" },
]

export default function CreateItineraryPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const { toast } = useToast()
  const form = useForm<ItineraryFormData>({
    resolver: zodResolver(itinerarySchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 1,
      destinations: [],
      price: 0,
      schedule: [
        {
          title: "",
          description: "",
          activities: [
            {
              time: "",
              title: "",
              type: "",
              details: "",
              location: "",
            },
          ],
          accommodation: {
            name: "",
            type: "",
            location: "",
          },
          transport: {
            type: "",
            details: "",
          },
        },
      ],
    },
  })

  const { fields: scheduleFields, append: appendDay, remove: removeDay } = useFieldArray({
    control: form.control,
    name: "schedule",
  })

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const onSubmit = (data: ItineraryFormData) => {
    console.log(data)
    toast({
      title: "Success!",
      description: "Your itinerary has been created.",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex-1 text-center ${
                    currentStep === step.id
                      ? "text-travel-600"
                      : currentStep > step.id
                      ? "text-gray-600"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      currentStep === step.id
                        ? "bg-travel-600 text-white"
                        : currentStep > step.id
                        ? "bg-gray-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {step.id}
                  </div>
                  <div className="text-sm">{step.name}</div>
                </div>
              ))}
            </div>
            <div className="relative mt-2">
              <div className="absolute left-0 top-1/2 h-0.5 w-full bg-gray-200" />
              <div
                className="absolute left-0 top-1/2 h-0.5 bg-travel-600 transition-all"
                style={{
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Form Steps */}
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-6 rounded-lg shadow-sm"
                >
                  <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        {...form.register("title")}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-travel-600"
                        placeholder="Enter itinerary title"
                      />
                      {form.formState.errors.title && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.title.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        {...form.register("description")}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-travel-600"
                        rows={4}
                        placeholder="Describe your itinerary"
                      />
                      {form.formState.errors.description && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.description.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Duration (days)
                        </label>
                        <input
                          type="number"
                          {...form.register("duration", { valueAsNumber: true })}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-travel-600"
                          min={1}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Price
                        </label>
                        <input
                          type="number"
                          {...form.register("price", { valueAsNumber: true })}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-travel-600"
                          min={0}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-6 rounded-lg shadow-sm"
                >
                  <h2 className="text-2xl font-bold mb-6">Daily Schedule</h2>
                  <div className="space-y-6">
                    {scheduleFields.map((field, dayIndex) => (
                      <div key={field.id} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Day {dayIndex + 1}</h3>
                          {scheduleFields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeDay(dayIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <input
                            type="text"
                            {...form.register(`schedule.${dayIndex}.title`)}
                            className="w-full p-2 border rounded"
                            placeholder="Day title"
                          />
                          <textarea
                            {...form.register(`schedule.${dayIndex}.description`)}
                            className="w-full p-2 border rounded"
                            placeholder="Day description"
                            rows={2}
                          />

                          {/* Activities */}
                          <div>
                            <h4 className="font-medium mb-2">Activities</h4>
                            {/* Add activity fields here */}
                          </div>

                          {/* Accommodation */}
                          <div>
                            <h4 className="font-medium mb-2">Accommodation</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <input
                                type="text"
                                {...form.register(
                                  `schedule.${dayIndex}.accommodation.name`
                                )}
                                className="w-full p-2 border rounded"
                                placeholder="Hotel name"
                              />
                              <input
                                type="text"
                                {...form.register(
                                  `schedule.${dayIndex}.accommodation.location`
                                )}
                                className="w-full p-2 border rounded"
                                placeholder="Location"
                              />
                            </div>
                          </div>

                          {/* Transport */}
                          <div>
                            <h4 className="font-medium mb-2">Transport</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <input
                                type="text"
                                {...form.register(`schedule.${dayIndex}.transport.type`)}
                                className="w-full p-2 border rounded"
                                placeholder="Transport type"
                              />
                              <input
                                type="text"
                                {...form.register(
                                  `schedule.${dayIndex}.transport.details`
                                )}
                                className="w-full p-2 border rounded"
                                placeholder="Details"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        appendDay({
                          title: "",
                          description: "",
                          activities: [],
                          accommodation: { name: "", type: "", location: "" },
                          transport: { type: "", details: "" },
                        })
                      }
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Day
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-6 rounded-lg shadow-sm"
                >
                  <h2 className="text-2xl font-bold mb-6">Media</h2>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Drag and drop images here, or click to select files
                      </p>
                      <input type="file" className="hidden" multiple accept="image/*" />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-6 rounded-lg shadow-sm"
                >
                  <h2 className="text-2xl font-bold mb-6">Review</h2>
                  {/* Add review content */}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-8 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              {currentStep === steps.length ? (
                <Button type="submit">
                  Create Itinerary
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 