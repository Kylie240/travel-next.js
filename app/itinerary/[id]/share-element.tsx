"use client"

import React from 'react'
import { Share } from 'lucide-react'
import { toast } from 'sonner'

const ShareElement = () => {
  return (
    <Share size={30} className="cursor-pointer hover:bg-gray-100 h-10 w-10 rounded-lg p-2" onClick={() => {navigator.clipboard.writeText(window.location.href); toast.success('Copied to clipboard')}} />
  )
}

export default ShareElement