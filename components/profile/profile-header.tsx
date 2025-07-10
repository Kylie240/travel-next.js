import Image from "next/image"
import { Camera, MapPin, Minus, MinusCircle, Plus, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserData } from "@/lib/types"

interface ProfileHeaderProps {
  user: UserData
  onEditProfile: () => void
  disableEdit?: boolean
}

export function ProfileHeader({ user, onEditProfile, disableEdit = false }: ProfileHeaderProps) {
  return (
    <div className={`bg-white ${ !disableEdit ? 'rounded-2xl shadow-sm mb-8' : ''} p-6`}>
      {!disableEdit && 
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-32 h-32">
            <div className="w-32 h-32 relative rounded-full overflow-hidden">
              <Image
                src={user.image}
                alt={user.name}
                fill
                className="object-cover"
                sizes="(max-width: 128px) 100vw, 128px"
              />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="h-6 w-6 text-white" />
            </div>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left px-8">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-600 mb-4">@{user.username}</p>
            <p className="text-gray-600 mb-4">
              <MapPin className="inline-block h-4 w-4 mr-1" />
              {user.location} · Joined {user.joined}
            </p>
            <p className="font-semibold mb-4 max-w-2xl">{user.title}</p>
            {user.website && (
              <a 
                href={user.website}
                target="_blank"
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 mb-4 block"
              >
                {new URL(user.website).hostname}
              </a>
            )}
            <p className="text-gray-700 mb-4 max-w-2xl">{user.bio}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-4">
              <div>
                <div className="font-semibold">{user.stats.trips}</div>
                <div className="text-sm text-gray-600">Trips</div>
              </div>
              <div>
                <div className="font-semibold">{user.stats.followers}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              <div>
                <div className="font-semibold">{user.stats.following}</div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
              <div>
                <div className="font-semibold">{user.stats.likes}</div>
                <div className="text-sm text-gray-600">Likes</div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Button onClick={onEditProfile}>Edit Profile</Button>
              <Button variant="outline">Share Profile</Button>
            </div>
          </div>
        </div>
      } {disableEdit &&
        <div className="flex flex-col items-center gap-6">
          <div className="flex relative">
            <div className="relative w-32 h-32">
              <div className="w-24 h-24 relative rounded-full">
                <Image
                  src={user.image}
                  alt={user.name}
                  fill
                  className="object-cover rounded-full cursor-pointer"
                  sizes="(max-width: 128px) 100vw, 128px"
                />
                <div className="absolute block md:hidden -top-1 -right-3">
                  {user.isFollowing ? (
                    <div onClick={() => {}}><Minus className="h-[30px] w-[35px] px-[3px] py-[2px] cursor-pointer rounded-full border border-[3px] border-black bg-white hover:bg-gray-500 text-black" /></div>
                  ) : (
                    <div onClick={() => {}}><Plus className="h-[30px] w-[35px] px-[3px] py-[2px] cursor-pointer rounded-full border border-[3px] border-white bg-black hover:bg-gray-500 text-white" /></div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 text-left px-8">
              <div className="flex gap-4">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <div className="hidden md:block">
                  {user.isFollowing ? (
                    <Button variant="outline" style={{height: '30px', width : '90px'}} onClick={() => {}}>Following</Button>
                  ) : (
                    <Button style={{height: '30px', width : '90px', backgroundColor: 'black', color: 'white'}} onClick={() => {}}>Follow</Button>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-2">@{user.username}</p>
              <p className="text-gray-600 mb-4">
                <MapPin className="inline-block h-4 w-4 mr-1" />
                {user.location} · Joined {user.joined}
              </p>
            </div>
          </div>
        </div>
      }
    </div>
  )
} 