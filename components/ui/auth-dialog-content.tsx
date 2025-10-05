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

export function AuthDialogContent({ isOpen, setIsOpen, isSignUp, setIsSignUp }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void, isSignUp: boolean, setIsSignUp: (isSignUp: boolean) => void }) {
  const [authError, setAuthError] = useState("")
  const router = useRouter()
  const supabase = createClientComponentClient()
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
              username
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
            username: username,
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
        setIsOpen(false)
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
        setIsOpen(false)
        signUpForm.reset()
        signInForm.reset()
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
      <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[90vh] w-[80vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 md:p-12 shadow-lg z-[10000]">
        <Dialog.Title className="text-2xl text-center font-bold">
          Welcome{isSignUp ? " " : " back"} to Journli
        </Dialog.Title>
        <Dialog.Description className="mt-2 text-sm text-gray-500 text-center">
          {isSignUp 
            ? "Join now to start creating"
            : "Sign in to access your account"
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
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        <div className="relative my-2 flex justify-center text-sm">
          <span className="bg-white font-bold px-2 text-gray-500">OR</span>
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
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </div>
        <div className="flex justify-center mt-2">
          <span className="text-gray-500 text-xs text-center">By continuing, you agree to Journli's <a href="legal/terms" target="_blank" className="underline">Terms of Service</a> and acknowledge that you have read our <a href="legal/privacy" target="_blank" className="underline">Privacy Policy</a></span>
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
