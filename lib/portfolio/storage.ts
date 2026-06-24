import { existsSync } from "node:fs";
import path from "node:path";
import { getSupabaseEnv } from "@/lib/env";
import { defaultPortfolioContent } from "@/lib/portfolio/default-content";
import {
  portfolioContentSchema,
  type PortfolioContent,
  type PortfolioTheme
} from "@/lib/portfolio/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const CONTENT_ID = "main";
const publicDir = path.join(process.cwd(), "public");

type QueryResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

type ListResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

type DesignRow = {
  theme_name: string | null;
  background_image_url: string | null;
  color_space: string | null;
  color_ink: string | null;
  color_panel: string | null;
  color_panel_soft: string | null;
  color_chrome_start: string | null;
  color_chrome_end: string | null;
  color_accent: string | null;
  color_accent_alt: string | null;
  color_text: string | null;
  color_muted: string | null;
  color_line: string | null;
  color_glow: string | null;
  scanline_opacity: number | string | null;
  pixel_scale: number | string | null;
};

type WebUiRow = {
  browser_tab_name: string | null;
  intro_start: string | null;
  contacts_window_title: string | null;
  contacts_heading: string | null;
  contact_button: string | null;
  projects_window_title: string | null;
  project_link_label: string | null;
  taskbar_about_label: string | null;
  taskbar_presentation_label: string | null;
  taskbar_projects_label: string | null;
  taskbar_contacts_label: string | null;
};

type ProfileRow = {
  name: string | null;
  handle: string | null;
  title: string | null;
  tagline: string | null;
  avatar_url: string | null;
  hero_image_url: string | null;
  logo_text: string | null;
  logo_subtext: string | null;
  desktop_name: string | null;
};

type AboutRow = {
  window_title: string | null;
  paragraphs: string[] | null;
};

type PresentationRow = {
  window_title: string | null;
  education: string[] | null;
  main_skills: string[] | null;
};

type ContactRow = {
  id: string | null;
  type: PortfolioContent["contacts"][number]["type"] | null;
  label: string | null;
  value: string | null;
  href: string | null;
};

type SoftwareRow = {
  name: string | null;
  level: number | null;
};

type ProjectRow = {
  id: string | null;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  href: string | null;
  tags: string[] | null;
};

export async function getPortfolioContent(): Promise<PortfolioContent> {
  if (!getSupabaseEnv().isConfigured) {
    return withSafeAssetPaths(defaultPortfolioContent);
  }

  const supabase = await createSupabaseServerClient();
  const [
    design,
    ui,
    profile,
    about,
    presentation,
    contacts,
    software,
    projects
  ] = await Promise.all([
    asSingle<DesignRow>(
      supabase
        .from("portfolio_design_config")
        .select("*")
        .eq("id", CONTENT_ID)
        .maybeSingle()
    ),
    asSingle<WebUiRow>(
      supabase
        .from("portfolio_web_ui_content")
        .select("*")
        .eq("id", CONTENT_ID)
        .maybeSingle()
    ),
    asSingle<ProfileRow>(
      supabase
        .from("portfolio_profile_content")
        .select("*")
        .eq("id", CONTENT_ID)
        .maybeSingle()
    ),
    asSingle<AboutRow>(
      supabase
        .from("portfolio_about_content")
        .select("*")
        .eq("id", CONTENT_ID)
        .maybeSingle()
    ),
    asSingle<PresentationRow>(
      supabase
        .from("portfolio_presentation_content")
        .select("*")
        .eq("id", CONTENT_ID)
        .maybeSingle()
    ),
    asList<ContactRow>(
      supabase
        .from("portfolio_contacts")
        .select("*")
        .eq("site_id", CONTENT_ID)
        .order("sort_order", { ascending: true })
    ),
    asList<SoftwareRow>(
      supabase
        .from("portfolio_software_skills")
        .select("*")
        .eq("site_id", CONTENT_ID)
        .order("sort_order", { ascending: true })
    ),
    asList<ProjectRow>(
      supabase
        .from("portfolio_projects")
        .select("*")
        .eq("site_id", CONTENT_ID)
        .order("sort_order", { ascending: true })
    )
  ]);

  const reads = [design, ui, profile, about, presentation, contacts, software, projects];
  if (reads.some((result) => result.error)) {
    return getLegacyPortfolioContent(supabase);
  }

  const hasStructuredRows = Boolean(
    design.data ||
      ui.data ||
      profile.data ||
      about.data ||
      presentation.data ||
      contacts.data?.length ||
      software.data?.length ||
      projects.data?.length
  );

  if (!hasStructuredRows) {
    return getLegacyPortfolioContent(supabase);
  }

  const content: PortfolioContent = {
    profile: mapProfile(profile.data),
    contacts: mapContacts(contacts.data),
    about: mapAbout(about.data),
    presentation: {
      ...mapPresentation(presentation.data),
      software: mapSoftware(software.data)
    },
    projects: mapProjects(projects.data),
    theme: mapTheme(design.data),
    ui: mapWebUi(ui.data)
  };

  const parsed = portfolioContentSchema.safeParse(content);
  return withSafeAssetPaths(parsed.success ? parsed.data : defaultPortfolioContent);
}

export async function savePortfolioContent(content: PortfolioContent): Promise<{
  error: Error | null;
}> {
  const parsed = portfolioContentSchema.safeParse(content);
  if (!parsed.success) {
    return { error: new Error(parsed.error.message) };
  }

  const next = parsed.data;
  const supabase = createSupabaseAdminClient();
  const updatedAt = new Date().toISOString();

  const singleWrites = [
    supabase.from("portfolio_design_config").upsert(toDesignRow(next, updatedAt)),
    supabase.from("portfolio_web_ui_content").upsert(toWebUiRow(next, updatedAt)),
    supabase.from("portfolio_profile_content").upsert(toProfileRow(next, updatedAt)),
    supabase.from("portfolio_about_content").upsert(toAboutRow(next, updatedAt)),
    supabase
      .from("portfolio_presentation_content")
      .upsert(toPresentationRow(next, updatedAt))
  ];

  for (const write of singleWrites) {
    const { error } = await write;
    if (error) {
      return { error: new Error(error.message) };
    }
  }

  const listWrites = [
    replaceRows(
      supabase,
      "portfolio_contacts",
      next.contacts.map((contact, index) => ({
        site_id: CONTENT_ID,
        id: contact.id,
        sort_order: index,
        type: contact.type,
        label: contact.label,
        value: contact.value,
        href: contact.href,
        updated_at: updatedAt
      }))
    ),
    replaceRows(
      supabase,
      "portfolio_software_skills",
      next.presentation.software.map((skill, index) => ({
        site_id: CONTENT_ID,
        id: `software-${index + 1}`,
        sort_order: index,
        name: skill.name,
        level: skill.level,
        updated_at: updatedAt
      }))
    ),
    replaceRows(
      supabase,
      "portfolio_projects",
      next.projects.map((project, index) => ({
        site_id: CONTENT_ID,
        id: project.id,
        sort_order: index,
        title: project.title,
        subtitle: project.subtitle,
        description: project.description,
        image_url: project.imageUrl,
        href: project.href,
        tags: project.tags,
        updated_at: updatedAt
      }))
    )
  ];

  for (const write of listWrites) {
    const error = await write;
    if (error) {
      return { error };
    }
  }

  const { error } = await supabase.from("portfolio_content").upsert({
    id: CONTENT_ID,
    content: next,
    updated_at: updatedAt
  });

  return { error: error ? new Error(error.message) : null };
}

async function getLegacyPortfolioContent(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<PortfolioContent> {
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

async function replaceRows(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  table: string,
  rows: Array<Record<string, unknown>>
) {
  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .eq("site_id", CONTENT_ID);

  if (deleteError) {
    return new Error(deleteError.message);
  }

  if (rows.length === 0) {
    return null;
  }

  const { error: insertError } = await supabase.from(table).insert(rows);
  return insertError ? new Error(insertError.message) : null;
}

function asSingle<T>(query: unknown) {
  return query as PromiseLike<QueryResult<T>>;
}

function asList<T>(query: unknown) {
  return query as PromiseLike<ListResult<T>>;
}

function mapTheme(row: DesignRow | null): PortfolioTheme {
  const fallback = defaultPortfolioContent.theme;

  return {
    name: textOr(row?.theme_name, fallback.name),
    backgroundImageUrl: textOr(
      row?.background_image_url,
      fallback.backgroundImageUrl
    ),
    colors: {
      space: textOr(row?.color_space, fallback.colors.space),
      ink: textOr(row?.color_ink, fallback.colors.ink),
      panel: textOr(row?.color_panel, fallback.colors.panel),
      panelSoft: textOr(row?.color_panel_soft, fallback.colors.panelSoft),
      chromeStart: textOr(row?.color_chrome_start, fallback.colors.chromeStart),
      chromeEnd: textOr(row?.color_chrome_end, fallback.colors.chromeEnd),
      accent: textOr(row?.color_accent, fallback.colors.accent),
      accentAlt: textOr(row?.color_accent_alt, fallback.colors.accentAlt),
      text: textOr(row?.color_text, fallback.colors.text),
      muted: textOr(row?.color_muted, fallback.colors.muted),
      line: textOr(row?.color_line, fallback.colors.line),
      glow: textOr(row?.color_glow, fallback.colors.glow)
    },
    scanlineOpacity: numberOr(row?.scanline_opacity, fallback.scanlineOpacity),
    pixelScale: numberOr(row?.pixel_scale, fallback.pixelScale)
  };
}

function mapWebUi(row: WebUiRow | null): PortfolioContent["ui"] {
  const fallback = defaultPortfolioContent.ui;

  return {
    browserTabName: textOr(row?.browser_tab_name, fallback.browserTabName),
    introStart: textOr(row?.intro_start, fallback.introStart),
    contactsWindowTitle: row?.contacts_window_title ?? fallback.contactsWindowTitle,
    contactsHeading: textOr(row?.contacts_heading, fallback.contactsHeading),
    contactButton: textOr(row?.contact_button, fallback.contactButton),
    projectsWindowTitle: textOr(
      row?.projects_window_title,
      fallback.projectsWindowTitle
    ),
    projectLinkLabel: textOr(row?.project_link_label, fallback.projectLinkLabel),
    taskbarLabels: {
      about: textOr(row?.taskbar_about_label, fallback.taskbarLabels.about),
      presentation: textOr(
        row?.taskbar_presentation_label,
        fallback.taskbarLabels.presentation
      ),
      projects: textOr(row?.taskbar_projects_label, fallback.taskbarLabels.projects),
      contacts: textOr(row?.taskbar_contacts_label, fallback.taskbarLabels.contacts)
    }
  };
}

function mapProfile(row: ProfileRow | null): PortfolioContent["profile"] {
  const fallback = defaultPortfolioContent.profile;

  return {
    name: textOr(row?.name, fallback.name),
    handle: textOr(row?.handle, fallback.handle),
    title: textOr(row?.title, fallback.title),
    tagline: textOr(row?.tagline, fallback.tagline),
    avatarUrl: textOr(row?.avatar_url, fallback.avatarUrl),
    heroImageUrl: textOr(row?.hero_image_url, fallback.heroImageUrl),
    logoText: textOr(row?.logo_text, fallback.logoText),
    logoSubtext: textOr(row?.logo_subtext, fallback.logoSubtext),
    desktopName: textOr(row?.desktop_name, fallback.desktopName)
  };
}

function mapAbout(row: AboutRow | null): PortfolioContent["about"] {
  const fallback = defaultPortfolioContent.about;

  return {
    windowTitle: textOr(row?.window_title, fallback.windowTitle),
    paragraphs: nonEmptyArray(row?.paragraphs, fallback.paragraphs)
  };
}

function mapPresentation(
  row: PresentationRow | null
): Omit<PortfolioContent["presentation"], "software"> {
  const fallback = defaultPortfolioContent.presentation;

  return {
    windowTitle: textOr(row?.window_title, fallback.windowTitle),
    education: nonEmptyArray(row?.education, fallback.education),
    mainSkills: nonEmptyArray(row?.main_skills, fallback.mainSkills)
  };
}

function mapContacts(rows: ContactRow[] | null): PortfolioContent["contacts"] {
  if (!rows?.length) {
    return defaultPortfolioContent.contacts;
  }

  return rows.map((row, index) => ({
    id: textOr(row.id, `contact-${index + 1}`),
    type: row.type ?? "website",
    label: textOr(row.label, "Website"),
    value: textOr(row.value, "@handle"),
    href: textOr(row.href, "https://")
  }));
}

function mapSoftware(rows: SoftwareRow[] | null) {
  if (!rows?.length) {
    return defaultPortfolioContent.presentation.software;
  }

  return rows.map((row) => ({
    name: textOr(row.name, "Skill"),
    level: Math.round(numberOr(row.level, 0))
  }));
}

function mapProjects(rows: ProjectRow[] | null): PortfolioContent["projects"] {
  if (!rows?.length) {
    return defaultPortfolioContent.projects;
  }

  return rows.map((row, index) => ({
    id: textOr(row.id, `project-${index + 1}`),
    title: textOr(row.title, "Project"),
    subtitle: textOr(row.subtitle, "Case study"),
    description: textOr(row.description, "Project description."),
    imageUrl: textOr(row.image_url, defaultPortfolioContent.projects[0].imageUrl),
    href: textOr(row.href, "https://"),
    tags: nonEmptyArray(row.tags, ["Portfolio"])
  }));
}

function toDesignRow(content: PortfolioContent, updatedAt: string) {
  return {
    id: CONTENT_ID,
    theme_name: content.theme.name,
    background_image_url: content.theme.backgroundImageUrl,
    color_space: content.theme.colors.space,
    color_ink: content.theme.colors.ink,
    color_panel: content.theme.colors.panel,
    color_panel_soft: content.theme.colors.panelSoft,
    color_chrome_start: content.theme.colors.chromeStart,
    color_chrome_end: content.theme.colors.chromeEnd,
    color_accent: content.theme.colors.accent,
    color_accent_alt: content.theme.colors.accentAlt,
    color_text: content.theme.colors.text,
    color_muted: content.theme.colors.muted,
    color_line: content.theme.colors.line,
    color_glow: content.theme.colors.glow,
    scanline_opacity: content.theme.scanlineOpacity,
    pixel_scale: content.theme.pixelScale,
    updated_at: updatedAt
  };
}

function toWebUiRow(content: PortfolioContent, updatedAt: string) {
  return {
    id: CONTENT_ID,
    browser_tab_name: content.ui.browserTabName,
    intro_start: content.ui.introStart,
    contacts_window_title: content.ui.contactsWindowTitle,
    contacts_heading: content.ui.contactsHeading,
    contact_button: content.ui.contactButton,
    projects_window_title: content.ui.projectsWindowTitle,
    project_link_label: content.ui.projectLinkLabel,
    taskbar_about_label: content.ui.taskbarLabels.about,
    taskbar_presentation_label: content.ui.taskbarLabels.presentation,
    taskbar_projects_label: content.ui.taskbarLabels.projects,
    taskbar_contacts_label: content.ui.taskbarLabels.contacts,
    updated_at: updatedAt
  };
}

function toProfileRow(content: PortfolioContent, updatedAt: string) {
  return {
    id: CONTENT_ID,
    name: content.profile.name,
    handle: content.profile.handle,
    title: content.profile.title,
    tagline: content.profile.tagline,
    avatar_url: content.profile.avatarUrl,
    hero_image_url: content.profile.heroImageUrl,
    logo_text: content.profile.logoText,
    logo_subtext: content.profile.logoSubtext,
    desktop_name: content.profile.desktopName,
    updated_at: updatedAt
  };
}

function toAboutRow(content: PortfolioContent, updatedAt: string) {
  return {
    id: CONTENT_ID,
    window_title: content.about.windowTitle,
    paragraphs: content.about.paragraphs,
    updated_at: updatedAt
  };
}

function toPresentationRow(content: PortfolioContent, updatedAt: string) {
  return {
    id: CONTENT_ID,
    window_title: content.presentation.windowTitle,
    education: content.presentation.education,
    main_skills: content.presentation.mainSkills,
    updated_at: updatedAt
  };
}

function textOr(value: string | null | undefined, fallback: string) {
  const next = value?.trim();
  return next ? next : fallback;
}

function numberOr(value: number | string | null | undefined, fallback: number) {
  const next = typeof value === "number" ? value : Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function nonEmptyArray(value: string[] | null | undefined, fallback: string[]) {
  const next = value?.filter((item) => item.trim());
  return next?.length ? next : fallback;
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
  next.theme.backgroundImageUrl = safeLocalAsset(
    next.theme.backgroundImageUrl,
    defaultPortfolioContent.theme.backgroundImageUrl
  );
  next.projects = next.projects.map((project, index) => ({
    ...project,
    imageUrl: safeLocalAsset(
      project.imageUrl,
      defaultPortfolioContent.projects[
        index % defaultPortfolioContent.projects.length
      ].imageUrl
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
