"use client"

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { DaySection } from '@/components/ui/day-section'
import { ChevronDown, ChevronUp } from 'lucide-react'
import React, { useState } from 'react'
import { Day } from '@/types/Day'
import { Note } from '@/types/Note'
import NoteSection from './note-section'

const ScheduleSection = ({ schedule, notes }: { schedule: Day[], notes: Note[] }) => {
const [activeDays, setActiveDays] = useState<number[]>([])
const toggleDay = (dayNumber: number) => {
    setActiveDays(prev => 
      prev.includes(dayNumber) 
        ? prev.filter(d => 
          d !== dayNumber)
        : [...prev, dayNumber]
    )
  }

  const closeAllDays = () => {
    setActiveDays([])
  }

  const openAllDays = () => {
    const days = schedule.map((day: any) => day.day)
    setActiveDays(days)
  }

  return (
    <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Itinerary Schedule</h2>
              {schedule.length > 0 ? (
                <div className="flex cursor-pointer items-center gap-2">
                Close All
                <ChevronUp size={16} />
              </div>
              ) : (
                <div onClick={openAllDays} className="flex cursor-pointer items-center gap-2">
                  Open All
                  <ChevronDown size={16} />
                </div>
              )
              }
            </div>
            <div className="flex flex-col">
              {schedule.map((day: any) => (
                <DaySection
                  key={day.day}
                  day={day}
                  isActive={activeDays.includes(day.day)}
                  onToggle={() => toggleDay(day.day)}
                  onClose={() => toggleDay(day.day)}
                />
              ))}
            </div>
            <div className="block lg:hidden mt-8">
              <p className="text-xl text-center font-medium mt-8">Useful Trip Notes</p>
              <NoteSection notes={notes} />
            </div>
          </div>
  )
}

export default ScheduleSection