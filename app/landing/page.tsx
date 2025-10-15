"use client"

import { Map, Send } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { TbWriting } from "react-icons/tb"
import ActionButtons from "./action-buttons"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="w-full flex justify-center items-center">
        <div className="relative h-[calc(100vh-64px)] max-h-screen w-screen max-w-[1800px] px-2 md:px-8 md:rounded-3xl overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/boat-photo2.jpg"
              alt="Travel background"
              fill
              className="object-cover rotate-180"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          
          <div className="relative mt-8 z-10 h-full flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-center mb-6">
            Welcome To Your New <br className="hidden md:block" /> Travel Journal
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl text-center mb-8 max-w-2xl">
              Trip planning made easy
            </p>
            <div className="gap-4 mt-8">
                <ActionButtons />
            </div>
          </div>
        </div>
      </div>
      {/* Features Section */}
      <div className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl px-6 font-bold text-center mb-2">
              Plan smarter. Travel better. Share the journey.
            </h2>
            <p className="text-gray-600 text-sm md:text-lg px-4 text-center">Journli Makes Creating and Sharing Travel Plans a Breeze</p>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-16 md:space-y-32">
            {/* Plan It Section */}
            <div className="flex flex-col md:flex-row gap-8 w-full">
              <div className="relative w-full md:w-1/2 aspect-video md:aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                <Image 
                  src="/images/create1.png"
                  alt="Plan It"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="flex flex-col items-start justify-center w-full md:w-1/2 px-4 md:px-0">
                <div className="flex md:flex-col gap-4 md:gap-0 items-end md:items-start">
                  <div className="bg-cyan-700 p-4 rounded-lg mb-4 shadow-md">
                    <Map className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-semibold mb-4">Plan It</h3>
                </div>
                <p className="text-gray-600 text-base md:text-lg">
                  With our Day-by-day itinerary builder, you can easily plan your trip and add activities, notes, and travel details.
                </p>
              </div>
            </div>

            {/* Create It Section */}
            <div className="flex flex-col md:flex-row-reverse gap-8 md:px-[8rem] w-full">
              <div className="relative w-full md:w-1/2 aspect-video md:aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                <Image 
                  src="/images/days.png"
                  alt="Create It"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="flex flex-col items-start justify-center w-full md:w-1/2 px-4 md:px-0">
              <div className="flex md:flex-col gap-4 md:gap-0 items-end md:items-start">

                <div className="bg-cyan-700 p-4 rounded-lg mb-4 shadow-md">
                  <TbWriting className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold mb-4">Create It</h3>
              </div>
                <p className="text-gray-600 text-base md:text-lg">
                  Turn your plans into a complete travel itinerary with our easy-to-use builder. Our Intuitive builder gives you everything you need to bring your trip to life.
                </p>
              </div>
            </div>

            {/* Share It Section */}
            <div className="flex flex-col md:flex-row gap-8 w-full">
              <div className="relative w-full md:w-1/2 aspect-video md:aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                <Image 
                  src="/images/share.png"
                  alt="Share It"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="flex flex-col items-start justify-center w-full md:w-1/2 px-4 md:px-0">
              <div className="flex md:flex-col gap-4 md:gap-0 items-end md:items-start">
                <div className="bg-cyan-700 p-4 rounded-lg mb-4 shadow-md">
                  <Send className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold mb-4">Share It</h3>
              </div>
                <p className="text-gray-600 text-base md:text-lg">
                  Travel is better together! Send your itinerary to friends or followers with a single link. No sign-up needed for viewing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl flex flex-col items-center justify-center mx-auto text-center">
          <h2 className="text-2xl md:text-3xl text-white md:text-4xl font-bold mb-6">
            Start Planning Your Journey
          </h2>
          <p className="text-md md:text-lg text-white mb-8 px-8">
            Sign up to start creating and sharing your travel experiences with fellow adventurers.
          </p>
          <Link href="/about">
            <Button className="px-6 text-md md:font-large md:h-12 md:py-4 md:px-8 md:text-xl text-black cursor-pointer border bg-white flex justify-center items-center p-2 hover:bg-gray-100">
              Learn More
            </Button>
          </Link>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl md:text-4xl font-bold text-center mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Everything you need to know about creating and sharing travel itineraries
          </p>

          <div className="">
            {/* Question 1 */}
            <div className="border border-gray-200 bg-white">
              <button
                className="w-full flex justify-between items-center p-4 hover:bg-gray-50"
                onClick={(e) => {
                  const content = e.currentTarget.nextElementSibling as HTMLElement
                  const isOpen = content.style.maxHeight
                  content.style.maxHeight = isOpen ? '' : content.scrollHeight + 'px'
                }}
              >
                <span className="font-medium text-left">Is Journli free to use?</span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="max-h-0 overflow-hidden transition-all duration-300">
                <p className="p-4 text-gray-600 border-t">
                  Yes! Journli is completely free to use. Create unlimited itineraries, share with friends, and view other travelers' journeys all without any cost.
                </p>
              </div>
            </div>

            <div className="border border-gray-200 bg-white">
              <button
                className="w-full flex justify-between items-center p-4 hover:bg-gray-50"
                onClick={(e) => {
                  const content = e.currentTarget.nextElementSibling as HTMLElement
                  const isOpen = content.style.maxHeight
                  content.style.maxHeight = isOpen ? '' : content.scrollHeight + 'px'
                }}
              >
                <span className="font-medium text-left">Do I need to download an app?</span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="max-h-0 overflow-hidden transition-all duration-300">
                <p className="p-4 text-gray-600 border-t">
                  No download needed—you can use the platform right in your browser. Our site is mobile-friendly too.
                </p>
              </div>
            </div>

            {/* Question 2 */}
            <div className="border border-gray-200 bg-white">
              <button
                className="w-full flex justify-between items-center p-4 hover:bg-gray-50"
                onClick={(e) => {
                  const content = e.currentTarget.nextElementSibling as HTMLElement
                  const isOpen = content.style.maxHeight
                  content.style.maxHeight = isOpen ? '' : content.scrollHeight + 'px'
                }}
              >
                <span className="font-medium text-left">Do I need to create an account to view shared itineraries?</span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="max-h-0 overflow-hidden transition-all duration-300">
                <p className="p-4 text-gray-600 border-t">
                  No, you don't need an account to view shared itineraries. However, creating an account allows you to create, save, and manage your own travel plans.
                </p>
              </div>
            </div>

            {/* Question 3 */}
            <div className="border border-gray-200 bg-white">
              <button
                className="w-full flex justify-between items-center p-4 hover:bg-gray-50"
                onClick={(e) => {
                  const content = e.currentTarget.nextElementSibling as HTMLElement
                  const isOpen = content.style.maxHeight
                  content.style.maxHeight = isOpen ? '' : content.scrollHeight + 'px'
                }}
              >
                <span className="font-medium text-left">Can I collaborate with others on an itinerary?</span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="max-h-0 overflow-hidden transition-all duration-300">
                <p className="p-4 text-gray-600 border-t">
                  Currently, itineraries can be shared for viewing. We're working on collaborative editing features that will be available soon!
                </p>
              </div>
            </div>

            {/* Question 4 */}
            <div className="border border-gray-200 bg-white">
              <button
                className="w-full flex justify-between items-center p-4 hover:bg-gray-50"
                onClick={(e) => {
                  const content = e.currentTarget.nextElementSibling as HTMLElement
                  const isOpen = content.style.maxHeight
                  content.style.maxHeight = isOpen ? '' : content.scrollHeight + 'px'
                }}
              >
                <span className="font-medium text-left">How detailed can my itineraries be?</span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="max-h-0 overflow-hidden transition-all duration-300">
                <p className="p-4 text-gray-600 border-t">
                  Very detailed! Add day-by-day activities, accommodations, travel notes, photos, and more. You can include as much or as little detail as you'd like.
                </p>
              </div>
            </div>

            {/* Question 5 */}
            <div className="border border-gray-200 bg-white">
              <button
                className="w-full flex justify-between items-center p-4 hover:bg-gray-50"
                onClick={(e) => {
                  const content = e.currentTarget.nextElementSibling as HTMLElement
                  const isOpen = content.style.maxHeight
                  content.style.maxHeight = isOpen ? '' : content.scrollHeight + 'px'
                }}
              >
                <span className="font-medium text-left">Can I download my itineraries for offline use?</span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="max-h-0 overflow-hidden transition-all duration-300">
                <p className="p-4 text-gray-600 border-t">
                  Yes! You can export your itineraries to PDF format, making them easily accessible offline on any device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}