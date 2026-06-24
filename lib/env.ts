export function getSupabaseEnv() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY;

  return {
    url,
    publishableKey,
    isConfigured: Boolean(url && publishableKey)
  };
}

export function getSupabaseAdminEnv() {
  const url = process.env.SUPABASE_URL ?? getSupabaseEnv().url;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    url,
    secretKey,
    isConfigured: Boolean(url && secretKey)
  };
}

export function getSupabaseServerEnv() {
  const { url, publishableKey } = getSupabaseEnv();
  const { secretKey } = getSupabaseAdminEnv();
  const jwksUrl = process.env.SUPABASE_JWKS_URL;

  return {
    url: process.env.SUPABASE_URL ?? url,
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY ?? publishableKey,
    secretKey,
    jwksUrl,
    isConfigured: Boolean(
      (process.env.SUPABASE_URL ?? url) &&
        (process.env.SUPABASE_PUBLISHABLE_KEY ?? publishableKey) &&
        secretKey
    )
  };
}
