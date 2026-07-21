-- ============================================================
-- Vikramaditya Metrology Center — Scope Registration Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── scopes table ─────────────────────────────────────────────
create table if not exists scopes (
  id                      serial primary key,
  gauge_type              text not null,
  least_count             text default '',
  range_from              text default '',
  range_to                text default '',
  valid_date              text default '',
  uncertainty_measurement text default '',
  confidance_level        text default '',
  calib_location          text default 'Site Facility',
  remark                  text default '',
  equipment_use_for_cali  text[] default '{}',
  master_equipment_list   text default '',
  created_at              timestamptz default now()
);

-- ── Enable Row Level Security ────────────────────────────────
alter table scopes enable row level security;

-- Drop existing policies if they exist
drop policy if exists "auth read scopes" on scopes;
drop policy if exists "auth write scopes" on scopes;
drop policy if exists "auth update scopes" on scopes;
drop policy if exists "auth delete scopes" on scopes;
drop policy if exists "svc write scopes" on scopes;

-- Authenticated users can do everything (admin interface)
create policy "authenticated_all_scopes" on scopes
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Service role can do everything (for scripts)
create policy "service_all_scopes" on scopes
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
