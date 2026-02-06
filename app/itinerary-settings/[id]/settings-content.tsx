"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select"
import { Itinerary } from "@/types/itinerary"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateItineraryPermissions, getItineraryPermissionsById, updateItineraryPricing } from "@/lib/actions/itinerary.actions"
import { getFollowersById } from "@/lib/actions/user.actions"
import { Followers } from "@/types/followers"
import { viewPermissionEnum, editPermissionEnum } from "@/enums/itineraryStatusEnum"
import { ArrowLeft, Save, Eye, Edit, Loader2, Search, DollarSign } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { FaUserLarge } from "react-icons/fa6"
import { Input } from "@/components/ui/input"
import createClient from "@/utils/supabase/client"

interface ItinerarySettingsContentProps {
  itinerary: Itinerary;
  userId: string;
  userPlan: string;
}

type ViewPermission = 'public' | 'creator' | 'restricted';
type EditPermission = 'creator' | 'collaborators';

export function ItinerarySettingsContent({ itinerary, userId, userPlan }: ItinerarySettingsContentProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSaving, setIsSaving] = useState(false)
  const [viewPermission, setViewPermission] = useState<ViewPermission>('public')
  const [editPermission, setEditPermission] = useState<EditPermission>('creator')
  const [allowedViewers, setAllowedViewers] = useState<string[]>([])
  const [allowedEditors, setAllowedEditors] = useState<string[]>([])
  const [followers, setFollowers] = useState<Followers[]>([])
  const [loadingFollowers, setLoadingFollowers] = useState(false)
  const [viewerSearchTerm, setViewerSearchTerm] = useState('')
  const [editorSearchTerm, setEditorSearchTerm] = useState('')
  const [loadingPermissions, setLoadingPermissions] = useState(true)
  
  // Pricing state (only for standard/premium users)
  const [isPaid, setIsPaid] = useState(false)
  const [priceInDollars, setPriceInDollars] = useState('')
  const canSetPricing = userPlan === 'standard' || userPlan === 'premium'

  // Monitor authentication state and redirect if user logs out
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  // Fetch permissions and pricing when component mounts
  useEffect(() => {
    const fetchPermissionsAndPricing = async () => {
      try {
        setLoadingPermissions(true)
        // Note: getItineraryPermissionsById has an unused permissions parameter, but we pass empty object
        const permissions = await getItineraryPermissionsById(itinerary.id, {} as any)
        
        if (permissions) {
          // Map the permissions to the component state
          // Handle both string numbers and actual strings
          const viewPerm = typeof permissions.viewPermission === 'string' 
            ? parseInt(permissions.viewPermission) 
            : permissions.viewPermission
          const editPerm = typeof permissions.editPermission === 'string'
            ? parseInt(permissions.editPermission)
            : permissions.editPermission
          
          // Map viewPermission: 1 = public, 2 = creator, 3 = restricted
          if (viewPerm === viewPermissionEnum.public) {
            setViewPermission('public')
          } else if (viewPerm === viewPermissionEnum.creator) {
            setViewPermission('creator')
          } else if (viewPerm === viewPermissionEnum.restricted) {
            setViewPermission('restricted')
          }
          
          // Map editPermission: 1 = creator, 2 = collaborators
          if (editPerm === editPermissionEnum.creator) {
            setEditPermission('creator')
          } else if (editPerm === editPermissionEnum.collaborators) {
            setEditPermission('collaborators')
          }
          
          // Set allowed viewers and editors
          if (permissions.allowedViewers && Array.isArray(permissions.allowedViewers)) {
            setAllowedViewers(permissions.allowedViewers)
          }
          if (permissions.allowedEditors && Array.isArray(permissions.allowedEditors)) {
            setAllowedEditors(permissions.allowedEditors)
          }
        }

        // Fetch current pricing if user can set pricing
        if (canSetPricing) {
          const { data: pricingData } = await supabase
            .from('itineraries')
            .select('is_paid, price_cents')
            .eq('id', itinerary.id)
            .single()
          
          if (pricingData) {
            setIsPaid(pricingData.is_paid || false)
            setPriceInDollars(pricingData.price_cents ? (pricingData.price_cents / 100).toFixed(2) : '')
          }
        }
      } catch (error) {
        console.error('Error fetching permissions:', error)
        // Don't show error toast as permissions might not exist yet
      } finally {
        setLoadingPermissions(false)
      }
    }
    
    fetchPermissionsAndPricing()
  }, [itinerary.id, canSetPricing, supabase])

  // Fetch followers when "restricted users" is selected for view permission or "collaborators" for edit permission
  useEffect(() => {
    const fetchFollowers = async () => {
      const shouldFetch = (viewPermission === 'restricted' || editPermission === 'collaborators') && 
                         followers.length === 0 && 
                         !loadingFollowers
      
      if (shouldFetch) {
        setLoadingFollowers(true)
        try {
          const followersData = await getFollowersById(userId)
          setFollowers(followersData || [])
        } catch (error) {
          toast.error('Failed to load followers')
          console.error('Error fetching followers:', error)
        } finally {
          setLoadingFollowers(false)
        }
      }
    }
    fetchFollowers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewPermission, editPermission, userId])

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      // Save permissions
      await updateItineraryPermissions(
        itinerary.id,
        {
          viewPermission: viewPermission as 'public' | 'private' | 'restricted',
          editPermission: editPermission as 'collaborators' | 'creator',
          allowedViewers,
          allowedEditors
        }
      )

      // Save pricing if user has a paid plan
      if (canSetPricing) {
        const priceCents = priceInDollars ? Math.round(parseFloat(priceInDollars) * 100) : 0
        await updateItineraryPricing(itinerary.id, {
          is_paid: isPaid,
          price_cents: isPaid ? priceCents : 0
        })
      }

      toast.success('Settings saved successfully')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleViewer = (userId: string) => {
    if (allowedViewers.includes(userId)) {
      setAllowedViewers(allowedViewers.filter(id => id !== userId))
    } else {
      setAllowedViewers([...allowedViewers, userId])
    }
  }

  const handleToggleEditor = (userId: string) => {
    if (allowedEditors.includes(userId)) {
      setAllowedEditors(allowedEditors.filter(id => id !== userId))
    } else {
      setAllowedEditors([...allowedEditors, userId])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/my-itineraries`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              My Itineraries
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-4">
            {itinerary.mainImage && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                <Image
                  src={itinerary.mainImage}
                  alt={itinerary.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Itinerary Settings</h1>
              <p className="text-gray-600">{itinerary.title}</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* View Permissions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-5 w-5 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">Who Can View</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Control who can see this itinerary
            </p>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label className="text-base font-medium">View Permission</Label>
                <Select value={viewPermission} onValueChange={(value) => setViewPermission(value as ViewPermission)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      Public - Anyone can view
                    </SelectItem>
                    <SelectItem value="private">
                      Private - Only you can view
                    </SelectItem>
                    <SelectItem value="restricted">
                      Restricted - Only selected users
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {viewPermission === 'restricted' && (
                <div className="space-y-3 pt-4">
                  <Label className="text-base font-medium">Select Users Who Can View</Label>
                  
                  {followers.length > 0 && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search by name or username..."
                        value={viewerSearchTerm}
                        onChange={(e) => setViewerSearchTerm(e.target.value)}
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  )}
                  
                  {loadingFollowers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-gray-600">Loading followers...</span>
                    </div>
                  ) : followers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No followers found. Share your profile to get followers!</p>
                    </div>
                  ) : (() => {
                    const filteredFollowers = followers.filter(follower => {
                      if (!viewerSearchTerm) return true
                      const searchLower = viewerSearchTerm.toLowerCase()
                      return follower.userName.toLowerCase().includes(searchLower) ||
                             follower.userUsername.toLowerCase().includes(searchLower)
                    })
                    
                    return (
                      <div className="max-h-[400px] overflow-y-auto border rounded-lg p-4 space-y-2">
                        {filteredFollowers.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <p>No users found matching "{viewerSearchTerm}"</p>
                          </div>
                        ) : (
                          filteredFollowers.map((follower) => (
                            <div
                              key={follower.userId}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleToggleViewer(follower.userId)}
                            >
                              <input
                                type="checkbox"
                                checked={allowedViewers.includes(follower.userId)}
                                onChange={() => handleToggleViewer(follower.userId)}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="relative w-10 h-10 flex-shrink-0">
                                {follower.userAvatar && follower.userAvatar !== "" ? (
                                  <Image
                                    src={follower.userAvatar}
                                    alt={follower.userName}
                                    fill
                                    className="object-cover rounded-full"
                                    sizes="40px"
                                  />
                                ) : (
                                  <div className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <FaUserLarge className="h-6 w-6 text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{follower.userName}</p>
                                <p className="text-sm text-gray-600 truncate">@{follower.userUsername}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )
                  })()}

                  {allowedViewers.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Selected Viewers ({allowedViewers.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {allowedViewers.map((viewerId) => {
                          const viewer = followers.find(f => f.userId === viewerId)
                          return viewer ? (
                            <div
                              key={viewerId}
                              className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm"
                            >
                              <span>{viewer.userName}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleViewer(viewerId)}
                                className="text-gray-500 hover:text-gray-700 ml-1"
                              >
                                ×
                              </button>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Edit Permissions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Edit className="h-5 w-5 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">Who Can Edit</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Control who can make changes to this itinerary
            </p>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label className="text-base font-medium">Edit Permission</Label>
                <Select value={editPermission} onValueChange={(value) => setEditPermission(value as EditPermission)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creator">
                      Creator Only - Only you can edit
                    </SelectItem>
                    <SelectItem value="collaborators">
                      Collaborators - Selected users can edit
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editPermission === 'collaborators' && (
                <div className="space-y-3 pt-4">
                  <Label className="text-base font-medium">Select Users Who Can Edit</Label>
                  
                  {followers.length > 0 && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search by name or username..."
                        value={editorSearchTerm}
                        onChange={(e) => setEditorSearchTerm(e.target.value)}
                        className="pl-10 rounded-xl"
                      />
                    </div>
                  )}
                  
                  {loadingFollowers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-gray-600">Loading followers...</span>
                    </div>
                  ) : followers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No followers found. Share your profile to get followers!</p>
                    </div>
                  ) : (() => {
                    const filteredFollowers = followers.filter(follower => {
                      if (!editorSearchTerm) return true
                      const searchLower = editorSearchTerm.toLowerCase()
                      return follower.userName.toLowerCase().includes(searchLower) ||
                             follower.userUsername.toLowerCase().includes(searchLower)
                    })
                    
                    return (
                      <div className="max-h-[400px] overflow-y-auto border rounded-lg p-4 space-y-2">
                        {filteredFollowers.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <p>No users found matching "{editorSearchTerm}"</p>
                          </div>
                        ) : (
                          filteredFollowers.map((follower) => (
                            <div
                              key={follower.userId}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleToggleEditor(follower.userId)}
                            >
                              <input
                                type="checkbox"
                                checked={allowedEditors.includes(follower.userId)}
                                onChange={() => handleToggleEditor(follower.userId)}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="relative w-10 h-10 flex-shrink-0">
                                {follower.userAvatar && follower.userAvatar !== "" ? (
                                  <Image
                                    src={follower.userAvatar}
                                    alt={follower.userName}
                                    fill
                                    className="object-cover rounded-full"
                                    sizes="40px"
                                  />
                                ) : (
                                  <div className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <FaUserLarge className="h-6 w-6 text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{follower.userName}</p>
                                <p className="text-sm text-gray-600 truncate">@{follower.userUsername}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )
                  })()}

                  {allowedEditors.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Selected Editors ({allowedEditors.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {allowedEditors.map((editorId) => {
                          const editor = followers.find(f => f.userId === editorId)
                          return editor ? (
                            <div
                              key={editorId}
                              className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm"
                            >
                              <span>{editor.userName}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleEditor(editorId)}
                                className="text-gray-500 hover:text-gray-700 ml-1"
                              >
                                ×
                              </button>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pricing - Only for Standard/Premium users */}
          {canSetPricing && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="h-5 w-5 text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-900">Pricing</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Set a price to sell this itinerary to other travelers
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPaid"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                  />
                  <Label htmlFor="isPaid" className="text-base font-medium cursor-pointer">
                    Enable paid access for this itinerary
                  </Label>
                </div>

                {isPaid && (
                  <div className="flex flex-col gap-2 pt-4">
                    <Label className="text-base font-medium">Price (USD)</Label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        min="0.50"
                        step="0.01"
                        placeholder="9.99"
                        value={priceInDollars}
                        onChange={(e) => setPriceInDollars(e.target.value)}
                        className="pl-7"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mb-0">
                      Minimum price: $0.50. You'll receive {userPlan === 'standard' ? '80%' : '90%'} of the sale after platform fees.
                    </p>
                    {userPlan === 'standard' && (
                      <Link href="/plans" className="text-cyan-700 text-sm font-medium hover:underline">Upgrade to our Premium plan to unlock more features and reduced selling fee.</Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upgrade prompt for free users */}
          {!canSetPricing && (
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl shadow-sm p-6 border border-cyan-200">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="h-5 w-5 text-cyan-700" />
                <h2 className="text-xl font-semibold text-gray-900">Sell Your Itinerary</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Upgrade to a Standard or Premium plan to set a price and earn money from your travel expertise.
              </p>
              <a href="/plans" className="text-cyan-700 font-medium hover:underline">
                View Plans →
              </a>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="mr-2">Saving...</span>
                </>
              ) : (
                <>
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

