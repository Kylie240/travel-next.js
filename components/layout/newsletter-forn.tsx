"use client"

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { supabase } from '@/utils/supabase/superbase-client'
import { toast } from 'sonner'


const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const NewsletterForm = () => {
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleNewsletterSubscribe = async (email: string) => {
      if (!isValidEmail(email)) {
        toast.error("Please enter a valid email address")
        return
      }
      setIsSubmitting(true)
      try {
        const { error } = await supabase.from('newsletter').insert({
          email: email.toLowerCase(),
        })
        if (error) {
          if (error.code === '23505') { // Unique constraint error
            toast.error("You're already subscribed!")
          } else {
            toast.error("Error subscribing to newsletter")
          }
        } else {
          toast.success("Successfully subscribed to newsletter")
          setEmail("")
        }
      } finally {
        setIsSubmitting(false)
      }
    }

  return (
    <div className="flex flex-col mt-6 mb-4 sm:flex-row gap-3 max-w-md mx-auto">
        <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 text-black px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
        <Button 
          onClick={() => handleNewsletterSubscribe(email)} 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </Button>
    </div>
  )
}

export default NewsletterForm