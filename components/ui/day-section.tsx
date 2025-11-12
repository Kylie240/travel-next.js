"use client"

import React, { useState } from 'react'
import { Circle, MapPin, ChevronDown, Link, Hotel, Caravan, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { activityTagsMap } from "@/lib/constants/tags"
import { FiArrowUpRight } from "react-icons/fi";
import { FaCampground } from "react-icons/fa6";
import { MdOutlineDirectionsBoat } from "react-icons/md";
import { MdOutlineHotel } from "react-icons/md";

const formatTime = (time: string | null | undefined) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number)
  const formattedHours = hours
  return `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}
import { Day } from "@/types/Day"
import { GoDash } from 'react-icons/go'
import { countries } from '@/lib/constants/countries'

export interface DaySectionProps {
  day: Day;
  isActive: boolean;
  onToggle: () => void;
  onClose?: () => void;
  duration: number;
}

export const DaySection = ({ day, isActive, onToggle, onClose, duration }: DaySectionProps) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [expandedActivities, setExpandedActivities] = useState<Set<number>>(new Set())
  
  // Check if description is long enough to need truncation (roughly 4 lines worth of text)
  const needsDescriptionTruncation = day.description && day.description.length > 200

  // Check if day has any expandable content beyond title and location
  const hasExpandableContent = 
    (day.description && day.description.trim().length > 0) ||
    (day.activities && day.activities.length > 0) ||
    (day.accommodation && day.accommodation.name)
  
  const toggleActivity = (index: number) => {
    setExpandedActivities(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }
  return (
   <div>
      <div className={`relative border-black border-l-[.12rem] pl-4 mr-2 ${isActive ? 'pb-4' : ''}`}>
        <div className={`absolute -left-[.83rem] bg-white py-4 ${day.id === 1 ? 'pt-[1.2rem]' : 'top-4'}`}>
          <button 
            onClick={() => hasExpandableContent && onToggle()} 
            className={`bg-transparent border-none p-0 ${day.id !== 1 ? 'top-2' : ''} ${hasExpandableContent ? 'cursor-pointer' : 'cursor-default'}`}
            disabled={!hasExpandableContent}
          >
            {day.id === 1 && !isActive ? (
              <MapPin strokeWidth={2} size={25} className="relative"/>
            ) : day.id === 1 && isActive ? (
              <MapPin fill="currentColor" size={25} className="relative"/>
            ) : isActive ? (
              <Circle fill="currentColor" size={18} className="left-[4px] relative" />
            ) : (
              <Circle strokeWidth={3} size={18} className="left-[4px] relative" />
            )}
          </button>
        </div>
        {duration === day.id &&
          <div className="absolute -left-[.40rem] bottom-0 w-[10px] h-[.12rem] bg-black">
          </div>
        }
        <button 
          className={`w-full relative inset-x-3 top-4 flex items-center rounded-2xl overflow-hidden transition-all duration-300 ${(day.image !== null && day.image !== '') ? `shadow-lg p-8 ${isActive ? 'h-[180px] md:h-[220px]' : 'h-[100px] md:h-[130px]'}` : 'px-8 h-[80px] md:h-[100px]'} ${hasExpandableContent ? 'cursor-pointer' : 'cursor-default'}`} 
          onClick={() => hasExpandableContent && onToggle()}
          disabled={!hasExpandableContent}
          style={{
            backgroundImage: `url(${day.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className={`${day.image ? 'text-white' : 'text-gray-700 pt-2'} z-[5] text-left`}>
            <h2 className={`text-xl md:text-2xl leading-5 ${day.image ? 'font-bold' : 'font-semibold'}`}>{day.title}</h2>
            <p className={`text-xs md:text-sm lg:text-[16px] text-whte/80 ${day.image ? 'font-normal' : 'font-thin'}`}>{day.cityName}, {day.countryName}</p>
          </div>
          {day.image && 
            <div className="absolute z-0 inset-0 bg-black/30"></div>
          }
        </button>
        <motion.div
          initial={false}
          animate={{
            height: isActive ? "auto" : 0,
            opacity: isActive ? 1 : 0,
          }}
          transition={{
            duration: 0.3,
          }}
          className="relative left-4"
        >
          <div className="mt-8">
            <div className="p-2">
              <p className={`text-sm md:text-[16px] ${!isDescriptionExpanded && needsDescriptionTruncation ? 'line-clamp-4' : ''}`}>
                {day.description}
              </p>
              {needsDescriptionTruncation && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-sm underline text-gray-500 hover:text-gray-800 font-medium mt-1"
                >
                  {isDescriptionExpanded ? 'Read less' : 'Read more'}
                </button>
              )}
            </div>
            {day.activities.map((activity, index) => {
              // Check if activity has any additional information beyond title
              const hasAdditionalInfo = !!(
                activity.description ||
                activity.location ||
                activity.duration ||
                activity.link
              )

              return (
                <div key={activity.id || index} className="relative mb-2">
                  {activity?.type ? (
                    <div className="absolute z-[5] min-w-[65px] bg-white flex flex-col justify-center items-center p-2 gap-1" style={{ left: '-67px', top: `${activity?.time && activity?.time !== '' ? '14px' : '14px'}` }}>
                      {activityTagsMap.find(tag => tag.id === activity.type)?.icon && (
                        <div className="w-5 h-5">
                          {React.createElement(activityTagsMap.find(tag => tag.id === activity.type)!.icon)}
                        </div>
                      )}
                      <p className="text-xs md:text-md/80 text-gray-500 tracking-tight">{formatTime(activity?.time)}</p>
                    </div>
                  ) : (
                    <div className="absolute z-[5] min-w-[65px] bg-white flex flex-col justify-center items-center p-2 gap-1" style={{ left: '-63px', top: `${activity?.time && activity?.time !== '' ? '25px' : '25px'}` }}>
                      <div className="w-5 h-5">
                        {activity?.time && activity?.time !== '' ? (
                          <p className="text-xs md:text-md/80 text-gray-500 tracking-tight">{formatTime(activity?.time)}</p>
                        ) : (
                          <GoDash size={16} strokeWidth={2} className="text-gray-500" />
                        )}
                      </div>
                    </div>
                  )}
                  <motion.div
                    key={activity.id || index}
                    initial={false}
                    className={`bg-white rounded-xl p-4 ${hasAdditionalInfo ? 'shadow-md' : ''}`}
                  >
                    {hasAdditionalInfo ? (
                      <>
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleActivity(index)}
                        >
                          <div className="flex-1">
                            <h3 className="text-md lg:text-lg font-medium leading-5">{activity.title}</h3>
                            {activity.location && (
                              <div className="flex items-center text-sm text-gray-500">
                                {/* <MapPin className="w-4 h-4 mr-1" /> */}
                                <span>{activity.location}</span>
                              </div>
                            )}
                          </div>
                          <motion.button 
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            animate={{ rotate: expandedActivities.has(index) ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          </motion.button>
                        </div>
                        
                        {expandedActivities.has(index) && (
                        <div className="mt-4">
                          {activity.description && (
                            <p className="text-gray-600 mb-3">{activity.description}</p>
                          )}
                          {activity.duration && (
                            <div className="flex items-center gap-2">
                              <Clock size={16} strokeWidth={2} className="text-gray-500" />
                              <p className="text-sm text-gray-500 mt-1">Duration: {activity.duration} minutes</p>
                            </div>
                          )}
                          {activity.link && (
                            <div className="flex mt-4 w-full items-center text-sm cursor-pointer hover:bg-gray-100/50 text-gray-500 border p-2 rounded-xl shadow-md"
                            onClick={() => {
                              window.open(activity.link, '_blank');
                            }}>
                              <div className="rounded-lg bg-gray-800 p-2">
                                <FiArrowUpRight size={20} strokeWidth={4} className="text-white" />
                              </div>
                              <span className="ml-2">Activity Link</span>
                            </div>
                          )}
                        </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-between h-[52px]">
                        <div className="flex-1">
                          <h3 className="text-md lg:text-lg font-medium leading-5">{activity.title}</h3>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              )
            })}
            
            {day.accommodation?.name && (
            <>
              <h3 className="text-md mt-6 lg:text-lg pl-2">Accommodation</h3>
              <div
              key={day.id}
              className={`bg-white rounded-xl flex items-start p-4 gap-4 mt-2 ${day.accommodation.link ? 'shadow-md cursor-pointer' : ''}`}
              onClick={() => {
                if (day.accommodation.link) {
                  window.open(day.accommodation.link, '_blank');
                }
              }}
              >
                <div className="rounded-lg border border-gray-200 p-3">
                  {day.accommodation.type === 'Boat' ? (
                    <MdOutlineDirectionsBoat size={25} strokeWidth={2} className="text-gray-800" />
                  ) : day.accommodation.type === 'Hostel' ? (
                    <MdOutlineHotel size={25} strokeWidth={2} className="text-gray-800" />
                  ) : day.accommodation.type === 'Camper/RV' ? (
                    <Caravan size={25} strokeWidth={2} className="text-gray-800" />
                  ) : day.accommodation.type === 'Camping' ? (
                    <FaCampground size={25} strokeWidth={2} className="text-gray-800" />
                  ) : <Hotel size={25} strokeWidth={2} className="text-gray-800" />
                  }
                </div>
                <div>
                  <p className="text-gray-600 text-md font-medium leading-5">{day.accommodation.name}</p>
                  {day.accommodation.location && (
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      {/* <MapPin className="w-4 h-4 mr-1" /> */}
                      <span>{day.accommodation.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 