"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ProfileHeader } from "@/components/profile/profile-header"
import { Input } from "@/components/ui/input"
import { SettingsSidebar } from "@/components/ui/settings-sidebar"
import { User as UserType } from "@supabase/supabase-js"
import { UserData } from "@/lib/types"
import { UserStats } from "@/types/userStats"
import { Check, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { travelerTypesMap } from "@/lib/constants/tags"
import { deleteAccount, getBlockedUsersById, removeBlockedUser, setContentData, setNotificationData, setProfileData, setUserAvatar } from "@/lib/actions/user.actions"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FollowersDialog } from "@/components/ui/followers-dialog"
import { Followers } from "@/types/followers"
import { UserSettings } from "@/types/profileData copy"
import { FaUserLarge } from "react-icons/fa6";
import createClient from "@/utils/supabase/client"
import { supabase } from "@/utils/supabase/superbase-client"
import { dispatchAvatarUpdate, dispatchProfileUpdate } from "@/lib/utils/avatar-events"

interface SettingsContentProps {
  initialUser: UserType | null;
  userData: UserData;
  userStats: UserStats;
  searchParams: { tab: string, success: string };
  userSettings: UserSettings;
}

export function SettingsContent({ initialUser, userData, userStats, searchParams, userSettings }: SettingsContentProps) {
  const [activeSection, setActiveSection] = useState(searchParams?.tab || "Profile")
  const [success, setSuccess] = useState(searchParams?.success || false)
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false)
  const [ _, setUserData] = useState<UserData>(userData)
  const [updatedUserData, setUpdatedUserData] = useState<UserData>(userData)
  const [updatedContentData, setUpdatedContentData] = useState<UserData>(userData)
  // Helper function to extract username from full URL
  const extractUsername = (url: string) => {
    if (!url) return ""
    if (url.includes("facebook.com/")) return url.replace("https://www.facebook.com/", "").replace("https://facebook.com/", "")
    if (url.includes("instagram.com/")) return url.replace("https://www.instagram.com/", "").replace("https://instagram.com/", "")
    if (url.includes("twitter.com/")) return url.replace("https://www.twitter.com/", "").replace("https://twitter.com/", "")
    if (url.includes("pinterest.com/")) return url.replace("https://www.pinterest.com/", "").replace("https://pinterest.com/", "")
    if (url.includes("tiktok.com/")) return url.replace("https://www.tiktok.com/@", "").replace("https://tiktok.com/@", "")
    if (url.includes("youtube.com/")) return url.replace("https://www.youtube.com/", "").replace("https://youtube.com/", "")
    return url
  }

  // Separate form state for inputs - doesn't update profile until saved
  const [formData, setFormData] = useState({
    name: userData.name,
    username: userData.username,
    bio: userData.bio,
    location: userData.location,
    facebook: extractUsername(userData.facebook || ""),
    instagram: extractUsername(userData.instagram || ""),
    twitter: extractUsername(userData.twitter || ""),
    pinterest: extractUsername(userData.pinterest || ""),
    tiktok: extractUsername(userData.tiktok || ""),
    youtube: extractUsername(userData.youtube || "")
  })
  const [isItinerarySharing, setIsItinerarySharing] = useState(false)
  const [isPrivateProfile, setIsPrivateProfile] = useState(userSettings.is_private)
  const [isEmailNotifications, setIsEmailNotifications] = useState(userSettings.email_notifications)
  const [formError, setFormError] = useState("")  
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const [showBlockedUsers, setShowBlockedUsers] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState<Followers[]>([])
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false)
  const [uploadedAvatar, setUploadedAvatar] = useState<File | null>(null)
  const planDetails = [
    {
      title: "free",
      description: "Perfect for the casual traveler and occasional trip planner",
      features: [
        "20 shareable itineraries",
        "Access to day-by-day planner",
        "Share itineraries with anyone",
        "Save and bookmark favorites",
        "Follow other travelers",
        "Profile customization",
      ]
    },
    {
      title: "standard",
      description: "Ideal for frequent travelers who want more features",
      features: [
        "Access to day-by-day planner",
        "Share itineraries with anyone",
        "Save and bookmark favorites",
        "Follow other travelers",
        "Profile customization",
        "Unlimited itinerary creation",
        "Added control over content visibility",
        "Offline access to itineraries",
        "Collaborative editing",
        "Custom themes and templates",
        "Monetization capabilities",
      ]
    },
    {
      title: "premium",
      description: "Advanced capabilities for creators looking to monetize their content",
      features: [
        "Access to day-by-day planner",
        "Share itineraries with anyone",
        "Save and bookmark favorites",
        "Follow other travelers",
        "Profile customization",
        "Unlimited itinerary creation",
        "Added control over content visibility",
        "Offline access to itineraries",
        "Collaborative editing",
        "Custom themes and templates",
        "Monetization capabilities",
        "Analytics dashboard",
        "Affiliate program",
        "Explore Page boost",
        "Monetization capabilities",
        "Reduced selling fee",
      ]
    }
  ]

  const handleSectionClick = (sectionTitle: string) => {
    if (window.innerWidth < 1020) {
      setShowSettingsSidebar(true)
    }
    setActiveSection(sectionTitle)
  }

  const handleTravelerTypeChange = (value: string) => {
    setUserData({ ...userData, travelerType: parseInt(value) })
    console.log(userData)
  }

  const handleSaveChanges = async (sectionTitle: string) => {
    setFormError("")
    setIsSaving(true)
    try {
      switch (sectionTitle) {
        case "Profile":
          // Helper function to build full URL from username
          const buildSocialUrl = (platform: string, username: string) => {
            if (!username || username.trim() === "") return ""
            const baseUrls: Record<string, string> = {
              facebook: "https://www.facebook.com/",
              instagram: "https://www.instagram.com/",
              twitter: "https://www.twitter.com/",
              pinterest: "https://www.pinterest.com/",
              tiktok: "https://www.tiktok.com/@",
              youtube: "https://www.youtube.com/@"
            }
            return `${baseUrls[platform] || ""}${username.trim()}`
          }

          const profileResult = await setProfileData(
            userData.id, 
            { name: formData.name, 
              username: formData.username.toLowerCase(), 
              bio: formData.bio, 
              location: formData.location,
              email: userData.email,
              avatar: updatedUserData.avatar,
              facebook: buildSocialUrl("facebook", formData.facebook),
              instagram: buildSocialUrl("instagram", formData.instagram),
              twitter: buildSocialUrl("twitter", formData.twitter),
              pinterest: buildSocialUrl("pinterest", formData.pinterest),
              tiktok: buildSocialUrl("tiktok", formData.tiktok),
              youtube: buildSocialUrl("youtube", formData.youtube)
            })
          
          if ('code' in profileResult) {
            if (profileResult.message.includes("duplicate key value violates unique constraint")) {
              setFormError("Username already exists")
              return
            }
            setFormError(profileResult.message || "Failed to update profile")
            return
          }
          
          // Only update the profile state after successful save
          setUpdatedUserData({ 
            ...updatedUserData, 
            name: formData.name,
            username: formData.username.toLowerCase(),
            bio: formData.bio,
            location: formData.location
          })
          
          // Dispatch profile update event to notify other components
          dispatchProfileUpdate(userData.id, {
            name: formData.name,
            username: formData.username.toLowerCase(),
            bio: formData.bio,
            location: formData.location
          })
          
          toast.success("Profile updated successfully")
          router.refresh()
          break

        case "Visibility":
          const contentResult = await setContentData(
            userData.id,
            {
              is_private: isPrivateProfile
            }
          )
          if (contentResult instanceof Error) {
            setFormError(contentResult.message)
            return
          }
          toast.success("Privacy settings updated")
          router.refresh()
          break

        case "Notifications":
          const notificationResult = await setNotificationData(
            userData.id,
            {
              email_notifications: isEmailNotifications
            }
          )
          if (notificationResult instanceof Error) {
            setFormError(notificationResult.message)
            return
          }
          toast.success("Notifications updated")
          router.refresh()
          break

        default:
          toast.error("Something went wrong")
      }
      setShowSettingsSidebar(false)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "An unexpected error occurred")
      toast.error("Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleBlockedUsers = async () => {
    const blockedUsers = await getBlockedUsersById(userData.id)
    setBlockedUsers(blockedUsers)
    setShowBlockedUsers(true)
  }

  const handleUnblockUser = async (userId: string) => {
    await removeBlockedUser(userData.id, userId)
    toast.success("User unblocked")
    router.refresh()
  }

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match")
      return
    }
    const supabase = createClient()
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Password updated")
    router.refresh()
    setNewPassword("")
    setConfirmNewPassword("")
  }

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone.')) {
      try {
          // await supabase.auth.admin.deleteUser(userData.id)
          await deleteAccount(userData.id)
          supabase.auth.signOut()
          toast.success('Account deleted successfully')
          router.push('/')
      } catch (error) {
          toast.error('Failed to delete account')
      }
    }
  }

  const handleUserAvatar = async (avatar: string) => {
    await setUserAvatar(userData.id, avatar)
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const supabase = createClient();
    try {
      setUploadingAvatar(true)
      const MAX_FILE_SIZE = 2 * 1024 * 1024;
      const file = event.target.files?.[0];
      
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size must be under 2MB");
        return;
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `profile-picture-${Date.now()}`;
      const filePath = `${userData.id}/${fileName}.${fileExt}`;

      // Delete old avatar if it exists
      if (userData.avatar) {
        const oldFilePath = userData.avatar.split("/avatars/")[1];
        if (oldFilePath) {
          const { error: deleteError } = await supabase.storage
            .from("avatars")
            .remove([oldFilePath]);

          if (deleteError) {
            console.warn("Failed to delete old avatar:", deleteError.message);
          }
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
        });
        
      if (uploadError) {
        throw new Error(uploadError.message || "Failed to update profile picture")
      }

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath)
        
      handleUserAvatar(publicUrl)
      setUpdatedUserData({...updatedUserData, avatar: publicUrl})
      dispatchAvatarUpdate(userData.id, publicUrl)
      toast.success("Profile picture updated successfully")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to upload profile picture")
      setFormError(error.message || "Failed to upload profile picture")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      if (updatedUserData.avatar) {
        await supabase.storage.from("avatars").remove([updatedUserData.avatar]);
      }
      await setUserAvatar(userData.id, "")
      setUpdatedUserData({...updatedUserData, avatar: ""})
      dispatchAvatarUpdate(userData.id, "")
      toast.success("Profile picture removed")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to remove profile picture")
    }
  }

  const settingsSections = [
    {
      title: "Profile",
      description: "Edit your public profile information",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-md font-medium text-gray-600 pl-2 mb-2">Profile Picture</label>
            {updatedUserData.avatar && updatedUserData.avatar !== "" ? (
            <div className="w-[120px] h-[120px] overflow-hidden relative rounded-full ml-2">
                <Image
                  src={updatedUserData.avatar}  
                  alt={updatedUserData.name}
                  className="object-cover rounded-full"
                  width={120}
                  height={120}
                />
              </div>
            ) : (
              <div className="w-[120px] h-[120px] relative rounded-full bg-gray-100 flex items-center justify-center">
                <FaUserLarge className="h-12 w-12 text-gray-300" />
              </div>
            )}
            <div className="pl-2 flex flex-col gap-2">
              <label htmlFor="avatar-upload" className="flex justify-center items-center font-medium text-sm shadow-sm gap-2 text-center border border-gray-200 rounded-md w-[90px] text-[14px] h-[36px] cursor-pointer hover:bg-gray-50 transition-colors">
                {uploadingAvatar ? 'Uploading...' : 'Upload'}
                <input 
                  id="avatar-upload"
                  type="file" 
                  accept="image/jpeg,image/png"
                  disabled={uploadingAvatar}
                  className="hidden"
                  onChange={handleUpload} 
                />
              </label>
              <Button variant="outline" className="w-[90px] text-sm" onClick={() => handleRemoveAvatar()} disabled={uploadingAvatar}>Remove</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-md font-medium text-gray-600 pl-2 mb-2">Name</label>
              <Input
                type="text"
                value={formData.name}
                placeholder="Enter your name"
                className="rounded-xl"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-md font-medium text-gray-600 pl-2 mb-2">Username</label>
              <Input
                type="text"
                value={formData.username}
                placeholder="Enter your username"
                className="rounded-xl"
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
              />
            </div>
          </div>
          <div>
            <label className="block text-md font-medium text-gray-600 pl-2 mb-2">Bio</label>
            <textarea
              className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-travel-900 min-h-[100px]"
              value={formData.bio}
              placeholder="Tell us about yourself"
              maxLength={250}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
          </div>
          <div>
            <label className="block text-md font-medium text-gray-600 pl-2 mb-2">Email</label>
            <Input
              type="text"
              defaultValue={updatedUserData.email}
              placeholder="Enter your email"
              disabled
              className="rounded-xl"
              onChange={(e) => setUpdatedUserData({ ...updatedUserData, email: e.target.value })}
            />
          </div>
          {/* <div>
            <label className="block text-md font-semibold pl-2 mb-2">Traveler Type (Optional)</label>
            <p className="text-sm text-gray-600 mb-4">
              This is the type of traveler that best describes you.
            </p>
            <Select
              defaultValue={userData.travelerType?.toString()}
              onValueChange={handleTravelerTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a traveler type" />
              </SelectTrigger>
              <SelectContent>
                {travelerTypesMap.map((travelerType) => (
                  <SelectItem key={travelerType.id} value={travelerType.id.toString()}>
                    {travelerType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
          <div>
            <label className="block text-md font-medium text-gray-600 pl-2 mb-2">Location</label>
              <Input
                type="text"
                defaultValue={updatedUserData.location}
                placeholder="Where are you based?"
                className="rounded-xl"
                onChange={(e) => setUpdatedUserData({ ...updatedUserData, location: e.target.value })}
              />
          </div>
          <label className="block text-md font-semibold pl-2 mt-2">Social Links</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-md font-medium text-gray-600 pl-2 mb-2">Facebook</label>
              <div className="flex items-center rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="px-3 py-2 text-sm text-gray-500 border-r" style={{ width: '205px' }}>https://www.facebook.com/</span>
                <input
                  type="text"
                  value={formData.facebook}
                  placeholder="username"
                  className="flex-1 h-10 px-3 py-2 text-base focus:outline-none bg-transparent"
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-md font-medium text-gray-600 pl-2 mb-2">Instagram</label>
              <div className="flex items-center rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="px-3 py-2 text-sm text-gray-500 border-r" style={{ minWidth: '205px' }}>https://www.instagram.com/</span>
                <input
                  type="text"
                  value={formData.instagram}
                  placeholder="username"
                  className="flex-1 h-10 px-3 py-2 text-base focus:outline-none bg-transparent"
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-md font-medium text-gray-600 pl-2 mb-2">Twitter</label>
              <div className="flex items-center rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="px-3 py-2 text-sm text-gray-500 border-r" style={{ minWidth: '205px' }}>https://www.twitter.com/</span>
                <input
                  type="text"
                  value={formData.twitter}
                  placeholder="username"
                  className="flex-1 h-10 px-3 py-2 text-base focus:outline-none bg-transparent"
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-md font-medium text-gray-600 pl-2 mb-2">Pinterest</label>
              <div className="flex items-center rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="px-3 py-2 text-sm text-gray-500 border-r" style={{ minWidth: '205px' }}>https://www.pinterest.com/</span>
                <input
                  type="text"
                  value={formData.pinterest}
                  placeholder="username"
                  className="flex-1 h-10 px-3 py-2 text-base focus:outline-none bg-transparent"
                  onChange={(e) => setFormData({ ...formData, pinterest: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-md font-medium text-gray-600 pl-2 mb-2">Tiktok</label>
              <div className="flex items-center rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="px-3 py-2 text-sm text-gray-500 border-r" style={{ minWidth: '205px' }}>https://www.tiktok.com/@</span>
                <input
                  type="text"
                  value={formData.tiktok}
                  placeholder="username"
                  className="flex-1 h-10 px-3 py-2 text-base focus:outline-none bg-transparent"
                  onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-md font-medium text-gray-600 pl-2 mb-2">Youtube</label>
              <div className="flex items-center rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="px-3 py-2 text-sm text-gray-500 border-r" style={{ minWidth: '205px' }}>https://www.youtube.com/@</span>
                <input
                  type="text"
                  value={formData.youtube}
                  placeholder="username"
                  className="flex-1 h-10 px-3 py-2 text-base focus:outline-none bg-transparent"
                  onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                />
              </div>
            </div>
          </div>

          {formError && (
            <p className="text-sm text-red-600 mb-2">{formError}</p>
          )}
          <Button 
            onClick={() => handleSaveChanges('Profile')} 
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )
    },
    // {
    //   title: "User Stats",
    //   description: "View your user stats",
    //   content: (
    //     <div className="space-y-6">
    //       <div>
    //         <label className="block text-md font-medium text-gray-600 pl-2 mb-2">Username</label>
           
    //       </div>
    //     </div>
    //   )
    // },
    // {
    //   title: "Personal information",
    //   description: "Manage your personal details",
    //   content: (
    //     <div className="space-y-6">
    //       <div>
    //         <label className="block text-sm font-medium mb-2">Full Name</label>
    //         <Input
    //           type="text"
    //           defaultValue={userData.username}
    //           placeholder="Enter your full name"
    //           onChange={(e) => setUserData({ ...userData, username: e.target.value })}
    //         />
    //       </div>
    //       <div>
    //         <label className="block text-sm font-medium mb-2">Email</label>
    //         <Input
    //           type="email"
    //           defaultValue={userData.email || ""}
    //           disabled
    //           onChange={(e) => setUserData({ ...userData, email: e.target.value })}
    //         />
    //       </div>
    //       <div>
    //         <label className="block text-sm font-medium mb-2">Phone Number</label>
    //         <Input
    //           type="tel"
    //           placeholder="Enter your phone number"
    //         />
    //       </div>
    //       <Button>Save Changes</Button>
    //     </div>
    //   )
    // },
    {
      title: "Login & Security",
      description: "Update your password and secure your account",
      content: (
        <div className="space-y-8">
          <div>
            <label className="block text-md font-semibold pl-2 mb-2">New Password</label>
            <Input
              type="password"
              placeholder="Enter your new password"
              className="rounded-xl"
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
            />
          </div>
          <div>
            <label className="block text-md font-semibold pl-2 mb-2">Confirm New Password</label>
            <Input
              type="password"
              placeholder="Confirm your new password"
              className="rounded-xl"
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              value={confirmNewPassword}
            />
            {newPassword !== confirmNewPassword && (
              <p className="text-sm text-red-600">Passwords do not match</p>
            )}
          </div>
          <Button disabled={!newPassword || !confirmNewPassword || newPassword !== confirmNewPassword} onClick={() => handleUpdatePassword()}>Update Password</Button>
          <div className="mt-12">
            <label className="block text-md font-semibold mb-2">Delete Account</label>
            <p className="text-sm text-gray-600 mb-4">
            Deleting your account means that your account will no longer be available. 
            You will not be able to log in and your profile will not be accessible. 
            Any reviews, photos, and tips that you have contributed may continue to be displayed on the site.
            </p>
            <a className="underline cursor-pointer hover:text-red-600" onClick={() => handleDeleteAccount()}>Delete</a>
          </div>
        </div>
      )
    },{
      title: "Visibility",
      description: "Edit your public profile information",
      content: (
        <div className="space-y-10">
          <div>
            <label className="block text-md font-semibold mb-2">Private Profile</label>
            <p className="text-sm text-gray-600 mb-4">
              When your profile is private, only you can see it.
            </p>
            <div className="flex items-center space-x-2">
              <Switch
                checked={isPrivateProfile}
                onCheckedChange={setIsPrivateProfile}
                aria-label="Toggle private profile"
              />
              <span className="text-sm text-gray-700">
                {isPrivateProfile ? 'Private' : 'Public'}
              </span>
            </div>
          </div>
          <div className="hidden">
            <label className="block text-md font-semibold mb-2">Blocked Users</label>
            <p className="text-sm text-gray-600 mb-4">
              Block users from viewing your profile and itineraries.
            </p>
            <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => toggleBlockedUsers()}>View Blocked Users</Button>
            </div>
          </div>
          {formError && (
            <p className="text-sm text-red-600 mb-2">{formError}</p>
          )}
          <Button 
            className="mt-4" 
            onClick={() => handleSaveChanges('Visibility')}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <FollowersDialog
            isOpen={showBlockedUsers}
            onOpenChange={setShowBlockedUsers}
            users={blockedUsers}
            title="Blocked Users"
            currentUserId={userData.id}
            onFollowToggle={handleUnblockUser}
          />
        </div>
      )
    },
    {
      title: "Notifications",
      description: "Choose how you want to be notified",
      content: (
        <div className="space-y-6">
          <div>
          <div>
            <label className="block text-md font-semibold mb-2">Email Notifications</label>
            <p className="text-sm text-gray-600 mb-4">
              Choose if you want to receive email notifications.
            </p>
            <div className="flex items-center space-x-2">
              <Switch
                checked={isEmailNotifications}
                onCheckedChange={setIsEmailNotifications}
                aria-label="Toggle email notifications"
              />
              <span className="text-sm text-gray-700">
                {isEmailNotifications ? 'On' : 'Off'}
              </span>
            </div>
          </div>
          </div>
          {formError && (
            <p className="text-sm text-red-600 mb-2">{formError}</p>
          )}
          <Button 
            className="mt-4" 
            onClick={() => handleSaveChanges('Notifications')}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )
    },
    {
      title: "Your Plan",
      description: "Manage your subscription",
      content: (
        <div className="space-y-8">
          <div>
            <label className="text-sm text-gray-600">Current plan</label>
            <p className="block text-md font-semibold mt-2">
              {userSettings.plan.charAt(0).toUpperCase() + userSettings.plan.slice(1)} Plan
            </p>
            {planDetails.find(plan => plan.title === userSettings.plan)?.description && (
              <p className="text-sm text-gray-600">
                {planDetails.find(plan => plan.title === userSettings.plan)?.description}
              </p>
            )}
            {userSettings.plan !== 'free' && 
              <a href="https://billing.stripe.com/p/login/test_dRmcN40YlfXM6UkcTKgMw00" target="_blank" className="mt-4 underline cursor-pointer hover:text-red-600">Manage your subscription</a>
            }
          </div>
          {userSettings.plan !== 'free' && (
            <div>
              <label className="block text-md font-semibold mb-2">Subscription Status</label>
              <p className="text-sm text-gray-600 mb-4">
                Your {userSettings.plan === 'free' ? 'plan' : 'subscription status'} is {userSettings.plan === 'free' ? 'active' : userSettings.stripe_subscription_status}.
              </p>
            </div>
          )}
          {userSettings.stripe_subscription_status === 'active' && userSettings.plan !== 'free' && (
            <div>
              <label className="block text-md font-semibold mb-2">Billing Details</label>
              <p className="text-sm text-gray-600 mb-4">
                Your next billing date is { userSettings.stripe_subscription_created_date ? new Date(userSettings.stripe_subscription_created_date).toLocaleDateString() : 'N/A' }. You will be charged {userSettings.plan === 'standard' ? '$5.99' : '$13.99'} per month.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Your billing email is {userData.email}.
              </p>
            </div>
          )}
          <div>
            <label className="block text-md font-semibold mb-2">Plan details</label>
              {planDetails.find(plan => plan.title === userSettings.plan)?.features.map((feature) => (
                <div key={feature}>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                </div>
              ))}
          </div>
          { userSettings.plan !== 'premium' && (
          <div className="mt-12">
            <label className="block text-md font-semibold mb-2">{userSettings.plan === 'free' ? 'Upgrade and subsribe' : 'Upgrade to Premium'}</label>
            {userSettings.plan === 'free' ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Upgrading to a paid plan will give you access to more features, allow you to create unlimited itineraries, monetize your content, and more.
                </p>
                {userData.id === 'bb9bae46-6088-4a9f-ad81-9f81ed305958' ? (
                <form action="api/checkout-session" method="POST">
                  <Button className="bg-green-600" type="submit">
                    Upgrade to Standard
                  </Button>
                </form>
                ) : (
                  <Button disabled className="bg-gray-400 cursor-not-allowed">
                    Upgrade to Standard (Coming Soon)
                  </Button>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Upgrading to Premium will give you access to all features and allow you to create unlimited itineraries.
                </p>
                <Button disabled className="bg-gray-400 cursor-not-allowed">
                    Upgrade to Premium (Coming Soon)
                  </Button>
                {/* Uncomment when premium available */}
                {/* <form action="api/checkout-session" method="POST">
                  <Button className="bg-green-600" type="submit">
                    Upgrade to Premium (Coming Soon)
                  </Button>
                </form> */}
              </>
            )}
          </div>
          )}
          <Button variant="outline" onClick={() => router.push('/plans')}>Explore All Plans</Button>
          { userSettings.plan !== 'free' && userSettings.stripe_subscription_status === 'active' && (
          <div className="mt-12">
            <label className="block text-md font-semibold mb-2">Downgrade</label>
            <p className="text-sm text-gray-600 mb-4">
              In order to downgrade your plan, you will need to cancel your current subscription and then upgrade to the new plan.
            </p>
          </div>
          )}
          { userSettings.plan !== 'free' && userSettings.stripe_subscription_status === 'active' && (
          <div className="mt-12">
            <label className="block text-md font-semibold mb-2">Unsubscribe</label>
            <p className="text-sm text-gray-600 mb-4">
              Unsubscribing from your plan means that you will no longer be able to access the features of your current plan.
              You will still be able to access your itineraries and profile. If you have more than 20 shareable itineraries, we will automatically reduce the number of both itineraries you can create and share to 20.
            </p>
            <a href="https://billing.stripe.com/p/login/test_dRmcN40YlfXM6UkcTKgMw00" target="_blank" className="underline cursor-pointer hover:text-red-600">Cancel your subscription</a>
          </div>
          )}
        </div>
      )
    }
    // {
    //   title: "Travel preferences",
    //   description: "Set your travel style and interests",
    //   content: (
    //     <div className="space-y-6">
    //       <div>
    //         <label className="block text-sm font-medium mb-2">Travel Style</label>
    //         <div className="space-y-2">
    //           {["Budget", "Mid-range", "Luxury", "Backpacker", "Digital Nomad"].map((style) => (
    //             <label key={style} className="flex items-center">
    //               <input type="checkbox" className="mr-2" />
    //               {style}
    //             </label>
    //           ))}
    //         </div>
    //       </div>
    //       <div>
    //         <label className="block text-sm font-medium mb-2">Interests</label>
    //         <div className="space-y-2">
    //           {["Culture", "Nature", "Adventure", "Food", "Photography", "History"].map((interest) => (
    //             <label key={interest} className="flex items-center">
    //               <input type="checkbox" className="mr-2" />
    //               {interest}
    //             </label>
    //           ))}
    //         </div>
    //       </div>
    //       <Button>Save Preferences</Button>
    //     </div>
    //   )
    // },
    // {
    //   title: "Site preferences",
    //   description: "Customize your experience",
    //   content: (
    //     <div className="space-y-6">
    //       <div>
    //         <label className="block text-sm font-medium mb-2">Language</label>
    //         <select className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-travel-900">
    //           <option value="en">English</option>
    //           <option value="es">Spanish</option>
    //           <option value="fr">French</option>
    //           <option value="de">German</option>
    //         </select>
    //       </div>
    //       <div>
    //         <label className="block text-sm font-medium mb-2">Currency</label>
    //         <select className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-travel-900">
    //           <option value="USD">USD ($)</option>
    //           <option value="EUR">EUR (€)</option>
    //           <option value="GBP">GBP (£)</option>
    //           <option value="JPY">JPY (¥)</option>
    //         </select>
    //       </div>
    //       {/* <div>
    //         <label className="block text-sm font-medium mb-2">Theme</label>
    //         <select className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-travel-900">
    //           <option value="light">Light</option>
    //           <option value="dark">Dark</option>
    //           <option value="system">System</option>
    //         </select>
    //       </div> */}
    //       <Button>Save Preferences</Button>
    //     </div>
    //   )
    // }
  ]

  return (
    <div className="min-h-fit h-screen md:h-[calc(100vh-64px)] bg-white lg:bg-gray-50">
      {success && (
        <div className="flex justify-between items-center bg-green-100 border border-green-400 text-green-700 mx-12 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">Your subscription has been updated successfully!</span>
          <Button variant="outline" onClick={() => setSuccess(false)}>Close</Button>
        </div>
      )}
      <div className="h-full min-h-fit">
        <div className="md:p-6 h-full grid md:grid-cols-1 lg:grid-cols-3 space-y-6 lg:space-y-0 lg:gap-6">
          {/* Left Column: Profile Header*/}
          <div className="bg-white lg:shadow-sm rounded-xl p-6 flex flex-col gap-8">
            <ProfileHeader 
              user={updatedUserData}
              userStats={userStats}
            />
            <div className="border-t pt-4 border-gray-200 py-4">
              <h2 className="text-2xl font-medium mb-4 pl-2 md:pl-4 pt-4 md:pt-8 lg:pt-0">Account Settings</h2>
              <div className="space-y-2">
                {settingsSections.map((section) => (
                  <button
                    key={section.title}
                    onClick={() => handleSectionClick(section.title)}
                    className={`w-full p-2 md:p-4 md:rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors text-left ${
                      activeSection === section.title ? "md:bg-gray-100" : ""
                    }`}
                  >
                    <div className="w-full flex justify-between">
                      <div className="flex">
                        <h3 className="font-medium">{section.title}</h3>
                      </div>
                      <ChevronRight strokeWidth={1} className="block lg:hidden" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Settings Content */}
          <div className="hidden lg:block pb-24 pd:mb-0 col-span-2 p-2 h-full bg-white md:rounded-xl lg:shadow-sm md:p-6 overflow-y-auto">
            <div className="space-y-6">
              <div >
                <h3 className="text-xl font-semibold mb-6">{activeSection}</h3>
                {settingsSections.find(section => section.title === activeSection)?.content}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SettingsSidebar
        isOpen={showSettingsSidebar}
        onClose={() => setShowSettingsSidebar(false)}
        title={activeSection}
      >
        {settingsSections.find(section => section.title === activeSection)?.content}                                                                            
      </SettingsSidebar>
      
    </div>
  )
}
