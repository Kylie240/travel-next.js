"use client"

import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

const ShareProfileButton = () => {
  return (
    <Button variant="outline" className='w-full' onClick={() => {
        navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard')
    }}>Share Profile</Button>
  )
}

export default ShareProfileButton