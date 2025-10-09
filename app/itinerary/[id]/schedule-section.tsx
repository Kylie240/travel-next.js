"use client"

import { DaySection } from '@/components/ui/day-section'
import { ChevronUp, Minus, Plus } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import { Day } from '@/types/Day'
import { Note } from '@/types/Note'
import NoteSection from './note-section'
import { incrementItineraryViewCount } from '@/lib/actions/itinerary.actions'
import { itinerary } from './data'

const ScheduleSection = ({ schedule, notes, itineraryId, isCreator }: { schedule: Day[], notes: Note[], itineraryId: string, isCreator: boolean }) => {
  const [activeDays, setActiveDays] = useState<number[]>([])
  const [showScrollTop, setShowScrollTop] = useState(false)
  const headerRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerPosition = headerRef.current.getBoundingClientRect().top
        setShowScrollTop(headerPosition < 0 && activeDays.length > 0)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeDays.length])

  
  
  useEffect(() => {
    const key = `viewed-${itineraryId}`;
    if (!sessionStorage.getItem(key) && isCreator) {
      incrementItineraryViewCount(itineraryId);
      sessionStorage.setItem(key, "true");
    }
  }, [itineraryId, isCreator]);

  const scrollToTop = () => {
    if (headerRef.current) {
      const headerPosition = headerRef.current.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top: headerPosition, behavior: 'smooth' })
    }
  }

  const toggleDay = (dayNumber: number) => {
    setActiveDays(prev => 
      prev.includes(dayNumber) 
        ? prev.filter(d => d !== dayNumber)
        : [...prev, dayNumber]
    )
  }

  const closeAllDays = () => {
    setActiveDays([])
  }

  const openAllDays = () => {
    const allDayIds = schedule.map(day => day.id)
    setActiveDays(allDayIds)
  }

  return (
    <div className="lg:col-span-2 relative">
      <div className="flex flex-col justify-between items-center mb-6">
        <h2 ref={headerRef} className="text-lg md:text-2xl w-full text-left font-semibold">Itinerary Schedule</h2>
        <div className="sticky w-full top-20 z-50 flex flex-col items-end gap-2">
          <button 
            onClick={activeDays.length > 0 ? closeAllDays : openAllDays} 
            className="flex cursor-pointer bg-gray-800 text-white px-3 py-1 rounded-lg items-center gap-2 hover:opacity-80"
          >
            {activeDays.length > 0 ? (
              <div className='flex text-xs sm:text-sm items-center gap-1' onClick={closeAllDays}>
                Close
                <Minus strokeWidth={4} size={18} />
              </div>
            ) : (
              <div className='flex text-xs sm:text-sm items-center gap-1' onClick={openAllDays}>
                Open
                <Plus strokeWidth={4} size={18} />
              </div>
            )}
          </button>
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="flex cursor-pointer bg-gray-800 text-white px-3 py-1 rounded-lg items-center gap-2 hover:opacity-80"
            >
              <ChevronUp strokeWidth={4} size={18} />
            </button>
          )}
        </div>
        <div className="flex w-full flex-col">
          {schedule.map((day: Day, index) => (
            <div key={day.id}>
              <DaySection
                key={day.id}
                day={day}
                isActive={activeDays.includes(day.id)}
                onToggle={() => toggleDay(day.id)}
                onClose={() => toggleDay(day.id)}
                duration={schedule.length}
              />
            </div>
          ))}
        </div>
        {notes?.length > 0 && 
          <div className="block w-full px-2 md:px-6 lg:hidden mt-8">
            <p className="text-xl text-center w-full font-medium mt-8">Useful Trip Notes</p>
            <NoteSection notes={notes} />
          </div>
        }
      </div>
    </div>
  )
}

export default ScheduleSection