-- Qualivex multi-tenant core schema.
-- Apply to a dedicated Supabase project only.
create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  unique(workspace_id,user_id)
);
create index if not exists workspace_members_user_idx on public.workspace_members(user_id);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  full_name text not null check (char_length(full_name) between 1 and 120),
  email text not null check (char_length(email) <= 254),
  company text not null default '' check (char_length(company) <= 160),
  phone text not null default '' check (char_length(phone) <= 40),
  source text not null default 'manual' check (char_length(source) <= 80),
  status text not null default 'new' check (status in ('new','qualified','nurture','disqualified','contacted','won','lost')),
  score integer not null default 0 check (score between 0 and 100),
  budget text not null default '' check (char_length(budget) <= 160),
  need text not null default '' check (char_length(need) <= 1000),
  notes text not null default '' check (char_length(notes) <= 5000),
  assigned_to uuid references auth.users(id) on delete set null,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_workspace_created_idx on public.leads(workspace_id,created_at desc);
create index if not exists leads_workspace_status_idx on public.leads(workspace_id,status);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  created_by uuid not null references auth.users(id),
  title text not null check (char_length(title) between 1 and 180),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed','no_show')),
  timezone text not null default 'UTC',
  provider text not null default 'manual',
  external_event_id text,
  meeting_url text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists appointments_workspace_start_idx on public.appointments(workspace_id,starts_at);

create table if not exists public.qualification_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  created_by uuid not null references auth.users(id),
  score integer not null check (score between 0 and 100),
  status text not null,
  signals jsonb not null default '[]'::jsonb,
  recommendation text not null,
  model text not null default 'rules-v1',
  created_at timestamptz not null default now()
);
create index if not exists qualification_workspace_created_idx on public.qualification_events(workspace_id,created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at before update on public.leads
for each row execute function public.set_updated_at();

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.leads enable row level security;
alter table public.appointments enable row level security;
alter table public.qualification_events enable row level security;

-- Workspace owners may create and read their workspace.
drop policy if exists "workspace owner reads workspace" on public.workspaces;
create policy "workspace owner reads workspace" on public.workspaces for select to authenticated
using (created_by=(select auth.uid()) or exists (select 1 from public.workspace_members m where m.workspace_id=id and m.user_id=(select auth.uid())));
drop policy if exists "authenticated user creates own workspace" on public.workspaces;
create policy "authenticated user creates own workspace" on public.workspaces for insert to authenticated
with check (created_by=(select auth.uid()));
drop policy if exists "workspace owner updates workspace" on public.workspaces;
create policy "workspace owner updates workspace" on public.workspaces for update to authenticated
using (exists (select 1 from public.workspace_members m where m.workspace_id=id and m.user_id=(select auth.uid()) and m.role in ('owner','admin')))
with check (exists (select 1 from public.workspace_members m where m.workspace_id=id and m.user_id=(select auth.uid()) and m.role in ('owner','admin')));

-- Users can add themselves as the initial owner only when they created the workspace.
create schema if not exists private;
create or replace function private.can_join_created_workspace(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1 from public.workspaces w
    where w.id = target_workspace_id
      and w.created_by = (select auth.uid())
  );
$function$;
revoke all on function private.can_join_created_workspace(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.can_join_created_workspace(uuid) to authenticated;

drop policy if exists "user joins workspace they created" on public.workspace_members;
create policy "user joins workspace they created" on public.workspace_members for insert to authenticated
with check (user_id=(select auth.uid()) and role='owner' and private.can_join_created_workspace(workspace_id));
drop policy if exists "members read workspace membership" on public.workspace_members;
create policy "members read workspace membership" on public.workspace_members for select to authenticated
using (user_id=(select auth.uid()));
drop policy if exists "admins manage membership" on public.workspace_members;
create policy "admins manage membership" on public.workspace_members for delete to authenticated
using (user_id=(select auth.uid()) and role='owner');

-- Workspace membership is the tenant boundary for all business data.
drop policy if exists "workspace members read leads" on public.leads;
create policy "workspace members read leads" on public.leads for select to authenticated
using (exists (select 1 from public.workspace_members m where m.workspace_id=leads.workspace_id and m.user_id=(select auth.uid())));
drop policy if exists "workspace members create leads" on public.leads;
create policy "workspace members create leads" on public.leads for insert to authenticated
with check (created_by=(select auth.uid()) and exists (select 1 from public.workspace_members m where m.workspace_id=leads.workspace_id and m.user_id=(select auth.uid())));
drop policy if exists "workspace members update leads" on public.leads;
create policy "workspace members update leads" on public.leads for update to authenticated
using (exists (select 1 from public.workspace_members m where m.workspace_id=leads.workspace_id and m.user_id=(select auth.uid())))
with check (created_by=(select auth.uid()) and exists (select 1 from public.workspace_members m where m.workspace_id=leads.workspace_id and m.user_id=(select auth.uid())));
drop policy if exists "workspace admins delete leads" on public.leads;
create policy "workspace admins delete leads" on public.leads for delete to authenticated
using (exists (select 1 from public.workspace_members m where m.workspace_id=leads.workspace_id and m.user_id=(select auth.uid()) and m.role in ('owner','admin')));

drop policy if exists "workspace members manage appointments" on public.appointments;
create policy "workspace members manage appointments" on public.appointments for all to authenticated
using (exists (select 1 from public.workspace_members m where m.workspace_id=appointments.workspace_id and m.user_id=(select auth.uid())))
with check (created_by=(select auth.uid()) and exists (select 1 from public.workspace_members m where m.workspace_id=appointments.workspace_id and m.user_id=(select auth.uid())));

drop policy if exists "workspace members read qualification events" on public.qualification_events;
create policy "workspace members read qualification events" on public.qualification_events for select to authenticated
using (exists (select 1 from public.workspace_members m where m.workspace_id=qualification_events.workspace_id and m.user_id=(select auth.uid())));
drop policy if exists "workspace members create qualification events" on public.qualification_events;
create policy "workspace members create qualification events" on public.qualification_events for insert to authenticated
with check (created_by=(select auth.uid()) and exists (select 1 from public.workspace_members m where m.workspace_id=qualification_events.workspace_id and m.user_id=(select auth.uid())));

grant usage on schema public to authenticated;
grant select, insert, update on public.workspaces to authenticated;
grant select, insert, delete on public.workspace_members to authenticated;
grant select, insert, update, delete on public.leads to authenticated;
grant select, insert, update, delete on public.appointments to authenticated;
grant select, insert on public.qualification_events to authenticated;

-- Atomic workspace bootstrap: both records commit or roll back together.
create or replace function public.create_workspace(workspace_name text, workspace_slug text)
returns table (id uuid, name text, slug text)
language plpgsql
security invoker
set search_path = ''
as $workspace$
declare
  created_workspace public.workspaces%rowtype;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  insert into public.workspaces(name, slug, created_by)
  values (workspace_name, workspace_slug, (select auth.uid()))
  returning * into created_workspace;
  insert into public.workspace_members(workspace_id, user_id, role)
  values (created_workspace.id, (select auth.uid()), 'owner');
  return query select created_workspace.id, created_workspace.name, created_workspace.slug;
end;
$workspace$;
revoke all on function public.create_workspace(text,text) from public;
grant execute on function public.create_workspace(text,text) to authenticated;
