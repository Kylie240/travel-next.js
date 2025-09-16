"use client"

import { Globe, Map, Compass, Users, Heart, PlaneLanding, Send } from "lucide-react"
import { NodeNextRequest } from "next/dist/server/base-http/node"
import Image from "next/image"
import Link from "next/link"
import { FaMagnifyingGlass } from "react-icons/fa6"
import { TbWriting } from "react-icons/tb"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen shadow-lg overflow-hidden rounded-b-3xl">
        <div className="absolute inset-0">
          <Image
            src="/images/landing-hero.jpg"
            alt="Travel background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4" style={{  
            backgroundSize: 'cover',
            backgroundPosition: 'center', 
            backgroundImage: 'url(https://plus.unsplash.com/premium_photo-1719843013722-c2f4d69db940?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8dHJhdmVsfGVufDB8fDB8fHww)' }}>
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
          Welcome To Your New <br/> Travel Journal
          </h1>
          <p className="text-lg md:text-xl text-center mb-8 max-w-2xl">
            Create and Share Itineraries with Ease
          </p>
          <div className="flex gap-4">
            <Link 
              href="/auth/login"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Log In
            </Link>
            <Link 
              href="/auth/signup"
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
        <div className="absolute z-0 inset-0 bg-black/30"></div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Journli Makes Creating and Sharing Travel Plans Easier
          </h2>
          
          <div className="grid grid-cols-1 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Map className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Plan It</h3>
              <p className="text-gray-600">
                Connect with travelers from around the world and share experiences
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <TbWriting className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Create It</h3>
              <p className="text-gray-600">
                Create and follow day-by-day travel plans with interactive maps
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Send className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Share It</h3>
              <p className="text-gray-600">
                Discover trips that match your interests and travel style
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-gray-400">Travel Itineraries</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-gray-400">Countries Covered</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Sign up to start creating and sharing your travel experiences with fellow adventurers.
          </p>
          <Link 
            href="/auth/signup"
            className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition inline-block"
          >
            Sign Up
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center text-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <FaMagnifyingGlass className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-gray-600">
                Discover other creator's and itineraries with our Explore page
              </p>
            </div>

    </div>
  )
}
