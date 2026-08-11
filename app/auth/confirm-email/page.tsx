"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import createClient from "@/utils/supabase/client"
import { toast } from "sonner"

const PENDING_EMAIL_KEY = "journli_pending_signup_email"

export default function ConfirmEmailPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? sessionStorage.getItem(PENDING_EMAIL_KEY) || ""
        : ""
    if (stored) {
      setEmail(stored)
      return
    }

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email)
    })
  }, [supabase.auth])

  const handleResend = async () => {
    setMessage("")
    const targetEmail = email.trim().toLowerCase()
    if (!targetEmail) {
      setMessage("Enter the email you used to sign up.")
      return
    }

    setIsResending(true)
    try {
      const protectRes = await fetch("/api/auth/protect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const protectData = await protectRes.json().catch(() => ({}))
      if (!protectRes.ok) {
        setMessage(protectData.error || "Too many attempts. Please try again later.")
        return
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: targetEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setMessage(error.message)
        return
      }

      sessionStorage.setItem(PENDING_EMAIL_KEY, targetEmail)
      toast.success("Confirmation email resent. Check your inbox.")
      setMessage("Confirmation email resent. Check your inbox (and spam folder).")
    } catch (error: any) {
      setMessage(error?.message || "Failed to resend confirmation email.")
    } finally {
      setIsResending(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    sessionStorage.removeItem(PENDING_EMAIL_KEY)
    router.push("/login?mode=login")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <h1 className="text-2xl font-semibold mb-4">Check your inbox</h1>
      <p className="text-gray-600 max-w-md mb-6">
        We&apos;ve sent a confirmation link to your email. Please click it to
        activate your account before signing in.
      </p>

      <div className="w-full max-w-sm mb-4 text-left">
        <label className="pl-1 block text-sm font-medium mb-1">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      {message ? (
        <p className="text-sm text-gray-700 mb-4 max-w-md">{message}</p>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          onClick={handleResend}
          disabled={isResending}
        >
          {isResending ? "Sending…" : "Resend confirmation email"}
        </Button>
        <Button type="button" variant="outline" onClick={handleSignOut}>
          Back to login
        </Button>
      </div>
    </div>
  )
}
