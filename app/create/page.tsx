"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Calendar, Plus, Minus } from "lucide-react"

// This is a placeholder for actual auth check - replace with your auth system
const useAuth = () => {
  // Replace this with actual auth logic
  return {
    isAuthenticated: true, // Temporarily true for development
    user: {
      name: "John Doe",
      email: "john@example.com"
    }
  }
}

interface Destination {
  id: string;
  name: string;
  duration: number;
}

export default function CreatePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [destinations, setDestinations] = useState<Destination[]>([
    { id: "1", name: "", duration: 1 }
  ])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const addDestination = () => {
    setDestinations([
      ...destinations,
      { id: Math.random().toString(), name: "", duration: 1 }
    ])
  }

  const removeDestination = (id: string) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter(dest => dest.id !== id))
    }
  }

  const updateDestination = (id: string, field: keyof Destination, value: string | number) => {
    setDestinations(destinations.map(dest => 
      dest.id === id ? { ...dest, [field]: value } : dest
    ))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission - integrate with your backend
    console.log({
      title,
      description,
      destinations
    })
  }

  if (!isAuthenticated) {
    return null // or a loading state
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-semibold mb-6">Create New Itinerary</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter itinerary title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your itinerary"
                  className="w-full p-2 border rounded-md min-h-[100px]"
                  required
                />
              </div>
            </div>

            {/* Destinations */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Destinations</h2>
              <div className="space-y-4">
                {destinations.map((dest, index) => (
                  <div key={dest.id} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <Label htmlFor={`destination-${dest.id}`}>Destination {index + 1}</Label>
                      <Input
                        id={`destination-${dest.id}`}
                        value={dest.name}
                        onChange={(e) => updateDestination(dest.id, "name", e.target.value)}
                        placeholder="Enter destination name"
                        required
                      />
                    </div>
                    <div className="w-32">
                      <Label htmlFor={`duration-${dest.id}`}>Days</Label>
                      <Input
                        id={`duration-${dest.id}`}
                        type="number"
                        min="1"
                        value={dest.duration}
                        onChange={(e) => updateDestination(dest.id, "duration", parseInt(e.target.value))}
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="mt-6"
                      onClick={() => removeDestination(dest.id)}
                      disabled={destinations.length === 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={addDestination}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Destination
              </Button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Itinerary
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 