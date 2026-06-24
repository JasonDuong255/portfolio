import { existsSync } from "node:fs";
import path from "node:path";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { defaultPortfolioContent } from "@/lib/portfolio/default-content";
import {
  portfolioContentSchema,
  type PortfolioContent
} from "@/lib/portfolio/schema";
import { getSupabaseEnv } from "@/lib/env";

const CONTENT_ID = "main";
const publicDir = path.join(process.cwd(), "public");

export async function getPortfolioContent(): Promise<PortfolioContent> {
  if (!getSupabaseEnv().isConfigured) {
    return withSafeAssetPaths(defaultPortfolioContent);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("portfolio_content")
    .select("content")
    .eq("id", CONTENT_ID)
    .maybeSingle();

  if (error || !data?.content) {
    return withSafeAssetPaths(defaultPortfolioContent);
  }

  const parsed = portfolioContentSchema.safeParse(data.content);
  return withSafeAssetPaths(parsed.success ? parsed.data : defaultPortfolioContent);
}

export async function savePortfolioContent(content: PortfolioContent) {
  const supabase = createSupabaseAdminClient();
  return supabase.from("portfolio_content").upsert({
    id: CONTENT_ID,
    content,
    updated_at: new Date().toISOString()
  });
}

function withSafeAssetPaths(content: PortfolioContent): PortfolioContent {
  const next = structuredClone(content);

  next.profile.avatarUrl = safeLocalAsset(
    next.profile.avatarUrl,
    defaultPortfolioContent.profile.avatarUrl
  );
  next.profile.heroImageUrl = safeLocalAsset(
    next.profile.heroImageUrl,
    defaultPortfolioContent.profile.heroImageUrl
  );
  next.projects = next.projects.map((project, index) => ({
    ...project,
    imageUrl: safeLocalAsset(
      project.imageUrl,
      defaultPortfolioContent.projects[index % defaultPortfolioContent.projects.length]
        .imageUrl
    )
  }));

  return next;
}

function safeLocalAsset(value: string, fallback: string) {
  if (!value.trim()) {
    return fallback;
  }

  if (!value.startsWith("/")) {
    return value;
  }

  const assetPath = path.normalize(value).replace(/^(\.\.[/\\])+/, "");
  const absolutePath = path.join(publicDir, assetPath);

  return existsSync(absolutePath) ? value : fallback;
}
