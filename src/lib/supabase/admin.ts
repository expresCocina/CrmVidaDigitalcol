import { createClient as createSupabaseClient } from "@supabase/supabase-js";
// Tipos temporalmente deshabilitados - regenerar con: npx supabase gen types typescript
// import { Database } from "@/types/supabase";

/**
 * Creates an admin Supabase client with Service Role key
 * Use ONLY in Server Actions and API routes - NEVER expose to client
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Missing Supabase environment variables for admin client");
    }

    return createSupabaseClient<any>(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
