import { createBrowserClient } from "@supabase/ssr";
// Tipos temporalmente deshabilitados - regenerar con: npx supabase gen types typescript
// import type { Database } from "@/types/supabase";

export function createClient() {
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
