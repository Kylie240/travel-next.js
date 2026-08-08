"use client"

import { ArrowRight, Bookmark, Map, Send } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { TbWriting } from "react-icons/tb"
import { Button } from "@/components/ui/button"
import { LuMousePointerClick } from "react-icons/lu"
import { FaHeart, FaMoneyBillWave } from "react-icons/fa6"
import { FaSuitcase, FaPlane } from "react-icons/fa6"
import { RiSparklingFill } from "react-icons/ri"
import type { ReactNode } from "react"

export default function LandingClient({
  children,
  destinations,
}: {
  children?: ReactNode
  destinations?: ReactNode
}) {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="w-full flex justify-center items-center shadow-[inset_0_12px_20px_-12px_rgba(0,0,0,0.1)]">
        <div className="w-screen max-w-[1800px] px-8 mt-6 mb-4 sm:mb-10 flex flex-col-reverse sm:flex-col lg:flex-row justify-center items-center gap-6">
          <div className="flex flex-col items-center lg:items-start justify-center sm:px-4 md:px-6 max-w-[600px] lg:w-1/2">
            <h1 className="text-3xl md:text-4xl font-medium text-center lg:text-left my-4 lg:my-8 sm:mb-8">
              Travel Better With Trips < br /> Planned By Travelers
            </h1>
            <p className="lg:text-base text-center lg:text-left font-light mb-4 mx-4 md:mx-0">
              Discover detailed itineraries from real travelers who have been there and done that - or create and sell your own.
            </p>
            <div className="flex gap-4 my-4">
              <Link href="/explore">
                <Button variant="outline" size="default" className="px-8 text-md h-10 py-4 border bg-transparent flex justify-center items-center w-full hover:bg-gray-100">
                  Explore Itineraries
                </Button>
              </Link>
              <Link href="/create">
                <Button size="default" className="bg-cyan-700 flex items-center text-white px-8 text-md h-10 py-4">
                  Start Creating
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex relative justify-center items-center w-full lg:w-1/2 aspect-[1/1] sm:aspect-[4/3] md:aspect-[2/1] lg:aspect-[1/1] overflow-hidden">
            <div className="mx-0 md:mx-12 lg:mx-0 grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 rotate-12 w-full xl:w-[732px]">
              <div className="flex flex-col gap-y-4 sm:gap-y-6 lg:gap-y-8 mt-12 sm:mt-16 lg:mt-24">
                <div className="relative rounded-xl w-full aspect-[7/10]" style={{ backgroundImage: 'url(https://i.pinimg.com/736x/1b/3e/92/1b3e926253fe18a02d71386b006ed85c.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                </div>
                <div className="rounded-xl overflow-hidden w-full aspect-[7/10]" style={{ backgroundImage: 'url(https://i.pinimg.com/736x/05/d9/7e/05d97eae007a5938fa3cb19f77ca0067.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                </div>
              </div>
              <div className="flex flex-col gap-y-4 sm:gap-y-6 lg:gap-y-8 -mt-12 sm:-mt-16 lg:-mt-24">
                <div className="relative rounded-xl overflow-hidden w-full aspect-[7/10]" style={{ backgroundImage: 'url(https://i.pinimg.com/1200x/ea/9d/1c/ea9d1ca6252b75f5f907b1ad262f255b.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="absolute flex flex-col justify-center items-center py-1 px-4 bg-white rounded-lg z-5 bottom-3 left-6 shadow-md line-height-1 shadow-black/10">
                    <p className="text-xs text-gray-500 font-semibold">Next Payout</p>
                    <p className="text-xl sm:text-2xl font-bold text-cyan-700">$240.00</p>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden w-full aspect-[7/10]" style={{ backgroundImage: 'url(https://i.pinimg.com/736x/44/f4/77/44f4770e83127568b1363448729fb025.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                </div>
              </div>
            </div>
            <div className="absolute z-5 rotate-12 bottom-[10%] left-[5%] flex justify-center items-center py-2 px-4 bg-white rounded-lg gap-1 shadow-md shadow-black/10">
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-cyan-700 rounded-full flex justify-center items-center h-8 w-8 p-1">
                  <span className="text-white font-medium text-lg">J</span>
                </div>
                <div>
                  <p className="text-sm font-medium">journlitravels</p>
                  <p className="text-md font-regular leading-1">Share your itinerary with Journli!</p>
                  <p className="text-xs text-gray-400">{new Date().toLocaleDateString()} Reply</p>
                </div>
              </div>
            </div>
            <div className="absolute z-5 top-[20%] left-[0%] rotate-12 flex justify-center items-center p-1 bg-white rounded-lg gap-1 shadow-md shadow-black/10">
              <div className="flex items-center gap-2 bg-teal-800 rounded-lg p-1">
              <LuMousePointerClick className="w-5 h-5 text-white"/>
              </div>
              <p className="text-md font-medium ml-1 mr-2">1,000</p>
            </div>
            <div className="hidden lg:block">
              <div className="absolute z-5 top-[45%] right-[35%] rotate-12 flex justify-center items-center p-1 bg-white rounded-lg gap-1 shadow-md shadow-black/10">
                <div className="items-center gap-2 bg-teal-800 rounded-lg p-1">
                <FaHeart className="w-6 h-6 text-white"/>
                </div>
                <p className="text-lg font-medium ml-1 mr-2">500</p>
              </div>
            </div>
            <div className="absolute z-5 bottom-[32%] right-[12%] rotate-12 flex justify-center items-center p-1 bg-white rounded-lg gap-1 shadow-md shadow-black/10">
              <div className="flex items-center gap-2 bg-teal-800 rounded-lg p-1">
              <Bookmark className="w-4 h-4 text-white"/>
              </div>
              <p className="text-sm font-medium ml-1 mr-2">200</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-12 bg-gray-100 mt-4 mb-12">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center text-center">
          <div className="flex flex-col items-center justify-center gap-3 bg-white p-4 rounded-lg">
            <h3 className="flex items-center gap-2 text-cyan-700 text-xl md:text-2xl font-bold"><FaSuitcase /> Planning a Trip?</h3>
            <p className="text-base lg:text-lg text-gray-800 mb-2 px-8">
              Discover detailed itineraries created by real travelers and get the exact plans, tips, and recommendations you need for your next trip.
            </p>
            <Link href="/explore" className="flex items-center gap-2 hover:font-medium">
              Explore Itineraries <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 bg-white p-4 rounded-lg">
            <h3 className="flex items-center gap-2 text-cyan-700 text-xl md:text-2xl font-bold"><FaPlane /> Have Travel Experience?</h3>
            <p className="text-base lg:text-lg text-gray-800 mb-2 px-8">
              Get paid for your knowledge and experiences, and earn money by creating and selling your own itineraries.
            </p>
            <Link href="/become-a-creator" className="flex items-center gap-2 hover:font-medium">
              Become a Founding Creator <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Popular itineraries (server-fetched slot) */}
      {children}

      {/* Where do you want to go */}
      {destinations}

      {/* Features Section */}
      <div className="py-12 px-12 my-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-2">
              Your Trip Can Inspire Others
            </h2>
            <p className="text-gray-600 text-lg lg:text-xl text-center max-w-xl">You've already done the research. Turn your travel knowledge into an itinerary other travelers can purchase.</p>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-16">
            {/* Plan It Section */}
            <div className="flex flex-col sm:flex-row gap-8 w-full">
              <div className="relative w-full md:w-1/2 aspect-video md:aspect-[4/3] max-w-[350px] rounded-xl overflow-hidden shadow-lg">
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
                    <TbWriting className="w-4 h-4 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-2">Create</h3>
                </div>
                <p className="text-gray-600 text-base">
                  Turn detailed travel plans into an additional income stream. Your itinerary can continue generating sales after you've published it.
                </p>
              </div>
            </div>

            {/* Create It Section */}
            <div className="flex flex-col sm:flex-row-reverse gap-8 w-full">
              <div className="relative w-full md:w-1/2 aspect-video md:aspect-[4/3] max-w-[350px] rounded-xl overflow-hidden shadow-lg">
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
                  <FaMoneyBillWave className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-2">Earn</h3>
              </div>
                <p className="text-gray-600 text-base">
                Set your own price, share your itinerary or let buyers come to you, and earn whenever another traveler purchases your itinerary.
                </p>
              </div>
            </div>

            {/* Share It Section */}
            <div className="flex flex-col sm:flex-row gap-8 w-full">
              <div className="relative w-full md:w-1/2 aspect-video md:aspect-[4/3] max-w-[350px] rounded-xl overflow-hidden shadow-lg">
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
                  <RiSparklingFill className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-2">Inspire</h3>
              </div>
                <p className="text-gray-600 text-base">
                  Put your expertise to work by sharing insider tips and recommendations with other travelers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 px-4 bg-gray-900">
        <div className="max-w-4xl flex flex-col items-center justify-center mx-auto text-center">
          <h2 className="text-2xl md:text-3xl text-white font-bold mb-2">
            Create Your First Itinerary for Free
          </h2>
          <p className="text-md md:text-lg text-white mb-6 px-8">
            Sell your itineraries with no upfront costs. Sell with no upfront costs.
          </p>
          <Link href="/about">
            <Button className="bg-white text-gray-900 px-8 text-md h-10 py-4 flex justify-center items-center w-full hover:bg-gray-100">
              Learn More
            </Button>
          </Link>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Everything you need to know about creating and sharing travel itineraries
          </p>

          <div className="">
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
                  Yes! Creating an account and creating itineraries is free. You can also sell itineraries with no upfront cost, while Pro offers a reduced seller fee and additional benefits.
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

            <div className="border border-gray-200 bg-white">
              <button
                className="w-full flex justify-between items-center p-4 hover:bg-gray-50"
                onClick={(e) => {
                  const content = e.currentTarget.nextElementSibling as HTMLElement
                  const isOpen = content.style.maxHeight
                  content.style.maxHeight = isOpen ? '' : content.scrollHeight + 'px'
                }}
              >
                <span className="font-medium text-left">Do I need to create an account?</span>
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

            <div className="border border-gray-200 bg-white">
              <button
                className="w-full flex justify-between items-center p-4 hover:bg-gray-50"
                onClick={(e) => {
                  const content = e.currentTarget.nextElementSibling as HTMLElement
                  const isOpen = content.style.maxHeight
                  content.style.maxHeight = isOpen ? '' : content.scrollHeight + 'px'
                }}
              >
                <span className="font-medium text-left">How do I start selling my itineraries?</span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="max-h-0 overflow-hidden transition-all duration-300">
                <p className="p-4 text-gray-600 border-t">
                  To become a seller, you need to create an account on Journli, then create or connect your Stripe account by visiting the Become a Seller page. Once you create an itinerary, you can sell it to other travelers using our free or paid plan.
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

            <div className="border border-gray-200 bg-white">
              <button
                className="w-full flex justify-between items-center p-4 hover:bg-gray-50"
                onClick={(e) => {
                  const content = e.currentTarget.nextElementSibling as HTMLElement
                  const isOpen = content.style.maxHeight
                  content.style.maxHeight = isOpen ? '' : content.scrollHeight + 'px'
                }}
              >
                <span className="font-medium text-left">How much does it cost to sell an itinerary?</span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="max-h-0 overflow-hidden transition-all duration-300">
                <p className="p-4 text-gray-600 border-t">
                  It depends on the plan you choose. You can sell your itinerary for free or sign up for Pro to sell with a reduced seller fee. Current selling fees can be found on the <Link href="/pricing" className="text-cyan-700 hover:underline">Pricing Page</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
