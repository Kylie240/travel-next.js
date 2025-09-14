"use client"

import { Circle, MapPin, ChevronDown, Eye } from "lucide-react"
import { motion } from "framer-motion"
import { Activity } from "@/types/Activity"
import { Accommodation } from "@/types/Accommodation"
import { Note } from "@/types/Note"
import { activityTagsMap } from "@/lib/constants/tags"

export interface DaySectionProps {
  day: {
    day: number;
    title: string;
    description: string;
    image: string;
    activities: Activity[];
    accommodation: Accommodation[];
    notes: Note[];
  };
  isActive: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

export const DaySection = ({ day, isActive, onToggle, onClose }: DaySectionProps) => {
  return (
   <div>
      <div className="relative border-black border-l-[.2rem] pb-4 pl-4 ml-4 mr-2">
        <div className="absolute -left-[.83rem] bg-white py-4">
          <button onClick={onToggle} className="bg-transparent border-none p-0">
            {day.day === 1 && !isActive ? (
              <MapPin strokeWidth={3} size={30} className="-left-[.2rem] relative"/>
            ) : day.day === 1 && isActive ? (
              <MapPin fill="currentColor" size={30} className="-left-[.2rem] relative"/>
            ) : isActive ? (
              <Circle fill="currentColor" size={20} />
            ) : (
              <Circle strokeWidth={4} size={20} />
            )}
          </button>
        </div>  
        <button 
          className={`w-full relative inset-x-3 overflow-hidden h-[120px] md:h-[150px] top-4 p-8 flex items-center rounded-2xl cursor-pointer ${day.image !== '' ? 'shadow-lg' : ''}`} 
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
          <h2 className={`text-xl md:text-2xl ${day.image ? 'font-bold' : 'font-semibold'}`}>Day {day.day} : {day.title}</h2>
          <p className={`text-sm md:text-lg ${day.image ? 'font-medium' : 'font-normal'}`}>{day.description}</p>
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
          className="overflow-hidden"
        >
          <div className="mt-8 space-y-6">
            {day.activities.map((activity, index) => (
              <div className="relative">
                <div className="absolute">
                  {/* <{activityTagsMap[activity.type].icon} /> */}
                  <Eye />
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
                      const element = document.getElementById(`activity-${day.day}-${index}`);
                      if (element) {
                        element.style.display = element.style.display === 'none' ? 'block' : 'none';
                      }
                    }}
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{activity.title}</h3>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                    <motion.button 
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      animate={{ rotate: document.getElementById(`activity-${day.day}-${index}`)?.style.display === 'none' ? 0 : 180 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    </motion.button>
                  </div>
                  
                  <div id={`activity-${day.day}-${index}`} className="mt-4" style={{ display: 'none' }}>
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
                      <p className="text-sm text-gray-500 mt-1">Duration: {activity.duration}</p>
                    )}
                    {/* {activity.cost && (
                      <p className="text-sm text-gray-500 mt-1">Cost: {activity.cost}</p>
                    )} */}
                  </div>
                </motion.div>
              </div>
            ))}
            
            {/* {day.accommodation && (
              <motion.div
                key={day.id}
                initial={false}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <h3 className="text-lg font-medium">Accommodation</h3>
                <p className="text-gray-600">{day.accommodation.name}</p>
                {day.accommodation.location && (
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{day.accommodation.location}</span>
                  </div>
                )}
              </motion.div>
            )} */}
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 