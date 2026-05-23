import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { TRIP_STATE_ID } from "@/lib/constants";

/** Server-only Supabase client (never import from client components) */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getTripStateId(): string {
  return process.env.TRIP_STATE_ID ?? TRIP_STATE_ID;
}
