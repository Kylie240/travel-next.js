import React from 'react'
import { Globe2 } from 'lucide-react'
import { IoDocumentOutline } from "react-icons/io5";
import { GoPeople } from "react-icons/go";
import { GrAppsRounded } from "react-icons/gr";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white py-6 md:py-10 lg:py-16 mb-12">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-6 md:mb-10 lg:mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">Journli</h1>
          <p className="text-md md:text-lg lg:text-xl text-gray-600">Revolutionizing the way travelers plan and share their adventures</p>
        </div>

        {/* Our Story Section */}
        <section className="mb-16">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2 md:mb-6">Our Story</h2>
          <div className="prose prose-lg text-gray-600 text-sm sm:text-md md:text-ld">
            <p className="mb-4">
              Journli started as a passion project of our founder, a web developer with an appreciation for traveling. We recognized that while there's abundant travel information available online and accross different platforms, 
              there was no centralized platform for travelers to create, share, and discover detailed, personalized 
              itineraries.
            </p>
            <p>
              Our platform was built by travelers, for travelers, with the mission of making travel planning 
              collaborative, intuitive, and enjoyable. We believe that every journey tells a story, and every 
              traveler has unique insights worth sharing.
            </p>
          </div>
        </section>

        {/* Future Features Section */}
        <section className="mb-16">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2 md:mb-6">Coming Soon</h2>
          <p className="text-gray-600 mb-6 text-sm md:text-md">While we are currently in beta, we are working on the following features to make your travel planning experience even better:</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-500 border-1 p-6 rounded-lg">
              <h3 className="text-sm md:text-lg lg:text-xl font-semibold mb-3 items-center flex gap-2"><GoPeople /> Collaborative Editing</h3>
              <p className="text-gray-600 text-sm md:text-md">
                Collaborate with others on an itinerary and edit it together.
              </p>
            </div>
            <div className="border border-gray-500 border-1 p-6 rounded-lg">
              <h3 className="text-sm md:text-lg lg:text-xl font-semibold mb-3 items-center flex gap-2"><Globe2 strokeWidth={1} /> Explore Page</h3>
              <p className="text-gray-600 text-sm md:text-md">
                Explore itineraries from other travelers and get inspired.
              </p>
            </div>
            <div className="border border-gray-500 border-1 p-6 rounded-lg">
              <h3 className="text-sm md:text-lg lg:text-xl font-semibold mb-3 items-center flex gap-2"><IoDocumentOutline /> PDF Exports</h3>
              <p className="text-gray-600 text-sm md:text-md">
                Export your itineraries to PDF format, making them easily accessible offline on any device.
              </p>
            </div>
            <div className="border border-gray-500 border-1 p-6 rounded-lg">
              <h3 className="text-sm md:text-lg lg:text-xl font-semibold mb-3 items-center flex gap-2"><GrAppsRounded /> Mobile App</h3>
              <p className="text-gray-600 text-sm md:text-md"> 
                Access your itineraries offline with our upcoming mobile app.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2 md:mb-6">Get in Touch</h2>
          <div className="prose prose-lg text-gray-600 mb-6 text-sm sm:text-md">
            <p>
              We love hearing from our community! Whether you have suggestions, questions, or just want to share 
              your travel stories, we're here to listen.
            </p>
          </div>
          <div className="space-y-4 text-sm md:text-md">
            <div className="flex items-center">
              <span className="font-medium text-gray-900 w-24">Email:</span>
              <a href="mailto:contact@journli.com" className="text-blue-600 hover:text-blue-800">
                info@journli.com
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AboutPage