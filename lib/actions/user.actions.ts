"use server";

import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { UserStats } from "@/types/userStats";
import { Followers } from "@/types/followers";

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