"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { MessageSquare, Star, Mail, CheckCircle2 } from "lucide-react"
import createClient from "@/utils/supabase/client"
import { useEffect } from "react"
import { Feedback } from "@/types/Feedback"

const commonProblems = [
  "Difficulty creating or editing itineraries",
  "Issues with saving or loading data",
  "Navigation or page loading problems",
  "Performance or speed issues",
  "Confusing or unclear interface",
  "Problems with functionality",
  "Feature request",
  "Account or profile issues",
  "Problems with sharing or viewing itineraries",
  "Mobile or responsive design issues",
  "Other"
]

// Map problem strings to feedback object keys
const problemToFieldMap: Record<string, keyof Feedback> = {
  "Difficulty creating or editing itineraries": "editing",
  "Issues with saving or loading data": "saving",
  "Navigation or page loading problems": "navigation",
  "Performance or speed issues": "performance",
  "Confusing or unclear interface": "interface",
  "Problems with functionality": "functionality",
  "Feature request": "feature",
  "Account or profile issues": "account",
  "Problems with sharing or viewing itineraries": "sharing",
  "Mobile or responsive design issues": "responsiveness",
  "Other": "other"
}

export default function ShareFeedbackPage() {
  const router = useRouter()
  const supabase = createClient()
  const [feedback, setFeedback] = useState<Feedback>({
    id: "",
    user_id: "",
    editing: false,
    saving: false,
    navigation: false,
    performance: false,
    interface: false,
    functionality: false,
    feature: false,
    account: false,
    sharing: false,
    responsiveness: false,
    other: false,
    comment: "",
    rating: 0,
  })
  const [selectedProblems, setSelectedProblems] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) {
        router.push('/login?mode=login')
      }
    }
    getUser()
  }, [supabase, router])

  const handleProblemToggle = (problem: string) => {
    const field = problemToFieldMap[problem]
    if (!field) return
    
    setSelectedProblems(prev => {
      const isSelected = prev.includes(problem)
      if (isSelected) {
        setFeedback(f => ({ ...f, [field]: false }))
        return prev.filter(p => p !== problem)
      } else {
        setFeedback(f => ({ ...f, [field]: true }))
        return [...prev, problem]
      }
    })
  }

  const handleRatingClick = (starValue: number) => {
    setFeedback(f => ({ ...f, rating: starValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedProblems.length === 0 && !feedback.comment.trim()) {
      toast.error("Please select at least one problem or provide additional details")
      return
    }

    if (feedback.comment.length > 2000) {
      toast.error("Additional details must be 2000 characters or less")
      return
    }

    if (!user) {
      toast.error("Please sign in to submit feedback")
      router.push('/login?mode=login')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Combine selected problems and additional details into feedback text
      let feedbackText = ""
      if (selectedProblems.length > 0) {
        feedbackText = "Issues encountered:\n" + selectedProblems.map(p => `- ${p}`).join("\n")
      }
      if (feedback.comment.trim()) {
        feedbackText += (feedbackText ? "\n\nAdditional details:\n" : "") + feedback.comment.trim()
      }
      
      const { data, error } = await supabase.from("users_feeback").insert([
        {
          user_id: user.id,
          editing: feedback.editing,
          saving: feedback.saving,
          navigation: feedback.navigation,
          performance: feedback.performance,
          interface: feedback.interface,
          functionality: feedback.functionality,
          feature: feedback.feature,
          account: feedback.account,
          sharing: feedback.sharing,
          responsiveness: feedback.responsiveness,
          other: feedback.other,
          comment: feedback.comment,
          rating: feedback.rating || null,
        },
      ]);
    
      if (error) {
        console.error("Error inserting feedback:", error);
        throw new Error(error.message);
      }

      toast.success("Thank you for your feedback! We appreciate your input.")
      setIsSubmitted(true)
      setFeedback({
        id: "",
        user_id: "",
        editing: false,
        saving: false,
        navigation: false,
        performance: false,
        interface: false,
        functionality: false,
        feature: false,
        account: false,
        sharing: false,
        responsiveness: false,
        other: false,
        comment: "",
        rating: 0,
      })
      setSelectedProblems([])
    } catch (error: any) {
      toast.error(error.message || "Failed to submit feedback. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white py-12 md:py-16 mb-12">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-2xl">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Thank You for Your Feedback!
            </h1>
            <p className="text-md md:text-lg text-gray-600 mb-8">
              We appreciate you taking the time to share your thoughts with us. Your feedback helps us improve Journli for everyone.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8 mt-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Mail className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Need More Help?</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                If you need additional assistance or have more questions,<br /> please don't hesitate to reach out:
              </p>
              <a
                href="mailto:info@journli.com"
                className="text-base font-medium text-blue-600 hover:text-blue-700 hover:underline inline-block"
              >
                info@journli.com
              </a>
            </div>
            <div className="mt-8">
              <Button
                onClick={() => router.push('/')}
                className="bg-black text-white hover:bg-gray-800"
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12 md:py-16 mb-12">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-2xl">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-center mb-4">
            <MessageSquare className="h-12 w-12 text-gray-700" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Share Your Feedback</h1>
          <p className="text-md md:text-lg text-gray-600">
            We'd love to hear about your experience with Journli
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="space-y-6">
            {/* Rating Section */}
            <div>
              <Label className="text-base font-medium mb-3 block">How would you rate your experience? (Optional)</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        feedback.rating && star <= feedback.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Problems Checklist */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                What issues did you encounter? (Select all that apply)
              </Label>
              <div className="space-y-2 border border-gray-200 rounded-xl p-4">
                {commonProblems.map((problem) => {
                  const field = problemToFieldMap[problem]
                  const isChecked = field ? feedback[field] : false
                  
                  return (
                    <label
                      key={problem}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(isChecked)}
                        onChange={() => handleProblemToggle(problem)}
                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-2"
                      />
                      <span className="text-sm text-gray-700 flex-1">{problem}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Additional Details Text Area */}
            <div>
              <Label htmlFor="feedback" className="text-base font-medium mb-2 block">
                Additional Details (Optional)
              </Label>
              <Textarea
                id="feedback"
                value={feedback.comment}
                onChange={(e) => {
                  if (e.target.value.length <= 2000) {
                    setFeedback({ ...feedback, comment: e.target.value })
                  }
                }}
                placeholder="Please provide any additional details about your experience, suggestions for improvement, or anything else you'd like to share..."
                className="min-h-[200px] rounded-xl resize-none"
                maxLength={2000}
              />
              <p className={`text-sm mt-2 ${feedback.comment.length > 1800 ? 'text-orange-500' : 'text-gray-500'}`}>
                {feedback.comment.length} / 2000 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (selectedProblems.length === 0 && !feedback.comment.trim())}
                className="flex-1 bg-black text-white hover:bg-gray-800"
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Your feedback helps us improve Journli for everyone. Thank you for taking the time to share your thoughts!
          </p>
        </div>
      </div>
    </div>
  )
}

