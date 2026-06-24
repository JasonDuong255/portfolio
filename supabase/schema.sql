create table if not exists public.portfolio_content (
  id text primary key default 'main',
  content jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  created_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;
alter table public.portfolio_admins enable row level security;

grant select on public.portfolio_content to anon, authenticated;
grant insert, update, delete on public.portfolio_content to authenticated;
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

drop policy if exists "admins can read self" on public.portfolio_admins;
create policy "admins can read self"
on public.portfolio_admins
for select
to authenticated
using (user_id = auth.uid());

-- After creating the Supabase Auth user, add the account as an admin:
-- insert into public.portfolio_admins (user_id, email)
-- values ('AUTH_USER_ID_HERE', 'you@example.com');
