create extension if not exists pgcrypto with schema extensions;

create table if not exists public.portfolio_content (
  id text primary key default 'main',
  content jsonb not null,
  updated_at timestamptz not null default now()
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

alter table public.portfolio_content enable row level security;
alter table public.portfolio_assets enable row level security;
alter table public.portfolio_admins enable row level security;

grant select on public.portfolio_content to anon, authenticated;
grant insert, update, delete on public.portfolio_content to authenticated;
grant select on public.portfolio_assets to anon, authenticated;
grant insert, update, delete on public.portfolio_assets to authenticated;
grant select on public.portfolio_admins to authenticated;

drop policy if exists "portfolio content is public" on public.portfolio_content;
create policy "portfolio content is public"
on public.portfolio_content
for select
using (true);

drop policy if exists "admins can insert content" on public.portfolio_content;
create policy "admins can insert content"
on public.portfolio_content
for insert
to authenticated
with check (
  exists (
    select 1
    from public.portfolio_admins admin
    where admin.user_id = auth.uid()
  )
);

drop policy if exists "admins can update content" on public.portfolio_content;
create policy "admins can update content"
on public.portfolio_content
for update
to authenticated
using (
  exists (
    select 1
    from public.portfolio_admins admin
    where admin.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.portfolio_admins admin
    where admin.user_id = auth.uid()
  )
);

drop policy if exists "admins can delete content" on public.portfolio_content;
create policy "admins can delete content"
on public.portfolio_content
for delete
to authenticated
using (
  exists (
    select 1
    from public.portfolio_admins admin
    where admin.user_id = auth.uid()
  )
);

drop policy if exists "portfolio assets are public" on public.portfolio_assets;
create policy "portfolio assets are public"
on public.portfolio_assets
for select
using (true);

drop policy if exists "admins can insert assets" on public.portfolio_assets;
create policy "admins can insert assets"
on public.portfolio_assets
for insert
to authenticated
with check (
  exists (
    select 1
    from public.portfolio_admins admin
    where admin.user_id = auth.uid()
  )
);

drop policy if exists "admins can update assets" on public.portfolio_assets;
create policy "admins can update assets"
on public.portfolio_assets
for update
to authenticated
using (
  exists (
    select 1
    from public.portfolio_admins admin
    where admin.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.portfolio_admins admin
    where admin.user_id = auth.uid()
  )
);

drop policy if exists "admins can delete assets" on public.portfolio_assets;
create policy "admins can delete assets"
on public.portfolio_assets
for delete
to authenticated
using (
  exists (
    select 1
    from public.portfolio_admins admin
    where admin.user_id = auth.uid()
  )
);

drop policy if exists "admins can read self" on public.portfolio_admins;
create policy "admins can read self"
on public.portfolio_admins
for select
to authenticated
using (user_id = auth.uid());

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
to authenticated
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

-- portfolio_content is the CMS config table.
-- The app stores the whole editable content object in this row:
-- id = 'main', content = jsonb portfolio data.
