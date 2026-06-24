import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminEnv } from "@/lib/env";

export function createSupabaseAdminClient() {
  const { url, secretKey } = getSupabaseAdminEnv();

  if (!url || !secretKey) {
    throw new Error(
      "Supabase admin key is not configured. Add SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY to .env.local, then restart the server."
    );
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
