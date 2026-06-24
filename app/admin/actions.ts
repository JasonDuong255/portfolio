"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/admin/auth";
import { getSupabaseEnv } from "@/lib/env";
import { portfolioContentSchema } from "@/lib/portfolio/schema";
import { savePortfolioContent } from "@/lib/portfolio/storage";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SaveContentState = {
  ok: boolean;
  message: string;
};

export async function loginAction(formData: FormData) {
  if (!getSupabaseEnv().isConfigured) {
    redirect("/admin/login?error=Supabase%20is%20not%20configured");
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin");
}

export async function signOutAction() {
  if (getSupabaseEnv().isConfigured) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/admin/login");
}

export async function saveContentAction(
  _previousState: SaveContentState,
  formData: FormData
): Promise<SaveContentState> {
  try {
    await assertAdmin();

    const rawContent = String(formData.get("content") ?? "");
    const json = JSON.parse(rawContent) as unknown;
    const content = portfolioContentSchema.parse(json);
    const { error } = await savePortfolioContent(content);

    if (error) {
      return {
        ok: false,
        message: error.message
      };
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return {
      ok: true,
      message: "Saved portfolio content."
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to save content."
    };
  }
}
