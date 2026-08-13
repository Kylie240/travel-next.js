"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

type LeaveToStripeDialogProps = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onSaveAndContinue: () => void
  onLeaveWithoutSaving: () => void
  saveLabel: string
  isSaving: boolean
}

export function LeaveToStripeDialog({
  isOpen,
  setIsOpen,
  onSaveAndContinue,
  onLeaveWithoutSaving,
  saveLabel,
  isSaving,
}: LeaveToStripeDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9999]" />
        <Dialog.Content
          className="fixed left-[50%] top-[50%] max-h-[90vh] w-[90vw] max-w-[440px] translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-8 shadow-xl z-[10000]"
          onInteractOutside={(e) => {
            if (isSaving) e.preventDefault()
          }}
        >
          <Dialog.Title className="text-xl font-semibold text-gray-900 mb-2">
            Save your itinerary first?
          </Dialog.Title>
          <Dialog.Description className="text-gray-600 mb-6">
            You&apos;re leaving the create page to connect Stripe. Save or update
            this itinerary so you don&apos;t lose your work.
          </Dialog.Description>

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              onClick={onSaveAndContinue}
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : saveLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onLeaveWithoutSaving}
              disabled={isSaving}
            >
              Leave without saving
            </Button>
          </div>

          <Dialog.Close
            className="absolute top-4 right-4 rounded-full p-2 hover:bg-gray-100 transition-colors"
            disabled={isSaving}
          >
            <X className="w-5 h-5 text-gray-500" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
