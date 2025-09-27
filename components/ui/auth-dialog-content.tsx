"use client"

import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "./button"
import { Input } from "./input"
import { useRouter } from "next/navigation"
import { createClientComponentClient, Session } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

const authSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters").optional(),
})

type AuthFormData = z.infer<typeof authSchema>

export function AuthDialogContent({ isOpen, setIsOpen, isSignUp, setIsSignUp }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void, isSignUp: boolean, setIsSignUp: (isSignUp: boolean) => void }) {
  const [authError, setAuthError] = useState("")
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema)
  })

  const setSessionCookie = async (session: Session) => {
    const token = await supabase.auth.getSession();
    document.cookie = `sb-access-token=${session?.access_token}; path=/; expires=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toUTCString()}`;
    document.cookie = `sb-refresh-token=${session?.refresh_token}; path=/; expires=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toUTCString()}`;
  }

  const onSubmit = async ({ email, password, name, username }: AuthFormData) => {
    setAuthError("")
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              username
            }
          }
        })
        if (error) {
          setAuthError(error.message)
          return
        } else {
          await supabase.from('users').insert({
            name,
            username,
            email
          })
        }
        setIsOpen(false)
        reset()
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
        setIsOpen(false)
        reset()
        router.refresh()
        toast.success("Successfully signed in")
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
      setIsOpen(false)
    } catch (error: any) {
      setAuthError(error.message)
    }
  }

  const handleForgotPassword = async (email: string) => {
    const supabase = createClientComponentClient()
    console.log(email)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`
    })
    if (error) {
      setAuthError(error.message)
      return
    }
    toast.success("Password reset email sent")
    setIsOpen(false)
  }

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" />
      <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg z-[10000]">
        <Dialog.Title className="text-xl font-bold">
          {isSignUp ? "Create an account" : "Sign in to your account"}
        </Dialog.Title>
        <Dialog.Description className="mt-2 text-sm text-gray-500">
          {isSignUp 
            ? "Create an account to start creating and sharing travel itineraries"
            : "Sign in to access your account and travel itineraries"
          }
        </Dialog.Description>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        {isSignUp && (
            <>
            <div>
                <label className="pl-1 block text-sm font-medium mb-1">Name</label>
                <Input
                  type="text"
                  placeholder="Name"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>
            <div>
              <label className="pl-1 block text-sm font-medium mb-1">Username</label>
              <Input
                type="text"
                placeholder="Username"
                {...register("username")}
                className={errors.username ? "border-red-500" : ""}
              />
              </div>
            </>
          )}
          <div>
            <label className="pl-1 block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              placeholder="Email"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="pl-1 block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              placeholder="Password"
              {...register("password")}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
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
                className={errors.password ? "border-red-500" : ""}
              />
              {confirmPassword !== watch("password") && (
                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
              )}
            </div>
          )}
          <div className="flex justify-between items-center">
            <div>
              {authError && (
                <p className="text-sm text-red-500">{authError}</p>
              )}
            </div>
            {!isSignUp && (
              <div className="text-right">
                <a className="text-sm text-blue-500 hover:underline cursor-pointer" onClick={() => handleForgotPassword(watch("email"))}>Forgot password?</a>
              </div>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isSignUp && confirmPassword !== watch("password")}
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
        >
          Continue with Google
        </Button>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-500">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
          </span>
          <button
            type="button"
            className="text-blue-500 hover:underline"
            onClick={() => {setAuthError(""); setIsSignUp(!isSignUp)}}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </div>

        <Dialog.Close asChild>
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  )
}
