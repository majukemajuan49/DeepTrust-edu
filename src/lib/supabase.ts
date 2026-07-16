// =============================================================================
// DeepTrust-Edu — Supabase Client Utility
// =============================================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create a singleton client — gracefully handles missing env vars during build
function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client that won't crash at build time.
    // At runtime in the browser, env vars should be present.
    console.warn(
      "Supabase env vars not set. Create .env.local from .env.local.example"
    );
  }
  return createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder");
}

export const supabase = createSupabaseClient();
