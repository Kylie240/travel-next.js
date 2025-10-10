"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { ChevronLeft, X } from "lucide-react"

interface SettingsSidebarProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function SettingsSidebar({ isOpen, onClose, title, children }: SettingsSidebarProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[9999] lg:hidden md:px-8"
        />
        <Dialog.Content 
          className="fixed inset-y-0 right-0 h-screen w-full max-w-screen bg-white shadow-lg z-[10000] lg:hidden px-2 sm:px-4 md:px-8 animate-in slide-in-from-right flex flex-col"
        >
          <div className="flex items-center justify-between p-6 flex-shrink-0">
            <Dialog.Close asChild>
              <button
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </button> 
            </Dialog.Close>
            <Dialog.Title className="text-2xl w-full pt-2 text-center font-semibold">
              {title}
            </Dialog.Title>
          </div>
          
          <div className="flex-1 overflow-y-auto pb-10 px-4">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
} 