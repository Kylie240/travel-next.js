"use client"

import Image from "next/image";
import { motion } from "framer-motion";
import { Circle, Hotel, MapPin, Map, Search, Utensils, Car, ChevronUp, Footprints } from "lucide-react";

export interface DaySectionProps {
  day: {
    day: number;
    title: string;
    description: string;
    image: string;
    activities: Array<{
      time: string;
      title: string;
      type: string;
      details: string;
      location: string;
      image: string;
    }>;
    accommodation: {
      name: string;
      type: string;
      location: string;
      image: string;
    };
    transport: {
      type: string;
      details: string;
    };
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
          {day.day === 1 && !isActive ? <MapPin strokeWidth={3} size={30} className="-left-[.2rem] relative"/> 
          : day.day === 1 && isActive ? <MapPin fill="currentColor" size={30} className="-left-[.2rem] relative"/> 
          : isActive ? <Circle fill="currentColor" size={25} /> 
          : <Circle strokeWidth={4} size={25} />}
        </div>  
        { (<div className={`w-full relative inset-x-3 overflow-hidden h-[120px] md:h-[150px] top-4 p-8 flex items-center rounded-2xl cursor-pointer ${day.image !== '' ? 'shadow-lg' : ''}`} onClick={onToggle}
          style={{
              backgroundImage: `url(${day.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}>
              {day.image && 
                <div className="absolute z-0 inset-0 bg-black/30"></div>
              }
          </div>) 
        }
          <div className={`absolute top-[50px] md:top-[70px] cursor-pointer left-[60px] z-[4] ${day.image ? 'text-white' : 'text-gray-700'}`} onClick={onToggle}>
            <h2 className="font-bold text-xl md:text-2xl">Day {day.day} : {day.title}</h2>
            <p className="text-sm md:text-lg font-medium">{day.description}</p>
          </div>
        <motion.div
          initial={false}
          animate={{ height: isActive ? "auto" : "80px" }}
          className={`relative mx-6 rounded-2xl cursor-pointer ${isActive ? 'block z-[10]' : 'hidden'}`}
        >

          {isActive && (
            <div className="px-4 pb-4 pt-6">
              {onClose && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="float-right sticky top-[68px] z-[10] mb-4 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 rounded-md bg-black text-white"
                >
                  <ChevronUp />
                </button>
              )}
              <div className="clear-both"></div>
              {/* Activities */}
              <div className="space-y-4">
                {day.activities.map((activity, index) => (
                  <div key={index} className="bg-gray-50 relative rounded-lg p-4">
                    <div className="absolute flex flex-col items-center justify-center py-2 bg-white -left-[5rem] top-6">
                      {activity.type === 'food' ? (
                        <Utensils />
                      ) : activity.type === 'accommodation' ? (
                        <Hotel />
                      ) : activity.type === 'transportation' ? (
                        <Car />
                      ) : activity.type === 'sightseeing' ? (
                        <Footprints />
                      ) : activity.type === 'culture' ? (
                        <Map />
                      ) : ''}
                      <p>{activity.time}</p>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{activity.title}</h4>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{activity.details}</p>
                    <p className="text-sm text-gray-500">{activity.location}</p>
                    <div className="relative h-40 mt-2 rounded-lg overflow-hidden">
                      <Image
                        src={activity.image}
                        alt={activity.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Accommodation */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Accommodation</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                      <Image
                        src={day.accommodation.image}
                        alt={day.accommodation.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{day.accommodation.name}</p>
                      <p className="text-sm text-gray-500">{day.accommodation.type}</p>
                      <p className="text-sm text-gray-500">{day.accommodation.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transportation */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Transportation</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium">{day.transport.type}</p>
                  <p className="text-sm text-gray-500">{day.transport.details}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}; 