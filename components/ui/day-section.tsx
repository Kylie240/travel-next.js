"use client"

import { Circle, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { Activity } from "@/types/Activity"
import { Accommodation } from "@/types/Accommodation"
import { Note } from "@/types/Note"

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
              <Circle fill="currentColor" size={25} />
            ) : (
              <Circle strokeWidth={4} size={25} />
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
          {/* Rest of your component */}
        </motion.div>
      </div>
    </div>
  );
}; 