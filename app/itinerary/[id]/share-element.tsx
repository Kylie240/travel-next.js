"use client"

import React, { useState, useEffect } from 'react'
import { Share, Copy, Mail, MessageCircle, Check } from 'lucide-react'
import { toast } from 'sonner'
import * as Popover from '@radix-ui/react-popover'
import { FaFacebook, FaWhatsapp } from 'react-icons/fa'
import { FaXTwitter } from "react-icons/fa6";

const ShareElement = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [canUseNativeShare, setCanUseNativeShare] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    // Set current URL only on client side
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href)
      
      // Check if native share is available (typically on mobile devices)
      setCanUseNativeShare(
        typeof navigator !== 'undefined' && 
        navigator.share !== undefined &&
        window.innerWidth < 1028
      )
    }
  }, [])

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: document.title || 'Check out this itinerary on Journli',
        text: 'I thought you might like this travel itinerary!',
        url: currentUrl,
      })
    } catch (error) {
      // User cancelled or share failed
      if (error instanceof Error && error.name !== 'AbortError') {
        // Fallback to copying link if share fails
        handleCopyLink()
      }
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl)
    setCopied(true)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmailShare = () => {
    const subject = 'Check out this itinerary'
    const body = `I thought you might like this travel itinerary: ${currentUrl}`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
    setIsOpen(false)
  }

  const handleWhatsAppShare = () => {
    const text = `Check out this travel itinerary: ${currentUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    setIsOpen(false)
  }

  const handleMessengerShare = () => {
    window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(currentUrl)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(currentUrl)}`, '_blank')
    setIsOpen(false)
  }

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  const handleTwitterShare = () => {
    const text = 'Check out this amazing travel itinerary!'
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  const handleSMSShare = () => {
    const text = `Check out this travel itinerary: ${currentUrl}`
    window.open(`sms:?body=${encodeURIComponent(text)}`)
    setIsOpen(false)
  }

  // If mobile and native share is available, use native share
  if (canUseNativeShare) {
    return (
      <button 
        onClick={handleNativeShare}
        className="cursor-pointer hover:bg-gray-100 h-10 w-10 rounded-lg p-2 flex items-center justify-center"
      >
        <Share size={24} />
      </button>
    )
  }

  // Otherwise, show the popover menu (desktop)
  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button className="cursor-pointer hover:bg-gray-100 h-10 w-10 rounded-lg p-2 flex items-center justify-center">
          <Share size={24} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-white rounded-2xl shadow-2xl p-6 w-[380px] z-[10000] border border-gray-200"
          sideOffset={8}
          align="end"
        >
          <div className="space-y-4">
            <h3 className="text-xl ml-2 font-semibold text-gray-900">Share this itinerary</h3>
            
            {/* Copy Link Section */}
            <div className="pb-4 border-b border-gray-200">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} className="text-gray-700" />}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {copied ? 'Link copied!' : 'Copy link'}
                  </span>
                </div>
              </button>
            </div>

            {/* Share Options Grid */}
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={handleEmailShare}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="p-3 bg-gray-100 rounded-full">
                  <Mail size={24} className="text-gray-700" />
                </div>
                <span className="text-xs font-medium text-gray-700">Email</span>
              </button>

              <button
                onClick={handleSMSShare}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="p-3 bg-gray-100 rounded-full">
                  <MessageCircle size={24} className="text-gray-700" />
                </div>
                <span className="text-xs font-medium text-gray-700">Messages</span>
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="p-3 bg-gray-100 rounded-full">
                  <FaWhatsapp size={24} className="text-green-600" />
                </div>
                <span className="text-xs font-medium text-gray-700">WhatsApp</span>
              </button>

              <button
                onClick={handleMessengerShare}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="p-3 bg-gray-100 rounded-full">
                  <MessageCircle size={24} className="text-blue-600" />
                </div>
                <span className="text-xs font-medium text-gray-700">Messenger</span>
              </button>

              <button
                onClick={handleFacebookShare}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="p-3 bg-gray-100 rounded-full">
                  <FaFacebook size={24} className="text-blue-600" />
                </div>
                <span className="text-xs font-medium text-gray-700">Facebook</span>
              </button>

              <button
                onClick={handleTwitterShare}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="p-3 bg-gray-100 rounded-full">
                  <FaXTwitter size={24} className="text-blue-400" />
                </div>
                <span className="text-xs font-medium text-gray-700">Twitter</span>
              </button>
            </div>
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default ShareElement