export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return {
    url,
    publishableKey,
    isConfigured: Boolean(url && publishableKey)
  };
}

export function getSupabaseAdminEnv() {
  const { url } = getSupabaseEnv();
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    url,
    secretKey,
    isConfigured: Boolean(url && secretKey)
  };
}
