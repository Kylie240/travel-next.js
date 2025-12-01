import React from 'react'
import { Globe2 } from 'lucide-react'
import { IoDocumentOutline } from "react-icons/io5";
import { GoPeople } from "react-icons/go";
import { GrAppsRounded } from "react-icons/gr";
import { CiCalendarDate } from 'react-icons/ci';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white py-6 md:py-10 lg:py-16 mb-12">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-6 md:mb-10 lg:mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">Journli</h1>
          <p className="text-md md:text-lg lg:text-xl text-gray-600">Where travelers inspire travelers</p>
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
              Our platform was built by a traveler, for travelers, with the mission of making travel sharing 
              simple, intuitive, and enjoyable. We believe that every journey tells a story, and every 
              traveler has unique insights worth sharing.
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-16">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2 md:mb-6">How It Works</h2>
          <div className="prose prose-lg text-gray-600 text-sm sm:text-md md:text-ld">
            <p className="mb-4">
              Our itinerary builder breaks down creating an itinerary into easy to follow steps, where you can provide as little or as much detail as you want.
              Once you're done creating your itinerary, you can publish it to share with others via link.
            </p>
            <p className="mb-4">
              <a href="https://www.journli.com/profile/journli" target='_blank' className="text-blue-600 hover:text-blue-800">Click here</a> to view a sample of what your profile and itineraries will look like.
            </p>
          </div>
        </section>

        {/* Future Features Section */}
        <section className="mb-16">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2 md:mb-6">Coming Soon</h2>
          <p className="text-gray-600 mb-6 text-sm md:text-md">While we are currently in beta, we are working on the following features to make your travel planning experience even better:</p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border border-gray-500 border-1 p-6 rounded-lg">
              <h3 className="text-sm md:text-lg lg:text-xl font-semibold mb-3 items-center flex gap-2"><GoPeople /> Collaborative Editing</h3>
              <p className="text-gray-600 text-sm md:text-md">
                Collaborate with others on an itinerary and edit it together.
              </p>
            </div>
            <div className="border border-gray-500 border-1 p-6 rounded-lg">
              <h3 className="text-sm md:text-lg lg:text-xl font-semibold mb-3 items-center flex gap-2"><Globe2 strokeWidth={1} width={20} height={20} /> Explore Page</h3>
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
        <section className="mb-16">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2 md:mb-6">Get in Touch</h2>
          <div className="prose prose-lg text-gray-600 mb-6 text-sm sm:text-md">
            <p>
              We love hearing from our community! Whether you have suggestions, questions, or just want to share 
              your travel stories, we're here to listen. You can provide feedback <a href="/share-feedback" className="text-blue-600 hover:text-blue-800">here</a> or email us at <a href="mailto:info@journli.com" className="text-blue-600 hover:text-blue-800">info@journli.com</a>.
            </p>
          </div>
        </section>
        
        <section className="mb-16">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2 md:mb-6">Newest Features</h2>
          <p className="text-gray-600 mb-6 text-sm md:text-md">Check out the newest features added to Journli:</p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border border-gray-500 border-1 p-6 rounded-lg">
              <h3 className="text-sm md:text-lg lg:text-xl font-semibold mb-3 items-center flex gap-2"><CiCalendarDate className="w-6 h-6" />Travel Dates</h3>
              <p className="text-gray-600 text-sm md:text-md">
                Optional date fields for each day of your itinerary.
              </p>
              <p className="text-gray-400 text-xs mt-1 md:text-md flex items-center">
                  Added November 28, 2025
                </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AboutPage