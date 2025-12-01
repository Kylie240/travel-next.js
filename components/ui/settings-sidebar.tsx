"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { ChevronLeft, X } from "lucide-react"
import { useEffect } from "react"

interface SettingsSidebarProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function SettingsSidebar({ isOpen, onClose, title, children }: SettingsSidebarProps) {
  // Prevent body scrolling and horizontal overflow when sidebar is open
  useEffect(() => {
    if (isOpen) {
      // Store original values
      const originalOverflow = document.body.style.overflow
      const originalOverflowX = document.body.style.overflowX
      const originalPaddingRight = document.body.style.paddingRight
      
      // Prevent scrolling and horizontal overflow
      document.body.style.overflow = 'hidden'
      document.body.style.overflowX = 'hidden'
      // Prevent layout shift from scrollbar
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
      
      // Cleanup function to restore original styles
      return () => {
        document.body.style.overflow = originalOverflow
        document.body.style.overflowX = originalOverflowX
        document.body.style.paddingRight = originalPaddingRight
      }
    }
  }, [isOpen])

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[9999] lg:hidden"
        />
        <Dialog.Content 
          className="fixed inset-y-0 right-0 h-screen w-full max-w-full bg-white shadow-lg z-[10000] lg:hidden px-2 sm:px-4 md:px-8 animate-in slide-in-from-right flex flex-col overflow-x-hidden"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between p-6 flex-shrink-0 min-w-0">
            <Dialog.Close asChild>
              <button
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground flex-shrink-0"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </button> 
            </Dialog.Close>
            <Dialog.Title className="text-2xl w-full pt-2 text-center font-semibold min-w-0 truncate">
              {title}
            </Dialog.Title>
          </div>
          
          <div 
            className="flex-1 overflow-y-auto overflow-x-hidden pb-32 md:pb-10 px-4 min-w-0"
            style={{ paddingBottom: 'calc(8rem + env(safe-area-inset-bottom, 0px))' }}
          >
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
} 