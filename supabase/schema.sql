create extension if not exists pgcrypto with schema extensions;

create table if not exists public.portfolio_content (
  id text primary key default 'main',
  content jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.portfolio_content (id, content)
values (
  'main',
  $portfolio$
  {
    "profile": {
      "name": "M. Choice",
      "handle": "@m_choice",
      "title": "Pixel Artist & Game Designer",
      "tagline": "Characters, tiny worlds, UI sprites, and game-ready charm.",
      "avatarUrl": "/assets/m-choice-avatar.png",
      "heroImageUrl": "/assets/m-choice-hero.png",
      "logoText": "PORTFOLIO",
      "logoSubtext": "M. CHOICE",
      "desktopName": "CHOICE_OS"
    },
    "contacts": [
      {
        "id": "email",
        "type": "email",
        "label": "Mail",
        "value": "mchoicegd@gmail.com",
        "href": "mailto:mchoicegd@gmail.com"
      },
      {
        "id": "linkedin",
        "type": "linkedin",
        "label": "LinkedIn",
        "value": "@mchoice",
        "href": "https://www.linkedin.com/"
      },
      {
        "id": "behance",
        "type": "behance",
        "label": "Behance",
        "value": "@m_choice",
        "href": "https://www.behance.net/"
      },
      {
        "id": "instagram",
        "type": "instagram",
        "label": "Instagram",
        "value": "@m.choice_",
        "href": "https://www.instagram.com/"
      }
    ],
    "about": {
      "windowTitle": "About_Me.txt",
      "paragraphs": [
        "I'm Choice, a digital artist specialized in pixel art. I create characters, environments, objects, animations, and tiny interface details for games.",
        "I grew up around digital games, then found drawing as a way to step inside those worlds instead of only playing through them.",
        "My work is focused, versatile, and fast-moving: a mix of playful sprites, readable silhouettes, and small moments that make a screen feel alive.",
        "My professional goal is to work in a game studio, improve my craft, and keep building worlds that feel handmade."
      ]
    },
    "presentation": {
      "windowTitle": "Apresentation.txt",
      "education": [
        "Studying Design - UCDB (Catholic University of Dom Bosco) 2024-2026",
        "Game Designer and Unity Developer - EBAC 2023 (Studying)",
        "Domestika - Character Design for Animation in Games 2023"
      ],
      "software": [
        { "name": "Photoshop", "level": 5 },
        { "name": "Aseprite", "level": 4 },
        { "name": "Unity 2D", "level": 3 }
      ],
      "mainSkills": [
        "English and Portuguese knowledge",
        "Teamwork",
        "Fast self-learning",
        "Versatility"
      ]
    },
    "projects": [
      {
        "id": "sprites",
        "title": "Sprite Pack 01",
        "subtitle": "Game-ready character loop",
        "description": "Idle, walk, hit, and blink frames with a restrained palette for easy in-engine readability.",
        "imageUrl": "/assets/m-choice-about.png",
        "href": "https://www.behance.net/",
        "tags": ["Aseprite", "Animation", "Character"]
      },
      {
        "id": "ui",
        "title": "Nebula OS",
        "subtitle": "Pixel interface kit",
        "description": "Window chrome, icons, scrollbars, taskbar states, and a tiny desktop language for a game menu.",
        "imageUrl": "/assets/m-choice-presentation.png",
        "href": "https://www.behance.net/",
        "tags": ["UI", "Pixel Art", "Game Menu"]
      },
      {
        "id": "scene",
        "title": "Soft Orbit",
        "subtitle": "Environment study",
        "description": "A starfield composition built from chunky shadows, magenta light, and low-resolution texture.",
        "imageUrl": "/assets/m-choice-hero.png",
        "href": "https://www.behance.net/",
        "tags": ["Environment", "Palette", "Dither"]
      }
    ],
    "theme": {
      "name": "Nebula Candy CRT",
      "backgroundImageUrl": "/assets/m-choice-hero.png",
      "colors": {
        "space": "#070313",
        "ink": "#09070f",
        "panel": "#6f3aa6",
        "panelSoft": "#8a52c0",
        "chromeStart": "#ff63e6",
        "chromeEnd": "#9b21d4",
        "accent": "#ff7adf",
        "accentAlt": "#68e8ff",
        "text": "#fff7ff",
        "muted": "#d8b7ef",
        "line": "#d9a7ff",
        "glow": "rgba(255, 99, 230, 0.42)"
      },
      "scanlineOpacity": 0.22,
      "pixelScale": 2
    },
    "ui": {
      "browserTabName": "M. Choice Pixel Portfolio",
      "introStart": "v PRESS START v",
      "contactsWindowTitle": "",
      "contactsHeading": "My Contacts:",
      "contactButton": "got it!",
      "projectsWindowTitle": "Projects.exe",
      "projectLinkLabel": "view work",
      "taskbarLabels": {
        "about": "About_Me.txt",
        "presentation": "Apresentation.txt",
        "projects": "Projects.exe",
        "contacts": "Contacts"
      }
    }
  }
  $portfolio$::jsonb
)
on conflict (id) do nothing;

create table if not exists public.portfolio_design_config (
  id text primary key default 'main',
  theme_name text not null,
  background_image_url text not null,
  color_space text not null,
  color_ink text not null,
  color_panel text not null,
  color_panel_soft text not null,
  color_chrome_start text not null,
  color_chrome_end text not null,
  color_accent text not null,
  color_accent_alt text not null,
  color_text text not null,
  color_muted text not null,
  color_line text not null,
  color_glow text not null,
  scanline_opacity numeric(4, 3) not null default 0.22
    check (scanline_opacity >= 0 and scanline_opacity <= 0.35),
  pixel_scale numeric(3, 1) not null default 2
    check (pixel_scale >= 1 and pixel_scale <= 4),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_web_ui_content (
  id text primary key default 'main',
  browser_tab_name text not null,
  intro_start text not null,
  contacts_window_title text not null default '',
  contacts_heading text not null,
  contact_button text not null,
  projects_window_title text not null,
  project_link_label text not null,
  taskbar_about_label text not null,
  taskbar_presentation_label text not null,
  taskbar_projects_label text not null,
  taskbar_contacts_label text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_profile_content (
  id text primary key default 'main',
  name text not null,
  handle text not null,
  title text not null,
  tagline text not null,
  avatar_url text not null,
  hero_image_url text not null,
  logo_text text not null,
  logo_subtext text not null,
  desktop_name text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_about_content (
  id text primary key default 'main',
  window_title text not null,
  paragraphs text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_presentation_content (
  id text primary key default 'main',
  window_title text not null,
  education text[] not null default '{}',
  main_skills text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_contacts (
  site_id text not null default 'main',
  id text not null,
  sort_order integer not null default 0,
  type text not null check (
    type in ('email', 'linkedin', 'behance', 'instagram', 'github', 'website')
  ),
  label text not null,
  value text not null,
  href text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (site_id, id)
);

create table if not exists public.portfolio_software_skills (
  site_id text not null default 'main',
  id text not null,
  sort_order integer not null default 0,
  name text not null,
  level integer not null default 0 check (level >= 0 and level <= 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (site_id, id)
);

create table if not exists public.portfolio_projects (
  site_id text not null default 'main',
  id text not null,
  sort_order integer not null default 0,
  title text not null,
  subtitle text not null,
  description text not null,
  image_url text not null,
  href text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (site_id, id)
);

create table if not exists public.portfolio_assets (
  id uuid primary key default extensions.gen_random_uuid(),
  bucket_id text not null default 'portfolio-assets',
  object_path text not null unique,
  public_url text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  created_at timestamptz not null default now()
);

insert into public.portfolio_design_config (
  id,
  theme_name,
  background_image_url,
  color_space,
  color_ink,
  color_panel,
  color_panel_soft,
  color_chrome_start,
  color_chrome_end,
  color_accent,
  color_accent_alt,
  color_text,
  color_muted,
  color_line,
  color_glow,
  scanline_opacity,
  pixel_scale
)
select
  'main',
  coalesce(content #>> '{theme,name}', 'Nebula Candy CRT'),
  coalesce(content #>> '{theme,backgroundImageUrl}', '/assets/m-choice-hero.png'),
  coalesce(content #>> '{theme,colors,space}', '#070313'),
  coalesce(content #>> '{theme,colors,ink}', '#09070f'),
  coalesce(content #>> '{theme,colors,panel}', '#6f3aa6'),
  coalesce(content #>> '{theme,colors,panelSoft}', '#8a52c0'),
  coalesce(content #>> '{theme,colors,chromeStart}', '#ff63e6'),
  coalesce(content #>> '{theme,colors,chromeEnd}', '#9b21d4'),
  coalesce(content #>> '{theme,colors,accent}', '#ff7adf'),
  coalesce(content #>> '{theme,colors,accentAlt}', '#68e8ff'),
  coalesce(content #>> '{theme,colors,text}', '#fff7ff'),
  coalesce(content #>> '{theme,colors,muted}', '#d8b7ef'),
  coalesce(content #>> '{theme,colors,line}', '#d9a7ff'),
  coalesce(content #>> '{theme,colors,glow}', 'rgba(255, 99, 230, 0.42)'),
  coalesce((content #>> '{theme,scanlineOpacity}')::numeric, 0.22),
  coalesce((content #>> '{theme,pixelScale}')::numeric, 2)
from public.portfolio_content
where id = 'main'
on conflict (id) do nothing;

insert into public.portfolio_web_ui_content (
  id,
  browser_tab_name,
  intro_start,
  contacts_window_title,
  contacts_heading,
  contact_button,
  projects_window_title,
  project_link_label,
  taskbar_about_label,
  taskbar_presentation_label,
  taskbar_projects_label,
  taskbar_contacts_label
)
select
  'main',
  coalesce(content #>> '{ui,browserTabName}', 'M. Choice Pixel Portfolio'),
  coalesce(content #>> '{ui,introStart}', 'v PRESS START v'),
  coalesce(content #>> '{ui,contactsWindowTitle}', ''),
  coalesce(content #>> '{ui,contactsHeading}', 'My Contacts:'),
  coalesce(content #>> '{ui,contactButton}', 'got it!'),
  coalesce(content #>> '{ui,projectsWindowTitle}', 'Projects.exe'),
  coalesce(content #>> '{ui,projectLinkLabel}', 'view work'),
  coalesce(content #>> '{ui,taskbarLabels,about}', 'About_Me.txt'),
  coalesce(content #>> '{ui,taskbarLabels,presentation}', 'Apresentation.txt'),
  coalesce(content #>> '{ui,taskbarLabels,projects}', 'Projects.exe'),
  coalesce(content #>> '{ui,taskbarLabels,contacts}', 'Contacts')
from public.portfolio_content
where id = 'main'
on conflict (id) do nothing;

insert into public.portfolio_profile_content (
  id,
  name,
  handle,
  title,
  tagline,
  avatar_url,
  hero_image_url,
  logo_text,
  logo_subtext,
  desktop_name
)
select
  'main',
  coalesce(content #>> '{profile,name}', 'M. Choice'),
  coalesce(content #>> '{profile,handle}', '@m_choice'),
  coalesce(content #>> '{profile,title}', 'Pixel Artist & Game Designer'),
  coalesce(content #>> '{profile,tagline}', 'Characters, tiny worlds, UI sprites, and game-ready charm.'),
  coalesce(content #>> '{profile,avatarUrl}', '/assets/m-choice-avatar.png'),
  coalesce(content #>> '{profile,heroImageUrl}', '/assets/m-choice-hero.png'),
  coalesce(content #>> '{profile,logoText}', 'PORTFOLIO'),
  coalesce(content #>> '{profile,logoSubtext}', 'M. CHOICE'),
  coalesce(content #>> '{profile,desktopName}', 'CHOICE_OS')
from public.portfolio_content
where id = 'main'
on conflict (id) do nothing;

insert into public.portfolio_about_content (id, window_title, paragraphs)
select
  'main',
  coalesce(content #>> '{about,windowTitle}', 'About_Me.txt'),
  coalesce(
    array(
      select jsonb_array_elements_text(coalesce(content #> '{about,paragraphs}', '[]'::jsonb))
    ),
    array[]::text[]
  )
from public.portfolio_content
where id = 'main'
on conflict (id) do nothing;

insert into public.portfolio_presentation_content (
  id,
  window_title,
  education,
  main_skills
)
select
  'main',
  coalesce(content #>> '{presentation,windowTitle}', 'Apresentation.txt'),
  coalesce(
    array(
      select jsonb_array_elements_text(coalesce(content #> '{presentation,education}', '[]'::jsonb))
    ),
    array[]::text[]
  ),
  coalesce(
    array(
      select jsonb_array_elements_text(coalesce(content #> '{presentation,mainSkills}', '[]'::jsonb))
    ),
    array[]::text[]
  )
from public.portfolio_content
where id = 'main'
on conflict (id) do nothing;

insert into public.portfolio_contacts (
  site_id,
  id,
  sort_order,
  type,
  label,
  value,
  href
)
select
  'main',
  coalesce(item ->> 'id', 'contact-' || ordinal::text),
  (ordinal - 1)::integer,
  case
    when item ->> 'type' in ('email', 'linkedin', 'behance', 'instagram', 'github', 'website')
      then item ->> 'type'
    else 'website'
  end,
  coalesce(item ->> 'label', 'Website'),
  coalesce(item ->> 'value', '@handle'),
  coalesce(item ->> 'href', 'https://')
from public.portfolio_content source
cross join lateral jsonb_array_elements(
  coalesce(source.content -> 'contacts', '[]'::jsonb)
) with ordinality as entries(item, ordinal)
where source.id = 'main'
on conflict (site_id, id) do nothing;

insert into public.portfolio_software_skills (
  site_id,
  id,
  sort_order,
  name,
  level
)
select
  'main',
  'software-' || ordinal::text,
  (ordinal - 1)::integer,
  coalesce(item ->> 'name', 'Skill'),
  least(greatest(coalesce((item ->> 'level')::integer, 0), 0), 5)
from public.portfolio_content source
cross join lateral jsonb_array_elements(
  coalesce(source.content #> '{presentation,software}', '[]'::jsonb)
) with ordinality as entries(item, ordinal)
where source.id = 'main'
on conflict (site_id, id) do nothing;

insert into public.portfolio_projects (
  site_id,
  id,
  sort_order,
  title,
  subtitle,
  description,
  image_url,
  href,
  tags
)
select
  'main',
  coalesce(item ->> 'id', 'project-' || ordinal::text),
  (ordinal - 1)::integer,
  coalesce(item ->> 'title', 'Project'),
  coalesce(item ->> 'subtitle', 'Case study'),
  coalesce(item ->> 'description', 'Project description.'),
  coalesce(item ->> 'imageUrl', '/assets/m-choice-hero.png'),
  coalesce(item ->> 'href', 'https://'),
  coalesce(
    array(
      select jsonb_array_elements_text(coalesce(item -> 'tags', '[]'::jsonb))
    ),
    array[]::text[]
  )
from public.portfolio_content source
cross join lateral jsonb_array_elements(
  coalesce(source.content -> 'projects', '[]'::jsonb)
) with ordinality as entries(item, ordinal)
where source.id = 'main'
on conflict (site_id, id) do nothing;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'portfolio_content',
    'portfolio_design_config',
    'portfolio_web_ui_content',
    'portfolio_profile_content',
    'portfolio_about_content',
    'portfolio_presentation_content',
    'portfolio_contacts',
    'portfolio_software_skills',
    'portfolio_projects',
    'portfolio_assets'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('grant select on public.%I to anon, authenticated', table_name);
    execute format('grant insert, update, delete on public.%I to authenticated', table_name);

    execute format(
      'drop policy if exists "public can read portfolio data" on public.%I',
      table_name
    );
    execute format(
      'create policy "public can read portfolio data" on public.%I for select using (true)',
      table_name
    );

    execute format(
      'drop policy if exists "admins can insert portfolio data" on public.%I',
      table_name
    );
    execute format(
      'create policy "admins can insert portfolio data" on public.%I for insert to authenticated with check (exists (select 1 from public.portfolio_admins admin where admin.user_id = auth.uid()))',
      table_name
    );

    execute format(
      'drop policy if exists "admins can update portfolio data" on public.%I',
      table_name
    );
    execute format(
      'create policy "admins can update portfolio data" on public.%I for update to authenticated using (exists (select 1 from public.portfolio_admins admin where admin.user_id = auth.uid())) with check (exists (select 1 from public.portfolio_admins admin where admin.user_id = auth.uid()))',
      table_name
    );

    execute format(
      'drop policy if exists "admins can delete portfolio data" on public.%I',
      table_name
    );
    execute format(
      'create policy "admins can delete portfolio data" on public.%I for delete to authenticated using (exists (select 1 from public.portfolio_admins admin where admin.user_id = auth.uid()))',
      table_name
    );
  end loop;
end $$;

alter table public.portfolio_admins enable row level security;
grant select on public.portfolio_admins to authenticated;

drop policy if exists "admins can read self" on public.portfolio_admins;
create policy "admins can read self"
on public.portfolio_admins
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "portfolio content is public" on public.portfolio_content;
drop policy if exists "admins can insert content" on public.portfolio_content;
drop policy if exists "admins can update content" on public.portfolio_content;
drop policy if exists "admins can delete content" on public.portfolio_content;
drop policy if exists "portfolio assets are public" on public.portfolio_assets;
drop policy if exists "admins can insert assets" on public.portfolio_assets;
drop policy if exists "admins can update assets" on public.portfolio_assets;
drop policy if exists "admins can delete assets" on public.portfolio_assets;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-assets',
  'portfolio-assets',
  true,
  8388608,
  array[
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/webp'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio asset files are public" on storage.objects;
create policy "portfolio asset files are public"
on storage.objects
for select
using (bucket_id = 'portfolio-assets');

drop policy if exists "admins can upload portfolio asset files" on storage.objects;
create policy "admins can upload portfolio asset files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'portfolio-assets'
  and exists (
    select 1
    from public.portfolio_admins admin
    where admin.user_id = auth.uid()
  )
);

drop policy if exists "admins can update portfolio asset files" on storage.objects;
create policy "admins can update portfolio asset files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'portfolio-assets'
  and exists (
    select 1
    from public.portfolio_admins admin
    where admin.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'portfolio-assets'
  and exists (
    select 1
    from public.portfolio_admins admin
    where admin.user_id = auth.uid()
  )
);

drop policy if exists "admins can delete portfolio asset files" on storage.objects;
create policy "admins can delete portfolio asset files"
on storage.objects
for delete
using (
  bucket_id = 'portfolio-assets'
  and exists (
    select 1
    from public.portfolio_admins admin
    where admin.user_id = auth.uid()
  )
);

-- After creating the Supabase Auth user, add the account as an admin:
-- insert into public.portfolio_admins (user_id, email)
-- values ('AUTH_USER_ID_HERE', 'you@example.com');

-- The CMS now stores editable data in visible Supabase tables:
-- design: portfolio_design_config
-- web UI labels: portfolio_web_ui_content
-- portfolio content: portfolio_profile_content, portfolio_about_content,
-- portfolio_presentation_content, portfolio_contacts,
-- portfolio_software_skills, and portfolio_projects
-- portfolio_content remains as a compatibility mirror of the full object.
