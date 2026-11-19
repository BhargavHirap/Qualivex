-- Qualivex conversation and qualification engine.
create table if not exists public.qualification_profiles (
 workspace_id uuid primary key references public.workspaces(id) on delete cascade,
 business_name text not null default 'Your business' check(char_length(business_name) between 2 and 120),
 core_service text not null default '' check(char_length(core_service)<=500),
 target_service text not null default '' check(char_length(target_service)<=500),
 minimum_budget text not null default '' check(char_length(minimum_budget)<=160),
 timeline_window text not null default 'within 30 days',
 approved_faqs text not null default '' check(char_length(approved_faqs)<=6000),
 alternative_resource_url text not null default '',
 calendar_booking_url text not null default '',
 timezone text not null default 'Asia/Kolkata',
 updated_at timestamptz not null default now()
);
create table if not exists public.conversations (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 lead_id uuid references public.leads(id) on delete set null,
 channel text not null default 'web' check(channel in ('web','whatsapp','instagram_dm','webhook')),
 external_contact_id text,
 status text not null default 'IN_PROGRESS' check(status in ('IN_PROGRESS','QUALIFIED','DISQUALIFIED','HANDOFF_NEEDED','QUALIFIED_LINK_SENT','CALL_BOOKED','CALL_SHOWED','NO_SHOW')),
 state jsonb not null default '{"service_fit":null,"budget_fit":null,"timeline_fit":null,"is_decision_maker":null,"collected_info":{},"missing_info":[]}'::jsonb,
 last_message_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 unique(workspace_id,channel,external_contact_id)
);
create index if not exists conversations_workspace_recent_idx on public.conversations(workspace_id,last_message_at desc);
create table if not exists public.conversation_messages (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 conversation_id uuid not null references public.conversations(id) on delete cascade,
 direction text not null check(direction in ('inbound','outbound','system')),
 content text not null check(char_length(content)<=5000),
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists conversation_messages_recent_idx on public.conversation_messages(conversation_id,created_at desc);
create table if not exists public.webhook_events (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 provider text not null,
 event_id text not null,
 status text not null default 'received' check(status in ('received','processed','ignored','failed')),
 error text,
 created_at timestamptz not null default now(),
 unique(provider,event_id)
);
alter table public.qualification_profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.webhook_events enable row level security;
create policy "workspace members manage qualification profile" on public.qualification_profiles for all to authenticated
using(exists(select 1 from public.workspace_members m where m.workspace_id=qualification_profiles.workspace_id and m.user_id=(select auth.uid())))
with check(exists(select 1 from public.workspace_members m where m.workspace_id=qualification_profiles.workspace_id and m.user_id=(select auth.uid())));
create policy "workspace members manage conversations" on public.conversations for all to authenticated
using(exists(select 1 from public.workspace_members m where m.workspace_id=conversations.workspace_id and m.user_id=(select auth.uid())))
with check(exists(select 1 from public.workspace_members m where m.workspace_id=conversations.workspace_id and m.user_id=(select auth.uid())));
create policy "workspace members manage conversation messages" on public.conversation_messages for all to authenticated
using(exists(select 1 from public.workspace_members m where m.workspace_id=conversation_messages.workspace_id and m.user_id=(select auth.uid())))
with check(exists(select 1 from public.workspace_members m where m.workspace_id=conversation_messages.workspace_id and m.user_id=(select auth.uid())));
create policy "workspace members read webhook events" on public.webhook_events for select to authenticated
using(exists(select 1 from public.workspace_members m where m.workspace_id=webhook_events.workspace_id and m.user_id=(select auth.uid())));
grant select,insert,update,delete on public.qualification_profiles,public.conversations,public.conversation_messages to authenticated;
grant select on public.webhook_events to authenticated;
