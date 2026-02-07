"use client"

import { useState, useEffect } from "react"
import { X, ChevronRight, ChevronLeft, MapPin, Share2, Compass, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CiPassport1 } from "react-icons/ci"
import { useRouter, useSearchParams } from "next/navigation"

interface OnboardingTourProps {
  userName?: string
}

const tourSteps = [
  {
    id: "welcome",
    title: "Welcome to Journli!",
    description: "We're excited that you've decided to join Journli. Let's take a quick tour to help you get started with your travel planning journey.",
    icon: Sparkles,
  },
  {
    id: "profile",
    title: "Complete Your Profile",
    description: "You're on your Account Settings page. Here you can customize your profile, add a photo, write a bio, and connect your social media accounts. A complete profile helps other travelers discover and connect with you.",
    icon: MapPin,
  },
  {
    id: "itineraries",
    title: "Create & Manage Itineraries",
    description: "Head to 'My Itineraries' from the menu to view, create, and manage all your travel plans. You can create detailed day-by-day itineraries with activities, accommodations, and notes.",
    icon: CiPassport1,
  },
  {
    id: "share",
    title: "Share Your Adventures",
    description: "Once you've created itineraries, visit your Profile page to see how others view your content. From there, you can share your travel experiences with friends, family, or the entire Journli community!",
    icon: Share2,
  },
  {
    id: "explore",
    title: "You're All Set!",
    description: "That's it! Start by completing your profile, then explore the platform. Don't forget to check out the Explore page to discover amazing itineraries from other travelers.",
    icon: Compass,
  },
]

export function OnboardingTour({ userName }: OnboardingTourProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if this is a new user (welcome param) and hasn't seen the tour
    const isNewUser = searchParams.get("welcome") === "true"
    const hasSeenTour = localStorage.getItem("journli_onboarding_completed")

    if (isNewUser && !hasSeenTour) {
      setIsOpen(true)
      // Clean up the URL
      router.replace("/account-settings?tab=Profile")
    }
  }, [searchParams, router])

  const handleClose = () => {
    localStorage.setItem("journli_onboarding_completed", "true")
    setIsOpen(false)
  }

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleClose()
  }

  const handleStartTour = () => {
    setCurrentStep(1)
  }

  if (!isOpen) return null

  const step = tourSteps[currentStep]
  const isWelcomeStep = currentStep === 0
  const isLastStep = currentStep === tourSteps.length - 1
  const Icon = step.icon

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Progress indicator */}
        <div className="absolute top-4 left-4 flex gap-1.5">
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-6 bg-black"
                  : index < currentStep
                  ? "w-1.5 bg-gray-400"
                  : "w-1.5 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="pt-16 pb-6 px-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              isWelcomeStep ? "bg-gradient-to-br from-gray-900 to-gray-700" : "bg-gray-100"
            }`}>
              <Icon className={`w-10 h-10 ${isWelcomeStep ? "text-white" : "text-gray-700"}`} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-3">
            {isWelcomeStep && userName ? `Welcome, ${userName}!` : step.title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-center leading-relaxed mb-8">
            {step.description}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {isWelcomeStep ? (
              <>
                <Button
                  onClick={handleStartTour}
                  className="w-full bg-black hover:bg-gray-800 text-white py-3"
                >
                  Take a Quick Tour
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="w-full text-gray-500 hover:text-gray-700"
                >
                  Skip for now
                </Button>
              </>
            ) : (
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  className={`flex-1 bg-black hover:bg-gray-800 text-white ${currentStep <= 1 ? "w-full" : ""}`}
                >
                  {isLastStep ? "Get Started" : "Next"}
                  {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Step indicator text */}
        {!isWelcomeStep && (
          <div className="bg-gray-50 px-8 py-4 text-center">
            <span className="text-sm text-gray-500">
              Step {currentStep} of {tourSteps.length - 1}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
