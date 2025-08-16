import { createClient } from "@supabase/supabase-js";
import { auth } from "@/firebase/client";

export const createSupabaseClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            async accessToken() {
                const currentUser = auth.currentUser;
                return currentUser ? await currentUser.getIdToken() : null;
            }
        }
    )
}