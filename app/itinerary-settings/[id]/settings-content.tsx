"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select"
import { Itinerary } from "@/types/itinerary"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateItineraryPermissions } from "@/lib/actions/itinerary.actions"
import { getFollowersById } from "@/lib/actions/user.actions"
import { Followers } from "@/types/followers"
import { ArrowLeft, Save, Eye, Edit, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { FaUserLarge } from "react-icons/fa6"
import { ItineraryPermissions } from "@/types/ItineraryPermissions"

interface ItinerarySettingsContentProps {
  itinerary: Itinerary;
  userId: string;
}

type ViewPermission = 'public' | 'private' | 'specific';
type EditPermission = 'creator-only' | 'collaborators';

export function ItinerarySettingsContent({ itinerary, userId }: ItinerarySettingsContentProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [viewPermission, setViewPermission] = useState<ViewPermission>('public')
  const [editPermission, setEditPermission] = useState<EditPermission>('creator-only')
  const [allowedViewers, setAllowedViewers] = useState<string[]>([])
  const [allowedEditors, setAllowedEditors] = useState<string[]>([])
  const [followers, setFollowers] = useState<Followers[]>([])
  const [loadingFollowers, setLoadingFollowers] = useState(false)

  // Initialize state from itinerary (if permissions are stored)
  // useEffect(() => {
  //   const getItineraryPermissions = async (permissions: ItineraryPermissions) => {
  //     setViewPermission(permissions.viewPermission)
  //     setEditPermission(permissions.editPermission)
  //     setAllowedViewers(permissions.allowedViewers)
  //     setAllowedEditors(permissions.allowedEditors)
  //   }
  //   getItineraryPermissions()
  // }, [itinerary])

  // Fetch followers when "specific users" is selected for view permission or "collaborators" for edit permission
  useEffect(() => {
    const fetchFollowers = async () => {
      const shouldFetch = (viewPermission === 'specific' || editPermission === 'collaborators') && 
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
      await updateItineraryPermissions(
        itinerary.id,
        {
          viewPermission: viewPermission as 'public' | 'private' | 'restricted',
          editPermission: editPermission as 'collaborators' | 'creator',
          allowedViewers,
          allowedEditors
        }
      )
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
          <Link href={`/itinerary/${itinerary.id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Itinerary
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
                    <SelectItem value="specific">
                      Restricted - Only selected users
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {viewPermission === 'specific' && (
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-base font-medium">Select Users Who Can View</Label>
                  <p>Must be </p>
                  
                  {loadingFollowers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-gray-600">Loading followers...</span>
                    </div>
                  ) : followers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No followers found. Share your profile to get followers!</p>
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto border rounded-lg p-4 space-y-2">
                      {followers.map((follower) => (
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
                      ))}
                    </div>
                  )}

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
                    <SelectItem value="creator-only">
                      Creator Only - Only you can edit
                    </SelectItem>
                    <SelectItem value="collaborators">
                      Collaborators - Selected users can edit
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editPermission === 'collaborators' && (
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-base font-medium">Select Users Who Can Edit</Label>
                  
                  {loadingFollowers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-gray-600">Loading followers...</span>
                    </div>
                  ) : followers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No followers found. Share your profile to get followers!</p>
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto border rounded-lg p-4 space-y-2">
                      {followers.map((follower) => (
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
                      ))}
                    </div>
                  )}

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
                  <Save className="mr-2 h-4 w-4" />
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

