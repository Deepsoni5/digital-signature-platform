import { supabase } from "./supabase"

interface SyncUserParams {
    clerkId: string
    email: string
    fullName?: string | null
    imageUrl?: string | null
}

export async function syncUserToSupabase({
    clerkId,
    email,
    fullName,
    imageUrl,
}: SyncUserParams) {
    try {
        if (!supabase) {
            return { success: false, error: "Supabase not configured" }
        }
        const { data, error } = await supabase
            .from("users")
            .upsert(
                {
                    clerk_id: clerkId,
                    email: email,
                    full_name: fullName,
                    image_url: imageUrl,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "clerk_id" }
            )
            .select()
            .single()

        if (error) {
            console.error("Error syncing user to Supabase:", error)
            return { success: false, error }
        }

        return { success: true, data, isPremium: data?.is_premium || false }
    } catch (error) {
        console.error("Unexpected error in syncUserToSupabase:", error)
        return { success: false, error }
    }
}
