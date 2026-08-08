"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

function WelcomeDialogInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (searchParams.get("welcome") === "true") {
      setShowWelcome(true)
      localStorage.setItem("journli_onboarding_pending", "true")
    }
  }, [searchParams])

  const handleCloseWelcome = () => {
    setShowWelcome(false)
    router.replace("/")
  }

  if (!showWelcome) return null

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-2">Welcome to Journli</h2>
        <p className="text-gray-600 text-sm mb-5">
          Your account is ready. Explore itineraries now, and visit Settings
          anytime to complete your onboarding tour.
        </p>
        <div className="flex justify-end">
          <Button onClick={handleCloseWelcome}>Continue</Button>
        </div>
      </div>
    </div>
  )
}

export function WelcomeDialog() {
  return (
    <Suspense fallback={null}>
      <WelcomeDialogInner />
    </Suspense>
  )
}
