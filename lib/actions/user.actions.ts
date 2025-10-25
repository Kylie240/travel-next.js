"use server";

import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { UserStats } from "@/types/userStats";
import { Followers } from "@/types/followers";
import { UserData } from "../types";
import { ProfileData } from "@/types/profileData";
import createClient from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@/utils/supabase/server-admin"

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
    
      if (!user) throw new Error("Not authenticated")
    
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

        return data;
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
        .rpc("get_user_profile", { 
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