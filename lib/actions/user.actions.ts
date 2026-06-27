"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { UserStats } from "@/types/userStats";
import { Followers } from "@/types/followers";
import { UserData } from "../types";
import { ProfileData } from "@/types/profileData";
import createClient from "@/utils/supabase/server";
import { createClient as createAdminClient, createClientIfConfigured } from "@/utils/supabase/server-admin"
import { sendPasswordResetEmail } from "@/lib/email";

export const getUserDataById = async () => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

        // Delete the itinerary
        const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

        if (userError) {
            throw userError;
        }

        return userData;
}

export const getUserProfileById = async (userId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) return null

      if (user.id !== userId) {
        throw new Error("Unauthorized")
      }
    
      const { data, error } = await supabase
        .from("users")
        .select("name, username, avatar")
        .eq("id", userId)
        .single()
    
      if (error) throw new Error(error.message)
    
      return data
}

export const getUserStatsById = async () => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")
        
        const { data, error } = await supabase
        .rpc("get_user_stats", { p_user_id: user.id }) as { 
            data: UserStats | null, 
            error: Error | null 
        };

        if (error) {
            throw new Error(error.message);
        } 

        return data;
}

// following methods
export const addFollow = async (userId: string, followingId: string) => {
    const supabase = await createClient()
        
        const { data: userData, error: userError } = await supabase
        .from('users_following')
        .insert({
            user_id: userId,
            following_id: followingId
        });

        if (userError) {
            throw userError;
        }

        return userData;
}

export const removeFollow = async (userId: string, followingId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")
        
        const { data: userData, error: userError } = await supabase
        .from('users_following')
        .delete()
        .eq('user_id', userId)
        .eq('following_id', followingId);

        if (userError) {
            throw userError;
        }

        return userData;
}

export const addFollower = async (userId: string, followerId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")
        
        const { data: userData, error: userError } = await supabase
        .from('users_followers')
        .insert({
            user_id: userId,
            follower_id: followerId
        });

        if (userError) {
            throw userError;
        }

        return userData;
}

export const removeFollower = async (userId: string, followerId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")
        
        const { data: userData, error: userError } = await supabase
        .from('users_followers')
        .delete()
        .eq('user_id', userId)
        .eq('follower_id', followerId);

        if (userError) {
            throw userError;
        }

        return userData;
}

export const getFollowersById = async (userId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")
        
        const { data, error } = await supabase
        .rpc("get_user_followers", { p_user_id: userId }) as { 
            data: Followers[] | null, 
            error: Error | null 
        };

        if (error) {
            throw new Error(error.message);
        } 

        return data;
}

export const getFollowingById = async (userId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")
        
        const { data, error } = await supabase
        .rpc("get_user_following", { p_user_id: userId }) as { 
            data: Followers[] | null, 
            error: Error | null 
        };

        if (error) {
            throw new Error(error.message);
        }

        return data;
}

// blocking mathods
export const getBlockedUsersById = async (userId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")
        
        const { data, error } = await supabase
        .rpc("get_blocked_users", { p_user_id: userId }) as { 
            data: Followers[] | null, 
            error: Error | null 
        };

        if (error) {
            throw new Error(error.message);
        }

        return data;
}

export const blockUser = async (userId: string, blockedUserId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")
      if (user.id !== userId) throw new Error("Not authorized")
        
        const { data, error } = await supabase
        .from('users_blocked')
        .insert([
            {
                user_id: userId,
                blocked_id: blockedUserId
            }
        ]);

        if (error) {
            throw new Error(error.message);
        }

        const admin = createClientIfConfigured()
        const db = admin ?? supabase

        // Stop blocker following blocked user
        await db
          .from('users_following')
          .delete()
          .eq('user_id', userId)
          .eq('following_id', blockedUserId)

        // Remove blocked user from following the blocker
        await db
          .from('users_following')
          .delete()
          .eq('user_id', blockedUserId)
          .eq('following_id', userId)

        await db
          .from('users_followers')
          .delete()
          .eq('user_id', userId)
          .eq('follower_id', blockedUserId)

        await db
          .from('users_followers')
          .delete()
          .eq('user_id', blockedUserId)
          .eq('follower_id', userId)

        await revalidateBlockedProfile(supabase, blockedUserId)

        return data;
}

async function revalidateBlockedProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  blockedUserId: string
) {
  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("id", blockedUserId)
    .maybeSingle()

  if (profile?.username) {
    revalidatePath(`/profile/${profile.username}`)
  }
  revalidatePath("/profile/[username]", "page")
}

export const removeBlockedUser = async (userId: string, blockedUserId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")
        
        const { data, error } = await supabase
        .from('users_blocked')
        .delete()
        .eq('user_id', userId)
        .eq('blocked_id', blockedUserId);

        if (error) {
            throw new Error(error.message);
        }

        await revalidateBlockedProfile(supabase, blockedUserId)

        return data;
}

//profile methods
export const getUserByUsername = async (username: string) => {
    const supabase = await createClient()

        const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

        if (error) {
            throw new Error(error.message);
        } 

        return data;
}

export const getProfileDataByUsername = async (username: string) => {
    const supabase = await createClient()
        
        const { data, error } = await supabase
        .rpc("get_user_profile_by_username", { 
            p_profile_username: username,
        }) as { 
        data: ProfileData | null, 
        error: Error | null 
        };

        if (error) {
            throw new Error(error.message);
        }

        return data;
}

export const getProfileDataById = async (profileId: string, userId: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

        const { data, error } = await supabase
        .rpc("get_user_profile", { 
            p_profile_user_id: profileId,
            p_viewer_user_id: userId 
        }) as { 
        data: UserData | null, 
        error: Error | null 
        };

        if (error) {
            throw new Error(error.message);
        }

        return data;
}

export const getUserSettingsById = async () => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

        const { data, error } = await supabase
        .from('users_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
}

// edit profile methods
export const setProfileData = async (
    userId: string, 
    updatedUserData: { 
        name?: string, 
        username?: string, 
        bio?: string, 
        location?: string,
        email?: string,
        avatar?: string,
        facebook?: string,
        instagram?: string,
        twitter?: string,
        pinterest?: string,
        tiktok?: string,
        youtube?: string,
        }
    ) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")
    
        const { data, error } = await supabase
          .from("users")
          .update({
            ...updatedUserData,
          })
          .eq("id", userId)
          .select()
    
        if (error) return error
    
        return data
}

export const setContentData = async (
    userId: string, 
    updatedContentData: { 
        is_private: boolean,
        }
    ) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")
    
        const { data, error } = await supabase
          .from("users_settings")
          .update({
            ...updatedContentData,
          })
          .eq("user_id", userId)
          .select()
    
        if (error) throw error
    
        return data
}

export const setNotificationData = async (
    userId: string, 
    updatedContentData: { 
        email_notifications: boolean,
        }
    ) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")
        
        const { data, error } = await supabase
          .from("users_settings")
          .update({
            ...updatedContentData,
          })
          .eq("user_id", userId)
          .select()
    
        if (error) throw error
    
        return data
}

export const deleteAccount = async (userId: string) => {
    const supabase = await createAdminClient()

        const { error: authError } = await supabase.auth.admin.deleteUser(userId)
        if (authError) {
            throw new Error(`Failed to delete account: ${authError.message}`);
        }
        
        const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

        if (error) {
            throw new Error(error.message);
        }

        return data;
}

export const setUserAvatar = async (userId: string, avatar: string) => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()
    
      if (!user) throw new Error("Not authenticated")

        const { data, error } = await supabase
        .from('users')
        .update({ avatar: avatar })
        .eq('id', userId)
        .select()

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export const searchUsers = async (searchQuery: string, currentUserId?: string) => {
    const supabase = await createClient()
    
    if (!searchQuery || searchQuery.trim() === '') {
        return []
    }

    const query = searchQuery.toLowerCase().trim()
    
    // Search users by name or username
    const { data, error } = await supabase
        .from('users')
        .select('id, name, username, avatar, bio')
        .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(50)

    if (error) {
        throw new Error(error.message)
    }

    // Get following status for each user if currentUserId is provided
    if (currentUserId && data) {
        const userIds = data.map(user => user.id)
        const { data: followingData } = await supabase
            .from('users_following')
            .select('following_id')
            .eq('user_id', currentUserId)
            .in('following_id', userIds)

        const followingIds = new Set(followingData?.map(f => f.following_id) || [])

        return data.map(user => ({
            ...user,
            isFollowing: followingIds.has(user.id)
        }))
    }

    return data || []
}

export const linkPurchasesToUser = async () => {
    const supabase = await createClient()
    const {
        data: { user },
      } = await supabase.auth.getUser()

    if (!user || !user.email) return

    const { error } = await supabase
      .from("itinerary_purchases")
      .update({ user_id: user.id })
      .is("user_id", null)
      .eq("customer_email", user.email)

    if (error) {
        throw new Error(error.message)
    }
}

function getAppBaseUrl(requestOrigin?: string) {
    const origin = requestOrigin?.trim().replace(/\/$/, "")
    if (origin) return origin

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "")
    if (siteUrl) return siteUrl

    if (process.env.NODE_ENV === "development") {
        return `http://localhost:${process.env.PORT || 3000}`
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`
    }

    return "http://localhost:3000"
}

/** Generate a Supabase recovery link and send it via Resend (no Supabase email). */
export async function requestPasswordReset(email: string, requestOrigin?: string) {
    try {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
            return { success: false, error: "Email is required" };
        }

        const admin = createClientIfConfigured();
        if (!admin) {
            console.error(
                "Password reset misconfigured: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is missing"
            );
            return {
                success: false,
                error: "Password reset is temporarily unavailable. Please try again later.",
            };
        }

        const baseUrl = getAppBaseUrl(requestOrigin);

        const { data, error } = await admin.auth.admin.generateLink({
            type: "recovery",
            email: normalizedEmail,
            options: {
                redirectTo: `${baseUrl}/auth/reset-password`,
            },
        });

        // Always return success when link generation fails to avoid account enumeration
        if (error || !data?.properties?.hashed_token) {
            if (error) {
                console.error("Password reset link generation error:", error.message);
            }
            return { success: true };
        }

        // Build our own link so Supabase can't override redirect_to with the project Site URL
        const resetLink = `${baseUrl}/api/auth/confirm?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=recovery`;

        const sendResult = await sendPasswordResetEmail(
            normalizedEmail,
            resetLink
        );

        if (!sendResult.success) {
            console.error("Password reset email send failed:", sendResult.error);
            return { success: false, error: "Failed to send reset email. Please try again." };
        }

        return { success: true };
    } catch (err) {
        console.error("requestPasswordReset failed:", err);
        return {
            success: false,
            error: "Failed to send reset email. Please try again.",
        };
    }
}

/** Update password during recovery flow (uses server session cookies). */
export async function updatePassword(password: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: "Auth session missing. Please request a new reset link.",
            };
        }

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error("updatePassword failed:", err);
        return {
            success: false,
            error: "Failed to update password. Please try again.",
        };
    }
}