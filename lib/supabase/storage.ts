import "server-only";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error("Brak konfiguracji Supabase Storage.");
}

export const supabaseStorage = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const FAMILY_AVATARS_BUCKET = "family-avatars";
export const FAMILY_TRIPS_BUCKET = "family-trips";
