"use server";

import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { UserStats } from "@/types/userStats";
import { Followers } from "@/types/followers";
import { UserData } from "../types";
import { ProfileData } from "@/types/profileData";

export const getUserDataById = async (userId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });
        
        // Verify user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            throw new Error("Not authenticated");
        }

        // Delete the itinerary
        const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

        if (userError) {
            throw userError;
        }

        return userData;
    } catch (error) {
        throw new Error(`Failed to save user: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const getUserProfileById = async (userId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data, error } = await supabase
        .from('users')
        .select('name, username, avatar')
        .eq('id', userId)
        .single();

        if (error) {
            throw new Error(error.message);
        } 

        return data;
    } catch (error) {
        throw new Error(`Failed to get user profile: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const getUserStatsById = async (userId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data, error } = await supabase
        .rpc("get_user_stats", { p_user_id: userId }) as { 
            data: UserStats | null, 
            error: Error | null 
        };

        if (error) {
            throw new Error(error.message);
        } 

        return data;
    } catch (error) {
        throw new Error(`Failed to get user stats: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// following methods
export const addFollow = async (userId: string, followingId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }
    
    try {
        const supabase = createServerActionClient({ cookies });
        
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
    } catch (error) {
        throw new Error(`Failed to follow user: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const removeFollow = async (userId: string, followingId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }
    
    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data: userData, error: userError } = await supabase
        .from('users_following')
        .delete()
        .eq('user_id', userId)
        .eq('following_id', followingId);

        if (userError) {
            throw userError;
        }

        return userData;
    } catch (error) {
        throw new Error(`Failed to remove follow: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const addFollower = async (userId: string, followerId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }
    
    try {
        const supabase = createServerActionClient({ cookies });
        
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
    } catch (error) {
        throw new Error(`Failed to add follower: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const removeFollower = async (userId: string, followerId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }
    
    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data: userData, error: userError } = await supabase
        .from('users_followers')
        .delete()
        .eq('user_id', userId)
        .eq('follower_id', followerId);

        if (userError) {
            throw userError;
        }

        return userData;
    } catch (error) {
        throw new Error(`Failed to remove follower: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const getFollowersById = async (userId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data, error } = await supabase
        .rpc("get_user_followers", { p_user_id: userId }) as { 
            data: Followers[] | null, 
            error: Error | null 
        };

        if (error) {
            throw new Error(error.message);
        } 

        return data;
    } catch (error) {
        throw new Error(`Failed to get user stats: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const getFollowingById = async (userId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data, error } = await supabase
        .rpc("get_user_following", { p_user_id: userId }) as { 
            data: Followers[] | null, 
            error: Error | null 
        };

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        throw new Error(`Failed to get user following: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// blocking mathods
export const getBlockedUsersById = async (userId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data, error } = await supabase
        .rpc("get_blocked_users", { p_user_id: userId }) as { 
            data: Followers[] | null, 
            error: Error | null 
        };

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        throw new Error(`Failed to get blocked users: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const blockUser = async (userId: string, blockedUserId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });
        
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
    } catch (error) {
        throw new Error(`Failed to block user: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const removeBlockedUser = async (userId: string, blockedUserId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }
    
    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data, error } = await supabase
        .from('users_blocked')
        .delete()
        .eq('user_id', userId)
        .eq('blocked_id', blockedUserId);

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        throw new Error(`Failed to remove blocked user: ${error instanceof Error ? error.message : String(error)}`);
    }
}

//profile methods
export const getUserByUsername = async (username: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

        if (error) {
            throw new Error(error.message);
        } 

        return data;
    } catch (error) {
        throw new Error(`Failed to get user by username: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const getProfileDataByUsername = async (username: string) => {
    try {
        const supabase = createServerActionClient({ cookies });
        
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
    } catch (error) {
        throw new Error(`Failed to get user profile data: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const getProfileDataById = async (profileId: string, userId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });
        
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
    } catch (error) {
        throw new Error(`Failed to get user profile data: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const getUserSettingsById = async (userId: string) => {

    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data, error } = await supabase
        .from('users_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        throw new Error(`Failed to get user settings: ${error instanceof Error ? error.message : String(error)}`);
    }
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
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }
    
    try {
        const supabase = createServerActionClient({ cookies })
    
        const { data, error } = await supabase
          .from("users")
          .update({
            ...updatedUserData,
          })
          .eq("id", userId)
          .select()
    
        if (error) return error
    
        return data
      } catch (err: any) {
        throw new Error(err.message)
      }
}

export const setContentData = async (
    userId: string, 
    updatedContentData: { 
        is_private: boolean,
        }
    ) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }
    
    try {
        const supabase = createServerActionClient({ cookies })
    
        const { data, error } = await supabase
          .from("users_settings")
          .update({
            ...updatedContentData,
          })
          .eq("user_id", userId)
          .select()
    
        if (error) throw error
    
        return data
      } catch (err: any) {
        throw new Error(err.message)
      }
}

export const setNotificationData = async (
    userId: string, 
    updatedContentData: { 
        email_notifications: boolean,
        }
    ) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }
    
    try {
        const supabase = createServerActionClient({ cookies })
    
        const { data, error } = await supabase
          .from("users_settings")
          .update({
            ...updatedContentData,
          })
          .eq("user_id", userId)
          .select()
    
        if (error) throw error
    
        return data
      } catch (err: any) {
        throw new Error(err.message)
      }
}

export const deleteAccount = async (userId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }
    
    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }
    catch (error) {
        throw new Error(`Failed to delete account: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const setUserAvatar = async (userId: string, avatar: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });
        
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
    catch (error) {
        throw new Error(`Failed to set user avatar: ${error instanceof Error ? error.message : String(error)}`);
    }
}