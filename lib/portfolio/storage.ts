import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { defaultPortfolioContent } from "@/lib/portfolio/default-content";
import {
  portfolioContentSchema,
  type PortfolioContent
} from "@/lib/portfolio/schema";
import { getSupabaseEnv } from "@/lib/env";

const CONTENT_ID = "main";

export async function getPortfolioContent(): Promise<PortfolioContent> {
  if (!getSupabaseEnv().isConfigured) {
    return defaultPortfolioContent;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("portfolio_content")
    .select("content")
    .eq("id", CONTENT_ID)
    .maybeSingle();

  if (error || !data?.content) {
    return defaultPortfolioContent;
  }

  const parsed = portfolioContentSchema.safeParse(data.content);
  return parsed.success ? parsed.data : defaultPortfolioContent;
}

export async function savePortfolioContent(content: PortfolioContent) {
  const supabase = createSupabaseAdminClient();
  return supabase.from("portfolio_content").upsert({
    id: CONTENT_ID,
    content,
    updated_at: new Date().toISOString()
  });
}
