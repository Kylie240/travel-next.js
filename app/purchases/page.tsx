"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Bookmark, Heart, MapPin, Search, ThumbsUp, ShoppingBag, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Session, User } from "@supabase/supabase-js"
import { getSavesByUserId, UnsaveItinerary } from "@/lib/actions/itinerary.actions"
import { SavedItinerary } from "@/types/savedItinerary"
import { toast } from "sonner"
import BookmarkElement from "../../components/ui/bookmark-element"
import createClient from "@/utils/supabase/client"
import { useCart } from "@/context/cart"

type PurchasedItinerary = {
  id: string
  title: string
  mainImage: string
  shortDescription: string
  creatorName: string
  creatorUsername: string
  countries: string[]
  purchasedAt: string
}

export default function PurchasesPage() { 
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { clearCart } = useCart()
  const [user, setUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [purchases, setPurchases] = useState<PurchasedItinerary[] | null>(null)
  const [filteredPurchases, setFilteredPurchases] = useState<PurchasedItinerary[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Handle success redirect from Stripe checkout
  useEffect(() => {
    const success = searchParams.get('success')
    if (success === 'true') {
      clearCart()
      setShowSuccessMessage(true)
      toast.success('Purchase successful!', {
        description: 'Your itineraries are now available.',
      })
      // Remove success param from URL
      router.replace('/purchases')
    }
  }, [searchParams, clearCart, router])

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (user) {
          await fetchPurchases(user.id, user.email)
        } else {
          setLoading(false)
        }
      } catch (error) {
        setUser(null)
        setLoading(false)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        await fetchPurchases(currentUser.id, currentUser.email)
      } else {
        setPurchases(null)
        setFilteredPurchases(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const fetchPurchases = async (userId: string, userEmail?: string) => {
    try {
      // Fetch purchases by user_id OR by email (for guest purchases linked to this email)
      let query = supabase
        .from('itinerary_purchases')
        .select(`
          id,
          purchased_at,
          itinerary:itineraries (
            id,
            title,
            main_image,
            short_description,
            creator:users (
              name,
              username
            ),
            days (
              country_name
            )
          )
        `)
        .order('purchased_at', { ascending: false })

      // If we have an email, fetch by user_id OR email
      if (userEmail) {
        query = query.or(`user_id.eq.${userId},customer_email.eq.${userEmail}`)
      } else {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching purchases:', error)
        setLoading(false)
        return
      }

      // Deduplicate by itinerary id (in case same purchase appears twice)
      const seen = new Set<string>()
      const formattedPurchases: PurchasedItinerary[] = (data || [])
        .filter((purchase: any) => {
          if (!purchase.itinerary?.id || seen.has(purchase.itinerary.id)) return false
          seen.add(purchase.itinerary.id)
          return true
        })
        .map((purchase: any) => ({
          id: purchase.itinerary?.id,
          title: purchase.itinerary?.title || 'Untitled',
          mainImage: purchase.itinerary?.main_image || '',
          shortDescription: purchase.itinerary?.short_description || '',
          creatorName: purchase.itinerary?.creator?.name || 'Unknown',
          creatorUsername: purchase.itinerary?.creator?.username || 'unknown',
          countries: [...new Set(purchase.itinerary?.days?.map((d: any) => d.country_name).filter(Boolean) || [])] as string[],
          purchasedAt: purchase.purchased_at,
        }))

      setPurchases(formattedPurchases)
      setFilteredPurchases(formattedPurchases)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching purchases:', error)
      setLoading(false)
    }
  }

  const handleSearch = (searchTerm: string) => {
    if (searchTerm === "") {
      setFilteredPurchases(purchases)
      return
    }

    setSearchTerm(searchTerm)
    setFilteredPurchases(purchases?.filter(itinerary => 
      itinerary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itinerary.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itinerary.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itinerary.countries.some(country => 
        country.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) || null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12 sm:pt-[6rem]">
      <div className="container mx-auto px-6 sm:px-12 md:px-[3rem] lg:px-[6rem]">
        {showSuccessMessage && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800">Purchase Complete!</p>
              <p className="text-sm text-green-600">Your purchased itineraries are now available below.</p>
            </div>
          </div>
        )}

        <div className="flex flex-row items-center gap-2 mb-10">
          <h1 className="text-3xl font-semibold">Purchases</h1>
          {filteredPurchases && filteredPurchases?.length > 0 && (
            <p className="text-xl text-gray-500 md:text-2xl">
              ({filteredPurchases?.length})
            </p>
          )}
        </div>

        {purchases && purchases.length > 6 && (
        <div className="relative mb-8">
          <Input
            type="text"
            placeholder="Search purchases..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 rounded-xl lg:max-w-[550px]"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        )}

        {filteredPurchases && filteredPurchases.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredPurchases.map((itinerary) => (
              <div
                key={itinerary.id}
                className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm"
                onClick={() => router.push(`/itinerary/${itinerary.id}`)}
              >
                <div className="relative aspect-[2/3]">
                  {itinerary.mainImage ? (
                    <Image
                      src={itinerary.mainImage}
                      alt={itinerary.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                </div>
                <div className="p-4 sm:m-1 md:m-3 rounded-xl absolute bottom-0 left-0 right-0 text-white">
                  <p className="text-sm flex items-center gap-1 mt-1 opacity-90 overflow-hidden">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span className="truncate">{itinerary.countries.map((country) => country).join(" · ")}</span>
                  </p>
                  <p className="font-medium leading-5 md:leading-6 text-lg sm:text-2xl max-h-[180px] line-clamp-4 overflow-hidden">{itinerary.title}</p>
                  <div className="flex justify-between items-end">
                    <p className="text-sm text-gray-200/50">@{itinerary.creatorUsername}</p>
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Purchased
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed">
            <div className="mb-4">
              <ShoppingBag className="h-12 w-12 mx-auto text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Purchases Yet</h3>
            <p className="text-gray-600 mb-4">Browse and purchase itineraries to access premium content</p>
            <button 
              onClick={() => router.push('/explore')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Explore Itineraries
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 