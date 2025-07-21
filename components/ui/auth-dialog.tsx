"use client"

import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getIdToken
} from "firebase/auth"
import { Button } from "./button"
import { Input } from "./input"
import { useRouter } from "next/navigation"
import { auth } from "@/firebase/client"

const authSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type AuthFormData = z.infer<typeof authSchema>

export function AuthDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [authError, setAuthError] = useState("")
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema)
  })

  const setSessionCookie = async (user: any) => {
    const token = await getIdToken(user)
    // Set both cookies for compatibility
    document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Strict`
    document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Strict`
  }

  const onSubmit = async (data: AuthFormData) => {
    setAuthError("") // Clear any previous errors
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      } else {
        userCredential = await signInWithEmailAndPassword(auth, data.email, data.password)
      }
      await setSessionCookie(userCredential.user)
      setIsOpen(false)
      reset()
      router.refresh()
    } catch (error: any) {
      setAuthError(error.message.replace("Firebase: ", "").replace(/\(auth.*\)/, ""))
    }
  }

  const handleGoogleSignIn = async () => {
    setAuthError("") // Clear any previous errors
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      await setSessionCookie(result.user)
      setIsOpen(false)
      router.refresh()
    } catch (error: any) {
      setAuthError(error.message.replace("Firebase: ", "").replace(/\(auth.*\)/, ""))
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Button
          className="bg-white text-black hover:bg-white/90"
        >
          Sign In
        </Button>
      </Dialog.Trigger>
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
            <div>
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
            {authError && (
              <p className="text-sm text-red-500">{authError}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
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
              onClick={() => setIsSignUp(!isSignUp)}
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
    </Dialog.Root>
  )
} 