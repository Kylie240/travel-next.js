"use client"

import { Map, MapPin, Send } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { TbWriting } from "react-icons/tb"
import ActionButtons from "./action-buttons"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="w-full flex justify-center items-center shadow-[inset_0_12px_20px_-12px_rgba(0,0,0,0.1)]">
        <div className="w-screen max-w-[1800px] px-8 mt-10 sm:mt-16 mb-4 sm:mb-10 flex flex-col-reverse sm:flex-col lg:flex-row justify-center items-center gap-8">
          <div className="flex flex-col items-center lg:items-start justify-center sm:px-4 md:px-6 max-w-[600px] lg:w-1/2">
            <h1 className="text-4xl font-medium text-center lg:text-left my-8 sm:mb-8">
              Welcome To Your New < br /> Travel Journal
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-center lg:text-left font-light mb-4 sm:mb-8 sm:mx-2">
              Create and share your travel itineraries with friends and followers. Journli houses your experiences in one place, making it easy to share and discover new travel ideas with one link.
            </p>
            <div className="gap-4 sm:mt-8">
                <ActionButtons />
            </div>
          </div>
          <div className="flex relative justify-center items-center w-full lg:w-1/2 mt-0 sm:mt-8 aspect-[1/1] sm:aspect-[4/3] md:aspect-[2/1] lg:aspect-[1/1] overflow-hidden">
            <div className="mx-0 md:mx-12 lg:mx-0 grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 rotate-12 w-full xl:w-[732px]">
              <div className="flex flex-col gap-y-4 sm:gap-y-6 lg:gap-y-8 mt-12 sm:mt-16 lg:mt-24">
                <div className="relative rounded-xl w-full aspect-[7/10]" style={{ backgroundImage: 'url(https://i.pinimg.com/736x/1b/3e/92/1b3e926253fe18a02d71386b006ed85c.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                </div>
                <div className="rounded-xl overflow-hidden w-full aspect-[7/10]" style={{ backgroundImage: 'url(https://i.pinimg.com/736x/05/d9/7e/05d97eae007a5938fa3cb19f77ca0067.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                </div>
              </div>
              <div className="flex flex-col gap-y-4 sm:gap-y-6 lg:gap-y-8 -mt-12 sm:-mt-16 lg:-mt-24">
                <div className="relative rounded-xl overflow-hidden w-full aspect-[7/10]" style={{ backgroundImage: 'url(https://i.pinimg.com/1200x/ea/9d/1c/ea9d1ca6252b75f5f907b1ad262f255b.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="absolute flex justify-center items-center py-2 px-3 bg-white rounded-full z-5 bottom-2 left-2 gap-1 shadow-md shadow-black/10">
                    <MapPin className="w-5 h-5 text-cyan-700" strokeWidth={3}/>
                    <p className="text-md font-semibold">Thailand</p>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden w-full aspect-[7/10]" style={{ backgroundImage: 'url(https://i.pinimg.com/736x/44/f4/77/44f4770e83127568b1363448729fb025.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                </div>
              </div>
            </div>
            <div className="absolute z-5 bottom-[10%] left-[12%] rotate-12 flex justify-center items-center py-2 px-4 bg-white rounded-lg gap-1 shadow-md shadow-black/10">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Image className="w-full h-full object-cover rounded-full" src="https://www.journli.com/_next/image?url=https%3A%2F%2Fxmfqfdxfssaxwjfodzff.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Favatars%2F264ba7c9-7f34-4fd9-ac38-b8ec5a9a2fb9%2Fprofile-picture-1762126834984.png&w=1920&q=75" alt="kylie" width={32} height={32} />
                </div>
                <div>
                  <p className="text-sm font-medium">journlitravels</p>
                  <p className="text-sm font-regular leading-1">Share your itinerary with Journli!</p>
                  <p className="text-xs text-gray-400">2023-04-19 Reply</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 px-4 bg-gray-100 mt-20">
        <div className="max-w-4xl flex flex-col items-center justify-center mx-auto text-center">
          <p className="text-sm text-gray-800 mb-2">Coming Soon</p>
          <h2 className="text-2xl md:text-3xl text-cyan-700 font-bold mb-6">
            Get Paid for Your Travel Expertise
          </h2>
          <p className="text-md md:text-lg text-black mb-8 px-8">
            Soon you'll be able to monetize your travel expertise! Create detailed itineraries and sell them to fellow travelers looking for insider tips and curated experiences. Click <Link href="/plans" className="text-cyan-700 text-bold">here</Link> to learn more.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl px-8 sm:px-6 font-bold text-center mb-2">
              Where travelers inspire travelers
            </h2>
            <p className="text-gray-600 text-sm md:text-lg px-4 text-center">...and for the stories that don't fit in a post</p>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-16 md:space-y-32">
            {/* Plan It Section */}
            <div className="flex flex-col md:flex-row gap-8 w-full">
              <div className="relative w-full md:w-1/2 aspect-video md:aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                <Image 
                  src="/images/Plan.png"
                  alt="Plan It"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="flex flex-col items-start justify-center w-full md:w-1/2 px-4 md:px-0">
                <div className="flex md:flex-col gap-4 md:gap-0 items-end md:items-start">
                  <div className="bg-cyan-700 p-3 rounded-lg mb-4 shadow-md">
                    <Map className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-semibold mb-4">Plan It</h3>
                </div>
                <p className="text-gray-600 text-base md:text-lg">
                  We provide a simple and easy to use interface to plan and share your itineraries. Our platform is designed to be user-friendly and breaks down travel planning into three simple steps.
                </p>
              </div>
            </div>

            {/* Create It Section */}
            <div className="flex flex-col md:flex-row-reverse gap-8 w-full">
              <div className="relative w-full md:w-1/2 aspect-video md:aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                <Image 
                  src="/images/Create.png"
                  alt="Create It"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="flex flex-col items-start justify-center w-full md:w-1/2 px-4 md:px-0">
              <div className="flex md:flex-col gap-4 md:gap-0 items-end md:items-start">

                <div className="bg-cyan-700 p-3 rounded-lg mb-4 shadow-md">
                  <TbWriting className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold mb-4">Create It</h3>
              </div>
                <p className="text-gray-600 text-base md:text-lg">
                  Turn your plans into a complete travel itinerary with our easy-to-use itinerary builder. With our Day-by-day scheduler, you can quickly plan your trip and add activities, notes, photos, and more.
                </p>
              </div>
            </div>

            {/* Share It Section */}
            <div className="flex flex-col md:flex-row gap-8 w-full">
              <div className="relative w-full md:w-1/2 aspect-video md:aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                <Image 
                  src="/images/Share.png"
                  alt="Share It"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="flex flex-col items-start justify-center w-full md:w-1/2 px-4 md:px-0">
              <div className="flex md:flex-col gap-4 md:gap-0 items-end md:items-start">
                <div className="bg-cyan-700 p-3 rounded-lg mb-4 shadow-md">
                  <Send className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold mb-4">Share It</h3>
              </div>
                <p className="text-gray-600 text-base md:text-lg">
                  Our multi-platform sharing feature allows you to share your itinerary whth friends or followers in a single click. No sign-up needed for viewing content, allowing you to share your plans with anyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl flex flex-col items-center justify-center mx-auto text-center">
          <h2 className="text-2xl md:text-3xl text-white font-bold mb-6">
            Start Sharing Your Journey For Free
          </h2>
          <p className="text-md md:text-lg text-white mb-8 px-8">
            Sign up to start creating and sharing your stories,<br /> or learn more about Journli by clicking the button below.
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