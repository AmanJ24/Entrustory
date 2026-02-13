-- ENTRUSTORY Phase 2 Initial Schema (Supabase/PostgreSQL)

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key,
  full_name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  subscription_plan text not null default 'free',
  is_active boolean not null default true
);

create table if not exists work_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id),
  title text not null,
  description text,
  current_version_id uuid,
  is_archived boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists versions (
  id uuid primary key default gen_random_uuid(),
  work_item_id uuid not null references work_items(id),
  version_number integer not null check (version_number > 0),
  merkle_root char(64) not null,
  server_timestamp timestamptz not null default timezone('utc', now()),
  signature text not null,
  kid text not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  unique (work_item_id, version_number)
);

alter table work_items
  add constraint work_items_current_version_fk
  foreign key (current_version_id) references versions(id);

create table if not exists file_hashes (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references versions(id),
  owner_id uuid not null references profiles(id),
  file_name text not null,
  file_size bigint not null check (file_size >= 0),
  sha256_hash char(64) not null,
  encrypted_storage_path text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (sha256_hash, owner_id)
);

create table if not exists timeline_events (
  id uuid primary key default gen_random_uuid(),
  work_item_id uuid not null references work_items(id),
  version_id uuid references versions(id),
  event_type text not null,
  event_metadata jsonb not null default '{}'::jsonb,
  created_by uuid references profiles(id),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  action_type text not null,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists verification_logs (
  id uuid primary key default gen_random_uuid(),
  proof_id uuid not null references versions(id),
  submitted_hash char(64) not null,
  ip_address inet,
  is_match boolean not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_file_hashes_sha256 on file_hashes(sha256_hash);
create index if not exists idx_versions_created_at on versions(created_at desc);
create index if not exists idx_verification_logs_lookup on verification_logs(proof_id, submitted_hash, created_at desc);

create or replace function prevent_mutation_timeline_events()
returns trigger
language plpgsql
as $$
begin
  raise exception 'timeline_events is append-only';
end;
$$;

drop trigger if exists trg_prevent_update_timeline_events on timeline_events;
create trigger trg_prevent_update_timeline_events
before update on timeline_events
for each row execute function prevent_mutation_timeline_events();

drop trigger if exists trg_prevent_delete_timeline_events on timeline_events;
create trigger trg_prevent_delete_timeline_events
before delete on timeline_events
for each row execute function prevent_mutation_timeline_events();
