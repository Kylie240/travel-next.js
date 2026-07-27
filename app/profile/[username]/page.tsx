import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { getItineraryDataByUserId } from "@/lib/actions/itinerary.actions";
import { getProfileDataByUsername } from "@/lib/actions/user.actions";
import { Facebook, Instagram, PenSquare, Twitter } from "lucide-react";
import { FaPinterestP } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { FaTiktok, FaUserLarge, FaXTwitter } from "react-icons/fa6";
import ShareProfileButton from "./share-profile";
import ItineraryGrid from "./itinerary-grid";
import createClient from "@/utils/supabase/server";
import { AiOutlineYoutube } from "react-icons/ai";
import { redirect } from "next/navigation";
import ProfileActions from "./profile-actions";
import { JsonLd, buildPersonJsonLd } from "@/lib/seo/json-ld";

type ProfilePageParams = { username: string };

type ProfileSeoFields = {
  userId?: string;
  name?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  isPrivate?: boolean;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  pinterest?: string;
  tiktok?: string;
  youtube?: string;
};

function unwrapProfile(
  data: Awaited<ReturnType<typeof getProfileDataByUsername>>
): ProfileSeoFields | null {
  if (!data) return null;
  if (Array.isArray(data)) return (data[0] as ProfileSeoFields) || null;
  return data as ProfileSeoFields;
}

function buildProfileMetadata(profile: ProfileSeoFields): Metadata {
  const username = (profile.username || "").trim().toLowerCase();
  const name = profile.name?.trim() || username || "Traveler";
  const isPrivate = Boolean(profile.isPrivate);
  const canonicalPath = `/profile/${encodeURIComponent(username)}`;
  const description = isPrivate
    ? `${name} on Journli.`
    : profile.bio?.trim().slice(0, 160) ||
      `Travel itineraries by ${name} (@${username}) on Journli.`;

  return {
    title: `${name} (@${username})`,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: isPrivate
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: `${name} (@${username})`,
      description,
      url: canonicalPath,
      type: "profile",
      images: !isPrivate && profile.avatar ? [{ url: profile.avatar }] : [],
    },
    twitter: {
      card: profile.avatar && !isPrivate ? "summary" : "summary",
      title: `${name} (@${username})`,
      description,
      images: !isPrivate && profile.avatar ? [profile.avatar] : [],
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: ProfilePageParams;
}): Promise<Metadata> {
  try {
    const profile = unwrapProfile(
      await getProfileDataByUsername(params.username.toLowerCase())
    );
    if (!profile?.userId || !profile.username) {
      return { title: "Profile", robots: { index: false, follow: false } };
    }
    return buildProfileMetadata(profile);
  } catch {
    return { title: "Profile", robots: { index: false, follow: false } };
  }
}

export default async function UserProfilePage({ params }: { params: { username: string } }) {
const { username } = params;
// const supabase = createServerComponentClient({ cookies })
const supabase = await createClient()
const { data: { user: currentUser } } = await supabase.auth.getUser()
const userData = await getProfileDataByUsername(username.toLowerCase())
if (!userData || !userData[0]?.userId) {
  redirect('/not-found')
}
const userId = userData[0]?.userId;
const isCurrentUser = userId == currentUser?.id;
let isPrivate = false;
if (userData[0]?.isPrivate && !isCurrentUser) {
  isPrivate = true;
}

let isBlockedByViewer = false;
if (currentUser && !isCurrentUser) {
  const { data: blockRow } = await supabase
    .from("users_blocked")
    .select("user_id")
    .eq("user_id", currentUser.id)
    .eq("blocked_id", userId)
    .maybeSingle();
  isBlockedByViewer = !!blockRow;
}

const itineraryData =
  !isPrivate && !isBlockedByViewer
    ? await getItineraryDataByUserId(userId, currentUser?.id || null)
    : [];
const { data: currentUserSaves } = currentUser
  ? await supabase
      .from("interactions_saves")
      .select("itinerary_id")
      .eq("user_id", currentUser.id)
  : { data: null };
const savedList = currentUserSaves
  ? currentUserSaves.map((save) => save.itinerary_id)
  : null;

  const profile = userData[0];
  const personJsonLd =
    !isPrivate && !isBlockedByViewer
      ? buildPersonJsonLd({
          name: profile.name,
          username: profile.username,
          bio: profile.bio,
          avatar: profile.avatar,
          sameAs: [
            profile.facebook,
            profile.instagram,
            profile.twitter,
            profile.pinterest,
            profile.tiktok,
            profile.youtube,
          ],
        })
      : null;

  return (
    <>
      {personJsonLd ? <JsonLd data={personJsonLd} /> : null}
    <div className="min-h-screen max-w-[1340px] mx-auto bg-white py-8 mb-4">
          <div className="container mx-auto px-6 sm:px-8 md:px-[3rem] lg:px-[6rem]">
            <div className="w-full flex flex-col justify-center">
              <div className="w-full flex items-center justify-start gap-6 mb-4">
                <div className="flex flex-col w-full items-center gap-2 md:gap-4">
                  {userData[0].avatar && userData[0].avatar !== "" ? (
                  <div className="w-[120px] h-[120px] relative rounded-full">
                      <Image
                        src={userData[0].avatar}
                        alt={userData[0].name}
                        fill
                        className="object-cover rounded-full cursor-pointer"
                        style={{ width: '100%', height: '100%' }}
                        priority
                      />
                    </div>
                  ) : (
                    <div className="w-[120px] h-[120px] relative rounded-full bg-gray-100 flex items-center justify-center">
                      <FaUserLarge className="h-14 w-14 text-gray-300" />
                    </div>
                  )}
                    { !isPrivate && !isBlockedByViewer ? (
                    <div className="flex flex-col gap-2 items-center justify-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <h1 className="text-4xl font-semibold">{userData[0].name}</h1>
                        <p className="text-gray-600 text-center">@ {userData[0].username}</p>
                      </div>
                      <p className="text-gray-700 text-center px-0 sm:px-4 text-sm md:text-md max-w-[500px] mx-4">{userData[0].bio}</p>
                      {isCurrentUser ? (
                        <div className="flex gap-2 mt-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Link href={`/account-settings?tab=${encodeURIComponent('Profile')}`}>
                              <Button className="w-full">Edit Profile</Button>
                            </Link>
                            <ShareProfileButton username={userData[0].username} />
                          </div>
                        </div>
                      ) : (
                        <ProfileActions
                          creatorId={userId}
                          userId={currentUser?.id ?? ""}
                          username={userData[0].username}
                        />
                      )}
                    </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <h1 className="text-4xl font-semibold">{userData[0].name}</h1>
                        <p className="text-gray-600 text-center">@{userData[0].username}</p>
                        <p className="text-gray-700 flex mt-2 text-center gap-1">
                          {isPrivate && (
                            <>
                              This user&apos;s profile is
                              <strong className="flex items-center gap-1">private</strong>
                            </>
                          )}
                        </p>
                        {isBlockedByViewer && (
                          <ProfileActions
                            creatorId={userId}
                            userId={currentUser?.id ?? ""}
                            username={userData[0].username}
                            isBlockedByViewer
                          />
                        )}
                      </div>
                    )}
                    {/* Social Links */}
                    {!isPrivate && !isBlockedByViewer && (
                    <div className="flex gap-3 mt-2">
                      {userData[0].facebook && (
                      <Link href={`${userData[0].facebook}`} target="_blank">
                        <Facebook className="h-6 w-6" />
                      </Link>
                      )}
                      {userData[0].instagram && (
                      <Link href={`${userData[0].instagram}`} target="_blank">
                        <Instagram className="h-6 w-6" />
                      </Link>
                      )}
                      {userData[0].twitter && (
                      <Link href={`${userData[0].twitter}`} target="_blank">
                        <FaXTwitter className="h-6 w-6" />
                      </Link>
                      )}
                      {userData[0].pinterest && (
                      <Link href={`${userData[0].pinterest}`} target="_blank">
                        <FaPinterestP className="h-6 w-6" />
                      </Link>
                      )}
                      {userData[0].tiktok && (
                      <Link href={`${userData[0].tiktok}`} target="_blank">
                        <FaTiktok className="h-6 w-6" />
                      </Link>
                      )}
                      {userData[0].youtube && (
                      <Link href={`${userData[0].youtube}`} target="_blank">
                        <AiOutlineYoutube className="h-6 w-6" />
                      </Link>
                      )}
                    </div>
                    )}
                </div>
              </div>
            </div>
            <div className="md:mt-4 mb-4 md:mb-8">
              {!isPrivate && !isBlockedByViewer && itineraryData?.length > 0 ? (
                <h2 className="my-3 md:my-6 font-bold py-4 border-b-2 border-gray-200 text-xl">Itineraries</h2>
              ) : !isPrivate && !isBlockedByViewer ? (
                <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed">
                  <div className="mb-4">
                    <PenSquare className="h-12 w-12 mx-auto text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Itineraries Found</h3>
                  { isCurrentUser && (
                    <> 
                    <p className="text-gray-600 mb-4">Start creating your first itinerary</p>
                    <Link href={`/create`}>
                        <Button variant="outline">
                            Create New Itinerary
                        </Button>
                    </Link>
                    </>
                  )}
                </div>
              ) : null}
              {(isPrivate || isBlockedByViewer) && (
                <h2 className="my-3 md:my-6 font-bold py-4 border-b-2 border-gray-200 text-xl">Itineraries</h2>
              )}
              <ItineraryGrid 
                key={`${userId}-${isBlockedByViewer}`}
                itineraryData={itineraryData}
                isPrivate={isPrivate}
                isBlockedByViewer={isBlockedByViewer}
                profileUserId={userId}
                isCurrentUser={isCurrentUser}
                currentUserId={currentUser?.id}
                savedList={savedList}
              />
            </div>
          </div>
        </div>
    </>
  )
}
