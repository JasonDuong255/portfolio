import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import {
  type AuthModeWithKey,
  type SupabaseContext,
  type SupabaseEnv,
  type WithSupabaseConfig,
  withSupabase
} from "@supabase/server";
import {
  createAdminClient,
  createContextClient,
  verifyCredentials
} from "@supabase/server/core";
import { getSupabaseServerEnv } from "@/lib/env";

export function getSupabaseServerSdkEnv(): Partial<SupabaseEnv> {
  const { url, publishableKey, secretKey, jwksUrl } = getSupabaseServerEnv();

  return {
    url: url ?? undefined,
    publishableKeys: publishableKey ? { default: publishableKey } : {},
    secretKeys: secretKey ? { default: secretKey } : {},
    jwks: jwksUrl ? new URL(jwksUrl) : undefined
  };
}

export function createSupabaseSdkAdminClient() {
  const { url, secretKey } = getSupabaseServerEnv();

  if (!url || !secretKey) {
    throw new Error(
      "Supabase server SDK is not configured. Add SUPABASE_URL and SUPABASE_SECRET_KEY to .env.local, then restart the server."
    );
  }

  return createAdminClient<any>({
    env: getSupabaseServerSdkEnv()
  });
}

export function withSupabaseRoute<Database = unknown>(
  config: WithSupabaseConfig,
  handler: (request: Request, ctx: SupabaseContext<Database>) => Promise<Response>
) {
  return withSupabase<Database>(
    {
      ...config,
      env: {
        ...getSupabaseServerSdkEnv(),
        ...config.env
      }
    },
    handler
  );
}

export async function createSupabaseCookieContext<Database = unknown>(
  options: { auth?: AuthModeWithKey | AuthModeWithKey[] } = { auth: "user" }
): Promise<
  { data: SupabaseContext<Database>; error: null } | { data: null; error: Error }
> {
  const env = getSupabaseServerSdkEnv();
  const publishableKey = env.publishableKeys?.default;

  if (!env.url || !publishableKey) {
    return {
      data: null,
      error: new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY.")
    };
  }

  const cookieStore = await cookies();
  const ssrClient = createServerClient(env.url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Proxy refreshes Supabase cookies for Server Components and routes.
        }
      }
    }
  });
  const {
    data: { session }
  } = await ssrClient.auth.getSession();

  const { data: auth, error } = await verifyCredentials(
    {
      token: session?.access_token ?? null,
      apikey: null
    },
    {
      auth: options.auth ?? "user",
      env
    }
  );

  if (error) {
    return { data: null, error };
  }

  return {
    data: {
      supabase: createContextClient<Database>({
        auth: {
          token: auth.token,
          keyName: auth.keyName
        },
        env
      }),
      supabaseAdmin: createAdminClient<Database>({ env }),
      userClaims: auth.userClaims,
      jwtClaims: auth.jwtClaims,
      authMode: auth.authMode
    },
    error: null
  };
}
