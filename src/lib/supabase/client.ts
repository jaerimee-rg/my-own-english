import { createBrowserClient } from "@supabase/ssr";

// Fallbacks let the app deploy and run in "preview mode" before real Supabase
// credentials are configured. Network calls fail gracefully (handled in UI).
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

/**
 * Supabase client for use in Client Components (browser).
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
