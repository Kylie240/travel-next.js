"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { Session } from "@supabase/supabase-js"
import { toast } from "sonner"
import Image from "next/image"
import createClient from "@/utils/supabase/client"
import { linkPurchasesToUser, requestPasswordReset } from "@/lib/actions/user.actions"
import {
  TurnstileField,
  isClientTurnstileEnabled,
} from "@/components/ui/turnstile-field"

const signUpSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters").refine(s => !s.includes(' '), 'No spaces allowed'),
})

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type SignUpFormData = z.infer<typeof signUpSchema>
type SignInFormData = z.infer<typeof signInSchema>
type AuthFormData = SignUpFormData | SignInFormData

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup')
  const [authError, setAuthError] = useState("")
  const router = useRouter()
  const supabase = createClient()
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [captchaToken, setCaptchaToken] = useState("")
  const [captchaKey, setCaptchaKey] = useState(0)

  const turnstileEnabled = isClientTurnstileEnabled()

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema)
  })

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema)
  })

  const currentForm = isSignUp ? signUpForm : signInForm
  const { handleSubmit, formState: { isSubmitting } } = currentForm

  const resetCaptcha = () => {
    setCaptchaToken("")
    setCaptchaKey((k) => k + 1)
  }

  const setSessionCookie = async (session: Session) => {
    document.cookie = `sb-access-token=${session?.access_token}; path=/; expires=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toUTCString()}`;
    document.cookie = `sb-refresh-token=${session?.refresh_token}; path=/; expires=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toUTCString()}`;
  }

  const onSubmit = async (data: AuthFormData) => {
    const { email, password } = data
    const name = 'name' in data ? data.name : undefined
    const username = 'username' in data ? data.username : undefined
    setAuthError("")
    try {
      if (turnstileEnabled && !captchaToken) {
        setAuthError("Please complete the captcha challenge.")
        return
      }

      if (isSignUp) {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            username,
            email,
            password,
            captchaToken: captchaToken || undefined,
          }),
        })
        const result = await res.json().catch(() => ({}))
        if (!res.ok) {
          setAuthError(result.error || "Signup failed. Please try again.")
          resetCaptcha()
          return
        }

        signUpForm.reset()
        signInForm.reset()
        setConfirmPassword("")
        resetCaptcha()

        if (result.needsConfirmation) {
          sessionStorage.setItem(
            "journli_pending_signup_email",
            email.trim().toLowerCase()
          )
          if (result.userId) {
            localStorage.setItem("journli_onboarding_pending", "true")
            localStorage.setItem(`journli_onboarding_pending_${result.userId}`, "true")
          }
          toast.success("Check your email to confirm your account")
          router.push("/auth/confirm-email")
          return
        }

        if (result.userId) {
          localStorage.setItem("journli_onboarding_pending", "true")
          localStorage.setItem(`journli_onboarding_pending_${result.userId}`, "true")
        }
        await linkPurchasesToUser()
        toast.success("Account created successfully")
        router.push("/?welcome=true")
      } else {
        const { error, data: userCredential } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: {
            captchaToken: captchaToken || undefined,
          },
        })
        if (error) {
          setAuthError(error.message)
          resetCaptcha()
          return
        }

        if (userCredential.user && !userCredential.user.email_confirmed_at) {
          resetCaptcha()
          router.push("/auth/confirm-email")
          return
        }

        setSessionCookie(userCredential.session)
        signUpForm.reset()
        signInForm.reset()
        resetCaptcha()
        await linkPurchasesToUser()
        toast.success("Successfully signed in")
        window.location.href = "/"
      }
    } catch (error: any) {
      setAuthError(error.message)
      resetCaptcha()
    }
  }

  const handleGoogleSignIn = async () => {
    setAuthError("")
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) {
        setAuthError(error.message)
        return
      }
    } catch (error: any) {
      setAuthError(error.message)
    }
  }

  const handleForgotPassword = async (email: string) => {
    if (!email) {
      setAuthError("Please enter your email address")
      return
    }

    try {
      if (turnstileEnabled && !captchaToken) {
        setAuthError("Please complete the captcha challenge.")
        return
      }

      const protectRes = await fetch("/api/auth/protect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captchaToken: captchaToken || undefined }),
      })
      const protectData = await protectRes.json().catch(() => ({}))
      if (!protectRes.ok) {
        setAuthError(protectData.error || "Too many attempts. Please try again later.")
        resetCaptcha()
        return
      }

      const { success, error } = await requestPasswordReset(email, window.location.origin)
      if (!success || error) {
        setAuthError(error ?? "Failed to send reset email")
        resetCaptcha()
        return
      }
      resetCaptcha()
      toast.success("Password reset email sent. Check your inbox.")
    } catch (error) {
      console.error("Forgot password error:", error)
      setAuthError("Failed to send reset email. Please try again.")
      resetCaptcha()
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col p-6 max-w-[450px] mx-auto w-full">

        <div className="flex-1 flex flex-col mt-8 md:mt-12 lg:mt-16">
          <h1 className="text-2xl text-center font-bold mb-2">
            Welcome{isSignUp ? " " : " back"} to Journli
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            {isSignUp
              ? "Join now to start creating"
              : "Log in to access your account"
            }
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="pl-1 block text-sm font-medium mb-1">Name</label>
                  <Input
                    type="text"
                    placeholder="Name"
                    {...signUpForm.register("name")}
                    className={signUpForm.formState.errors.name ? "border-red-500" : ""}
                  />
                  {signUpForm.formState.errors.name && (
                    <p className="mt-1 text-xs text-red-500">{signUpForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="pl-1 block text-sm font-medium mb-1">Username</label>
                  <Input
                    type="text"
                    placeholder="Username"
                    {...signUpForm.register("username")}
                    className={signUpForm.formState.errors.username ? "border-red-500" : ""}
                  />
                  {signUpForm.formState.errors.username && (
                    <p className="mt-1 text-xs text-red-500">{signUpForm.formState.errors.username.message}</p>
                  )}
                </div>
              </>
            )}
            <div>
              <label className="pl-1 block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                placeholder="Email"
                {...(isSignUp ? signUpForm.register("email") : signInForm.register("email"))}
                className={(isSignUp ? signUpForm.formState.errors.email : signInForm.formState.errors.email) ? "border-red-500" : ""}
              />
              {(isSignUp ? signUpForm.formState.errors.email : signInForm.formState.errors.email) && (
                <p className="mt-1 text-xs text-red-500">{(isSignUp ? signUpForm.formState.errors.email : signInForm.formState.errors.email)?.message}</p>
              )}
            </div>
            <div>
              <label className="pl-1 block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...(isSignUp ? signUpForm.register("password") : signInForm.register("password"))}
                  className={`pr-10 ${(isSignUp ? signUpForm.formState.errors.password : signInForm.formState.errors.password) ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {(isSignUp ? signUpForm.formState.errors.password : signInForm.formState.errors.password) && (
                <p className="mt-1 text-xs text-red-500">{(isSignUp ? signUpForm.formState.errors.password : signInForm.formState.errors.password)?.message}</p>
              )}
            </div>
            {isSignUp && (
              <div>
                <label className="pl-1 block text-sm font-medium mb-1">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pr-10 ${signUpForm.formState.errors.password ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword !== signUpForm.watch("password") && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                )}
              </div>
            )}

            {turnstileEnabled ? (
              <div className="flex justify-center">
                <TurnstileField
                  key={captchaKey}
                  onToken={setCaptchaToken}
                  onExpire={() => setCaptchaToken("")}
                />
              </div>
            ) : null}

            {authError && (
              <p className="text-sm text-red-500">{authError}</p>
            )}
            {!isSignUp && (
              <button
                type="button"
                className="text-sm mt-2 text-blue-500 hover:underline"
                onClick={() => handleForgotPassword(signInForm.watch("email"))}
              >
                Forgot password?
              </button>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={
                isSubmitting ||
                (isSignUp && confirmPassword !== signUpForm.watch("password")) ||
                (turnstileEnabled && !captchaToken)
              }
            >
              {isSignUp ? "Sign Up" : "Log In"}
            </Button>
          </form>

          <div className="relative my-4 flex justify-center text-sm">
            <span className="bg-white font-bold px-2 text-gray-500">OR</span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={handleGoogleSignIn}
          >
            <Image src="/images/google-oauth.png" alt="Google" width={20} height={20} className="object-contain" /> Continue with Google
          </Button>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-700">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
            </span>
            <button
              type="button"
              className="text-blue-500 hover:underline"
              onClick={() => {
                setAuthError("")
                setIsSignUp(!isSignUp)
                signUpForm.reset()
                signInForm.reset()
                setConfirmPassword("")
                resetCaptcha()
              }}
            >
              {isSignUp ? "Log in" : "Sign up"}
            </button>
          </div>
          <div className="flex justify-center mt-4">
            <span className="text-gray-500 text-xs text-center">By continuing, you agree to Journli&apos;s <a href="/legal/terms" target="_blank" className="underline">Terms of Service</a> and acknowledge that you have read our <a href="/legal/privacy" target="_blank" className="underline">Privacy Policy</a></span>
          </div>
        </div>
      </div>
    </div>
  )
}
