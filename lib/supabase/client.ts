import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";

export function createSupabaseBrowserClient() {
  const { url, publishableKey } = getSupabaseEnv();

  if (!url || !publishableKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createBrowserClient(url, publishableKey);
}
