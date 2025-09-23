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
        console.error('Error saving user:', error);
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
            console.error('Error fetching user profile:', error);
            throw new Error(error.message);
        } 
        console.log(data);

        return data;
    } catch (error) {
        console.error('Error in getUserProfileById:', error);
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
        .rpc("get_user_stats_summary", { p_user_id: userId }) as { 
            data: UserStats | null, 
            error: Error | null 
        };

        if (error) {
            console.error('Error fetching user stats:', error);
            throw new Error(error.message);
        } 
        console.log(data);

        return data;
    } catch (error) {
        console.error('Error in getUserStatsById:', error);
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
        console.error('Error in addFollower:', error);
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
        console.error('Error in removeFollower:', error);
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
        console.error('Error in addFollower:', error);
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
        console.error('Error in removeFollower:', error);
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
            console.error('Error fetching followers:', error);
            throw new Error(error.message);
        } 
        console.log(data);

        return data;
    } catch (error) {
        console.error('Error in getFollowersById:', error);
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
            console.error('Error fetching following:', error);
            throw new Error(error.message);
        } 
        console.log(data);

        return data;
    } catch (error) {
            console.error('Error in getFollowingById:', error);
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
        .from('users_blocked')
        .select('*')
        .eq('user_id', userId)

        if (error) {
            console.error('Error fetching blocked users:', error);
            throw new Error(error.message);
        } 
        console.log(data);

        return data;
    } catch (error) {
        console.error('Error in getBlockedUsersById:', error);
        throw new Error(`Failed to get blocked users: ${error instanceof Error ? error.message : String(error)}`);
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
            console.error('Error fetching user by username:', error);
            throw new Error(error.message);
        } 

        return data;
    } catch (error) {
        console.error('Error in getUserByUsername:', error);
        throw new Error(`Failed to get user by username: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export const getProfileDataByUsername = async (username: string, userId: string) => {
    const token = cookies().get("sb-access-token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    try {
        const supabase = createServerActionClient({ cookies });
        
        const { data, error } = await supabase
        .rpc("get_user_profile_by_username", { 
            p_profile_username: username,
            p_viewer_user_id: userId
        }) as { 
        data: ProfileData | null, 
        error: Error | null 
        };

        if (error) {
            console.error('Error fetching profile data:', error);
            throw new Error(error.message);
        } 
        console.log(data);

        return data;
    } catch (error) {
            console.error('Error in getProfileDataById:', error);
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
            console.error('Error fetching profile data:', error);
            throw new Error(error.message);
        } 
        console.log(data);

        return data;
    } catch (error) {
            console.error('Error in getProfileDataById:', error);
        throw new Error(`Failed to get user profile data: ${error instanceof Error ? error.message : String(error)}`);
    }
}