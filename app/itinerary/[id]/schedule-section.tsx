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

            {/* Creator Notes */}
            <NoteSection notes={notes} />
            {/* <div className="mt-12 px-4 block lg:hidden">
                <h3 className="text-lg font-semibold mb-4">Creator Notes</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="preparation">
                    <AccordionTrigger>Trip Preparation</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-2">
                        <li>Best time to visit: {schedule.bestTimeToVisit || 'Spring and Fall'}</li>
                        <li>Recommended duration: {schedule.duration}</li>
                        <li>Budget estimate: {schedule.budgetEstimate || 'Mid-range'}</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="tips">
                    <AccordionTrigger>Travel Tips</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-2">
                        {schedule.travelTips?.map((tip: string, index: number) => (
                          <li key={index}>{tip}</li>
                        )) || (
                          <>
                            <li>Book accommodations in advance</li>
                            <li>Check local weather conditions</li>
                            <li>Research local customs and etiquette</li>
                          </>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="transportation">
                    <AccordionTrigger>Transportation Guide</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-2">
                        {itinerary.transportationTips?.map((tip: string, index: number) => (
                          <li key={index}>{tip}</li>
                        )) || (
                          <>
                            <li>Consider getting a rail pass</li>
                            <li>Download local transport apps</li>
                            <li>Book airport transfers in advance</li>
                          </>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="cultural">
                    <AccordionTrigger>Cultural Insights</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-2">
                        {itinerary.culturalNotes?.map((note: string, index: number) => (
                          <li key={index}>{note}</li>
                        )) || (
                          <>
                            <li>Learn basic local phrases</li>
                            <li>Respect local customs</li>
                            <li>Try local specialties</li>
                          </>
                        )}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div> */}
          </div>
  )
}

export default ScheduleSection