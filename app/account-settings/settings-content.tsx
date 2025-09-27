"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ProfileHeader } from "@/components/profile/profile-header"
import { Input } from "@/components/ui/input"
import { SettingsSidebar } from "@/components/ui/settings-sidebar"
import { User } from "@supabase/supabase-js"
import { UserData } from "@/lib/types"
import { UserStats } from "@/types/userStats"
import { ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { travelerTypesMap } from "@/lib/constants/tags"
import { deleteAccount, getBlockedUsersById, removeBlockedUser, setContentData, setNotificationData, setProfileData } from "@/lib/actions/user.actions"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FollowersDialog } from "@/components/ui/followers-dialog"
import { Followers } from "@/types/followers"
import { UserSettings } from "@/types/profileData copy"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface SettingsContentProps {
  initialUser: User | null;
  userData: UserData;
  userStats: UserStats;
  searchParams: { tab: string };
  userSettings: UserSettings;
}

export function SettingsContent({ initialUser, userData, userStats, searchParams, userSettings }: SettingsContentProps) {
  const [activeSection, setActiveSection] = useState(searchParams?.tab || "Dashboard")
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false)
  const [ _, setUserData] = useState<UserData>(userData)
  const [updatedUserData, setUpdatedUserData] = useState<UserData>(userData)
  const [updatedContentData, setUpdatedContentData] = useState<UserData>(userData)
  const [isItinerarySharing, setIsItinerarySharing] = useState(false)
  const [isPrivateProfile, setIsPrivateProfile] = useState(userSettings.is_private)
  const [isEmailNotifications, setIsEmailNotifications] = useState(userSettings.email_notifications)
  const router = useRouter()
  const [showBlockedUsers, setShowBlockedUsers] = useState(false)
  const [blockedUsers, setBlockedUsers] = useState<Followers[]>([])
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

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

  const handleSaveChanges = (sectionTitle: string) => {
    switch (sectionTitle) {
      case "Profile":
        setProfileData(
          userData.id, 
          { name: updatedUserData.name, 
            username: updatedUserData.username, 
            bio: updatedUserData.bio, 
            location: updatedUserData.location,
            email: updatedUserData.email,
            avatar: updatedUserData.avatar,
          })
        router.refresh()
        break
      case "Content Visibility":
        setContentData(
          userData.id,
          {
            is_private: isPrivateProfile
          }
        )
        toast.success("Privacy settings updated")
        router.refresh()
        break
      case "Notifications":
        setNotificationData(
          userData.id,
          {
            email_notifications: isEmailNotifications
          }
        )
        toast.success("Notifications updated")
        router.refresh()
        break
      default:
        toast.error("Something went wrong")
    }
    setShowSettingsSidebar(false)
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
    const supabase = createClientComponentClient()
    await supabase.auth.updateUser({
      password: newPassword
    })
    toast.success("Password updated")
    router.refresh()
    setNewPassword("")
    setConfirmNewPassword("")
  }

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone.')) {
      try {
          await deleteAccount(userData.id)
          toast.success('Account deleted')
          router.refresh()
      } catch (error) {
          toast.error('Failed to delete account')
      }
  }
  }

  const settingsSections = [
    {
      title: "Edit Profile",
      description: "Edit your public profile information",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block text-md font-semibold pl-2 mb-2">Profile Picture</label>
            <div className="w-[100px] h-[100px] relative rounded-full">
              <Image
                src={updatedUserData.avatar}  
                alt={updatedUserData.name}
                className="object-cover"
                width={100}
                height={100}
                />
            </div>
            <Button variant="outline">Change Profile Picture</Button>
          </div>
          <div>
            <label className="block text-md font-semibold pl-2 mb-2">Name</label>
            <Input
              type="text"
              defaultValue={updatedUserData.name}
              placeholder="Enter your name"
              className="rounded-xl"
              onChange={(e) => setUpdatedUserData({ ...userData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-md font-semibold pl-2 mb-2">Username</label>
            <Input
              type="text"
              defaultValue={updatedUserData.username}
              placeholder="Enter your username"
              className="rounded-xl"
              onChange={(e) => setUpdatedUserData({ ...updatedUserData, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-md font-semibold pl-2 mb-2">About</label>
            <textarea
              className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-travel-900 min-h-[100px]"
              defaultValue={updatedUserData.bio}
              placeholder="Tell us about yourself"
              maxLength={250}
              onChange={(e) => setUpdatedUserData({ ...updatedUserData, bio: e.target.value })}
              />
          </div>
          <div>
            <label className="block text-md font-semibold pl-2 mb-2">Email</label>
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
            <label className="block text-md font-semibold pl-2 mb-2">Location</label>
            <Input
              type="text"
              defaultValue={updatedUserData.location}
              placeholder="Where are you based?"
              className="rounded-xl"
              onChange={(e) => setUpdatedUserData({ ...updatedUserData, location: e.target.value })}
            />
          </div>
          <Button onClick={() => handleSaveChanges('Profile')}>Save Changes</Button>
        </div>
      )
    },
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
            You will not be able to sign in and your profile will not be accessible. 
            Any reviews, photos, and tips that you have contributed may continue to be displayed on the site.
            </p>
            <a className="underline cursor-pointer hover:text-red-600" onClick={() => handleDeleteAccount()}>Delete</a>
          </div>
        </div>
      )
    },{
      title: "Content Visibility",
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
          <div>
            <label className="block text-md font-semibold mb-2">Blocked Users</label>
            <p className="text-sm text-gray-600 mb-4">
              Block users from viewing your profile and itineraries.
            </p>
            <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => toggleBlockedUsers()}>View Blocked Users</Button>
            </div>
          </div>
          <Button className="mt-4" onClick={() => handleSaveChanges('Content Visibility')}>Save Changes</Button>
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
          <Button className="mt-4" onClick={() => handleSaveChanges('Notifications')}>Save Changes</Button>
        </div>
      )
    },
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
    <div className="min-h-screen h-[calc(100vh-64px)] bg-white lg:bg-gray-50">
      <div className="h-full min-h-fit">
        <div className="p-6 grid md:grid-cols-1 lg:grid-cols-3 space-y-6 lg:space-y-0 lg:gap-6 relative">
          {/* Left Column: Profile Header*/}
          <div className="bg-white lg:shadow-sm rounded-xl p-6 flex flex-col gap-8 relative">
            <ProfileHeader 
              user={userData}
              userStats={userStats}
            />
            <div className="border-t border-gray-200 py-4">
              <h2 className="text-3xl font-bold mb-4 pl-4">Account Settings</h2>
              <div className="space-y-2">
                {settingsSections.map((section) => (
                  <button
                    key={section.title}
                    onClick={() => handleSectionClick(section.title)}
                    className={`w-full p-4 md:rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors text-left ${
                      activeSection === section.title ? "md:bg-gray-100" : ""
                    }`}
                  >
                    <div className="w-full flex justify-between">
                      <div className="flex">
                        <h3 className="font-medium">{section.title}</h3>
                      </div>
                      <ChevronRight className="block lg:hidden" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Settings Content */}
          <div className="hidden lg:block col-span-2 p-2 md:p-0 h-full bg-white md:rounded-xl lg:shadow-sm md:p-6">
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
