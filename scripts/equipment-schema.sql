-- ============================================================
-- Vikramaditya Metrology Center — Equipment Registration Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── equipments table ─────────────────────────────────────────
create table if not exists equipments (
  id                    serial primary key,
  equipment_name        text not null,
  code_no               text default '',
  serial_no             text default '',
  mgf_date              text default '',
  date_of_installation  text default '',
  reference_std         text default '',
  least_count           text default '',
  cal_agency            text default '',
  make                  text default '',
  size_range            text default '',
  periodicity_no        text default '',
  equipment_location    text default '',
  ranges                jsonb default '[]',
  created_at            timestamptz default now()
);

-- ── Enable Row Level Security ────────────────────────────────
alter table equipments enable row level security;

-- Drop existing policies if they exist
drop policy if exists "authenticated_all_equipments" on equipments;
drop policy if exists "service_all_equipments" on equipments;

-- Authenticated users can do everything (admin interface)
create policy "authenticated_all_equipments" on equipments
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Service role can do everything (for scripts)
create policy "service_all_equipments" on equipments
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
