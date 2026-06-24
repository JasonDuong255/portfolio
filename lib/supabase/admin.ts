import "server-only";

import { createSupabaseSdkAdminClient } from "@/lib/supabase/server-sdk";

export function createSupabaseAdminClient() {
  return createSupabaseSdkAdminClient();
}
