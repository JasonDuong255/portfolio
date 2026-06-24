import { getSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminStatus = {
  isConfigured: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  email?: string;
  userId?: string;
};

export async function getAdminStatus(): Promise<AdminStatus> {
  if (!getSupabaseEnv().isConfigured) {
    return {
      isConfigured: false,
      isAuthenticated: false,
      isAdmin: false
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

  if (error || !user) {
    return {
      isConfigured: true,
      isAuthenticated: false,
      isAdmin: false
    };
  }

  const { data: admin } = await supabase
    .from("portfolio_admins")
    .select("user_id,email")
    .eq("user_id", user.id)
    .maybeSingle();
  const email = user.email ?? admin?.email;
  const isEnvAdmin = isAllowedAdminEmail(email);

  return {
    isConfigured: true,
    isAuthenticated: true,
    isAdmin: Boolean(admin) || isEnvAdmin,
    email,
    userId: user.id
  };
}

function isAllowedAdminEmail(email: string | undefined) {
  if (!email) {
    return false;
  }

  const allowedEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return allowedEmails.includes(email.toLowerCase());
}

export async function assertAdmin() {
  const status = await getAdminStatus();

  if (!status.isConfigured) {
    throw new Error("Supabase is not configured.");
  }

  if (!status.isAuthenticated) {
    throw new Error("You must sign in first.");
  }

  if (!status.isAdmin) {
    throw new Error("This account is not listed in portfolio_admins.");
  }

  return status;
}
