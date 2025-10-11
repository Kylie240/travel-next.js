"use client"

import { useState } from 'react'

interface BioSectionProps {
  bio: string
}

export default function BioSection({ bio }: BioSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Check if bio is long enough to need truncation (roughly 2 lines worth of text)
  const needsTruncation = bio && bio.length > 100

  return (
    <div>
      <p className={`text-sm md:text-md ${!isExpanded && needsTruncation ? 'line-clamp-2 md:line-clamp-none' : ''}`}>
        {bio}
      </p>
      {needsTruncation && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium mt-1 md:hidden"
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  )
}

