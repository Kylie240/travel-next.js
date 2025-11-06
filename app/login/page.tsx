"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { Session } from "@supabase/supabase-js"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"
import createClient from "@/utils/supabase/client"

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
  
  
  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema)
  })
  
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema)
  })
  
  const currentForm = isSignUp ? signUpForm : signInForm
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = currentForm

  const setSessionCookie = async (session: Session) => {
    const token = await supabase.auth.getSession();
    document.cookie = `sb-access-token=${session?.access_token}; path=/; expires=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toUTCString()}`;
    document.cookie = `sb-refresh-token=${session?.refresh_token}; path=/; expires=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toUTCString()}`;
  }

  const onSubmit = async (data: AuthFormData) => {
    const { email, password } = data
    const name = 'name' in data ? data.name : undefined
    const username = 'username' in data ? data.username : undefined
    setAuthError("")
    try {
      if (isSignUp) {
        const { error, data: { user } } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              username,
            }
          }
        })
        if (error) {
          setAuthError(error.message)
          return
        } else {
          await supabase.from('users').insert({
            id: user.id,
            name: name,
            username: username.toLowerCase(),
            email: email,
            avatar: "",
            location: "",
            bio: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          await supabase.from('users_settings').insert({
            user_id: user.id,
            is_private: false,
            email_notifications: true
          })
        }
        signUpForm.reset()
        signInForm.reset()
        toast.success("Account created successfully")
        router.push("/account-settings?tab=Profile")
      } else {
        const { error, data: userCredential } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          setAuthError(error.message)
          return
        }
        setSessionCookie(userCredential.session)
        signUpForm.reset()
        signInForm.reset()
        toast.success("Successfully signed in")
        // Use window.location for full page reload to ensure state is refreshed
        window.location.href = "/"
      }
    } catch (error: any) {
      setAuthError(error.message)
    }
  }

  const handleGoogleSignIn = async () => {
    setAuthError("") // Clear any previous errors
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
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`
    })
    if (error) {
      setAuthError(error.message)
      return
    }
    toast.success("Password reset email sent")
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
                    {...(isSignUp ? signUpForm.register("name") : {})}
                    className={isSignUp && signUpForm.formState.errors.name ? "border-red-500" : ""}
                  />
                  {isSignUp && signUpForm.formState.errors.name && (
                    <p className="mt-1 text-xs text-red-500">{signUpForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="pl-1 block text-sm font-medium mb-1">Username</label>
                  <Input
                    type="text"
                    placeholder="Username"
                    {...(isSignUp ? signUpForm.register("username") : {})}
                    className={isSignUp && signUpForm.formState.errors.username ? "border-red-500" : ""}
                  />
                  {isSignUp && signUpForm.formState.errors.username && (
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
              <Input
                type="password"
                placeholder="Password"
                {...(isSignUp ? signUpForm.register("password") : signInForm.register("password"))}
                className={(isSignUp ? signUpForm.formState.errors.password : signInForm.formState.errors.password) ? "border-red-500" : ""}
              />
              {(isSignUp ? signUpForm.formState.errors.password : signInForm.formState.errors.password) && (
                <p className="mt-1 text-xs text-red-500">{(isSignUp ? signUpForm.formState.errors.password : signInForm.formState.errors.password)?.message}</p>
              )}
            </div>
            {isSignUp && (
              <div>
                <label className="pl-1 block text-sm font-medium mb-1">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={signUpForm.formState.errors.password ? "border-red-500" : ""}
                />
                {confirmPassword !== (isSignUp ? signUpForm.watch("password") : signInForm.watch("password")) && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                )}
              </div>
            )}
            {authError && (
              <p className="text-sm text-red-500">{authError}</p>
            )}
            {!isSignUp && (
              <a className="text-sm mt-2 text-blue-500 hover:underline cursor-pointer" onClick={() => handleForgotPassword(signInForm.watch("email"))}>Forgot password?</a>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || (isSignUp && confirmPassword !== signUpForm.watch("password"))}
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
              }}
            >
              {isSignUp ? "Log in" : "Sign up"}
            </button>
          </div>
          <div className="flex justify-center mt-4">
            <span className="text-gray-500 text-xs text-center">By continuing, you agree to Journli's <a href="/legal/terms" target="_blank" className="underline">Terms of Service</a> and acknowledge that you have read our <a href="/legal/privacy" target="_blank" className="underline">Privacy Policy</a></span>
          </div>
        </div>
      </div>
    </div>
  )
}