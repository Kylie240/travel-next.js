"use client"

import Image from "next/image";
import { motion } from "framer-motion";

export interface DaySectionProps {
  day: {
    day: number;
    title: string;
    description: string;
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
  onClick: () => void;
}

export const DaySection = ({ day, isActive, onClick }: DaySectionProps) => {
  return (
    <motion.div
      initial={false}
      animate={{ height: isActive ? "auto" : "80px" }}
      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4 flex items-center justify-between">
        <div>
          <h3 className="font-medium">Day {day.day}</h3>
          <p className="text-gray-600">{day.title}</p>
        </div>
        <div className="text-gray-400">
          {isActive ? "▼" : "▶"}
        </div>
      </div>

      {isActive && (
        <div className="px-4 pb-4">
          <p className="text-gray-600 mb-4">{day.description}</p>

          {/* Activities */}
          <div className="space-y-4">
            {day.activities.map((activity, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{activity.title}</h4>
                  <span className="text-sm text-gray-500">{activity.time}</span>
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
  );
}; 