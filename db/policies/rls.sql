-- ENTRUSTORY Phase 2 RLS baseline policies (Supabase)

alter table profiles enable row level security;
alter table work_items enable row level security;
alter table versions enable row level security;
alter table file_hashes enable row level security;
alter table timeline_events enable row level security;

-- Profiles: users can read/update their own profile
create policy if not exists "profiles_select_own" on profiles
for select using (auth.uid() = id);

create policy if not exists "profiles_update_own" on profiles
for update using (auth.uid() = id);

-- Work items: owner can CRUD; collaborators handled in future workspace table
create policy if not exists "work_items_owner_all" on work_items
for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Versions: access only through work item ownership
create policy if not exists "versions_owner_access" on versions
for all using (
  exists (
    select 1 from work_items wi where wi.id = versions.work_item_id and wi.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from work_items wi where wi.id = versions.work_item_id and wi.owner_id = auth.uid()
  )
);

-- File hashes: owner-scoped
create policy if not exists "file_hashes_owner_access" on file_hashes
for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Timeline events: readable by owner, insert-only from owner scope
create policy if not exists "timeline_events_owner_select" on timeline_events
for select using (
  exists (
    select 1 from work_items wi where wi.id = timeline_events.work_item_id and wi.owner_id = auth.uid()
  )
);

create policy if not exists "timeline_events_owner_insert" on timeline_events
for insert with check (
  exists (
    select 1 from work_items wi where wi.id = timeline_events.work_item_id and wi.owner_id = auth.uid()
  )
);
