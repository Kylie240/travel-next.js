"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { ReactNode } from "react"
import { AuthDialogContent } from "./auth-dialog-content"

interface AuthDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  children: ReactNode
  isSignUp: boolean
  setIsSignUp: (isSignUp: boolean) => void
}

export function AuthDialog({ isOpen, setIsOpen, children, isSignUp, setIsSignUp }: AuthDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      <AuthDialogContent isOpen={isOpen} setIsOpen={setIsOpen} isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
    </Dialog.Root>
  )
}