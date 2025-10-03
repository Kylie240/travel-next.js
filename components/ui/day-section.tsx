"use client"

import React from 'react'
import { Circle, MapPin, ChevronDown, Link, Hotel, Caravan } from "lucide-react"
import { motion } from "framer-motion"
import { activityTagsMap } from "@/lib/constants/tags"
import { FiArrowUpRight } from "react-icons/fi";
import { FaCampground } from "react-icons/fa6";
import { MdOutlineDirectionsBoat } from "react-icons/md";
import { MdOutlineHotel } from "react-icons/md";

const formatTime = (time: string | null | undefined) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const formattedHours = hours % 12 || 12
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`
}
import { Day } from "@/types/Day"

export interface DaySectionProps {
  day: Day;
  isActive: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

export const DaySection = ({ day, isActive, onToggle, onClose }: DaySectionProps) => {
  return (
   <div>
      <div className="relative border-black border-l-[.18rem] pb-4 pl-4 mr-2">
        <div className="absolute -left-[.83rem] bg-white py-4">
          <button onClick={onToggle} className="bg-transparent border-none p-0">
            {day.id === 1 && !isActive ? (
              <MapPin strokeWidth={3} size={25} className="-left-[.2rem] relative"/>
            ) : day.id === 1 && isActive ? (
              <MapPin fill="currentColor" size={25} className="-left-[.2rem] relative"/>
            ) : isActive ? (
              <Circle fill="currentColor" size={18} />
            ) : (
              <Circle strokeWidth={4} size={18} />
            )}
          </button>
        </div>  
        <button 
          className={`w-full relative inset-x-3 h-[120px] md:h-[150px] top-4 p-8 flex items-center rounded-2xl cursor-pointer overflow-hidden ${(day.image !== null && day.image !== '') ? 'shadow-lg' : ''}`} 
          onClick={onToggle}
          style={{
            backgroundImage: `url(${day.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {day.image && 
            <div className="absolute z-0 inset-0 bg-black/30"></div>
          }
        </button>
        <button 
          className={`absolute top-[50px] md:top-[70px] cursor-pointer left-[60px] z-[4] text-left bg-transparent border-none ${day.image ? 'text-white' : 'text-gray-700'}`} 
          onClick={onToggle}
        >
          <h2 className={`text-xl md:text-2xl ${day.image ? 'font-bold' : 'font-semibold'}`}>{day.title}</h2>
          <p className={`text-xs md:text-sm lg:text-md text-whte/80 ${day.image ? 'font-normal' : 'font-thin'}`}>{day.cityName}, {day.countryName}</p>
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
          className="overflow-hidden relative left-4"
        >
          <div className="mt-8 space-y-6">
            <p className={`text-sm md:text-md pl-2 ${day.image ? 'font-medium' : 'font-normal'}`}>{day.description}</p>
            {day.activities.map((activity, index) => (
              <div className="relative">
                <div className="absolute z-[5] bg-white flex flex-col justify-center items-center p-2 gap-2" style={{ left: '-63px', top: '7px' }}>
                  {activityTagsMap.find(tag => tag.id === activity.type)?.icon && (
                    React.createElement(activityTagsMap.find(tag => tag.id === activity.type)!.icon)
                  )}
                  <p className="text-sm text-gray-500">{formatTime(activity.time)}</p>
                </div>
                <motion.div
                  key={activity.id || index}
                  initial={false}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div 
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => {
                      // Toggle activity visibility
                      const element = document.getElementById(`activity-${day.id}-${index}`);
                      if (element) {
                        element.style.display = element.style.display === 'none' ? 'block' : 'none';
                      }
                    }}
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{activity.title}</h3>
                    </div>
                    <motion.button 
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      animate={{ rotate: document.getElementById(`activity-${day.id}-${index}`)?.style.display === 'none' ? 0 : 180 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    </motion.button>
                  </div>
                  
                  <div id={`activity-${day.id}-${index}`} className="mt-4" style={{ display: 'none' }}>
                    {activity.description && (
                      <p className="text-gray-600 mb-3">{activity.description}</p>
                    )}
                    {activity.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{activity.location}</span>
                      </div>
                    )}
                    {activity.duration && (
                      <p className="text-sm text-gray-500 mt-1">Duration: {activity.duration} minutes</p>
                    )}
                    {activity.link && (
                      <div className="flex mt-4 w-full items-center text-sm cursor-pointer text-gray-500 border p-3 rounded-xl shadow-sm hover:shadow-md"
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
                </motion.div>
              </div>
            ))}
            
            {day.accommodation?.name && (
              <div
              key={day.id}
              className="bg-white rounded-xl flex items-start p-4 shadow-sm gap-4 cursor-pointer"
              onClick={() => {
                window.open(day.accommodation.link, '_blank');
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
                  <h3 className="text-lg font-medium">Accommodation</h3>
                  <p className="text-gray-600">{day.accommodation.name}</p>
                  {day.accommodation.location && (
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{day.accommodation.location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 