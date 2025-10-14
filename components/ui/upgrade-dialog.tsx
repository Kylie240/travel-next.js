"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { Button } from "./button"
import { Check, Sparkles, X } from "lucide-react"

interface UpgradeDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onUpgrade: () => void
  onSaveDraft: () => void
}

export function UpgradeDialog({ isOpen, setIsOpen, onUpgrade, onSaveDraft }: UpgradeDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[9999]" />
        <Dialog.Content 
          className="fixed left-[50%] top-[50%] max-h-[90vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white p-8 shadow-xl z-[10000] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center text-center">
            {/* Header */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <Dialog.Title className="text-2xl font-bold text-gray-900 mb-2">
              You've Reached Your Limit
            </Dialog.Title>
            
            <Dialog.Description className="text-gray-600 mb-6">
              You've created 20 public itineraries on the free plan. Upgrade to create unlimited itineraries and unlock premium features!
            </Dialog.Description>

            {/* Benefits */}
            <div className="w-full bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upgrade Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Unlimited itineraries</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Export to PDF</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Photo galleries</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Collaboration tools</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-3">
              <Button
                onClick={onUpgrade}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-6 text-base"
              >
                View Plans
              </Button>
              
              <Button
                onClick={onSaveDraft}
                variant="outline"
                className="w-full py-6 text-base"
              >
                Save as Draft
              </Button>
            </div>

            {/* Close button */}
            <Dialog.Close className="absolute top-4 right-4 rounded-full p-2 hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

