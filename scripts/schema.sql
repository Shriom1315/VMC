-- ============================================================
-- Vikramaditya Metrology Center — Supabase Database Schema
-- Paste this entire file into Supabase Dashboard → SQL Editor
-- and click Run.
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── parties ──────────────────────────────────────────────────
create table if not exists parties (
  id                 integer primary key,
  name               text not null,
  address            text default '',
  contact            text default '-',
  gst_no             text default '-',
  email              text default '-',
  gst_type           text default 'CGST/SGST',
  other_access       text default 'No',
  billing_rate_type  text default 'Fixed Discount %',
  discount_rate      text default '',
  collab_method      text default 'Lab Method',
  reporting_method   text default 'Lab Format',
  collation_method   text default 'By Hand',
  dispatch_method    text default 'By Hand',
  compliance         text default 'Required',
  decision_rule      text default 'Yes',
  billing_firm       text default 'Vikramaditya Calibration',
  created_at         timestamptz default now()
);

-- ── gauges ───────────────────────────────────────────────────
create table if not exists gauges (
  id                  integer primary key,
  gauge_name          text not null,
  is_no               text default '',
  non_nabl_no         text default '',
  nabl_no             text default '',
  raw_datasheet_frmt  text default '',
  cert_code           text default '',
  calibration_method  text default '',
  gauge_type          text default 'OD Limit Gauge',
  env_conditions      text default '20°C ± 2°C & Humidity 40 to 60 % Rh.',
  datasheet           text default '',
  certificate         text default '',
  calibration         text default '',
  created_at          timestamptz default now()
);

-- ── app_users ────────────────────────────────────────────────
create table if not exists app_users (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text unique not null,
  role        text not null check (role in ('admin','manager','staff')),
  status      text not null default 'active' check (status in ('active','inactive')),
  last_login  text default 'Never',
  created_by  text default 'admin',
  created_at  timestamptz default now()
);

-- ── calib_jobs ───────────────────────────────────────────────
create table if not exists calib_jobs (
  id                  uuid primary key default uuid_generate_v4(),
  lab_id              text not null,
  name                text not null,
  identification_no   text default '',
  specification       text default '',
  manu_sr             text default '',
  process             text default 'Calibration',
  dc_no               text default '',
  dc_date             date,
  calib_date          date,
  next_calib_date     date,
  cert_no             text default '',
  cert_issue_date     date,
  ulr_no              text default '',
  sr_no               text default '',
  make                text default '',
  lc                  text default '',
  ref_is_std          text default '',
  calib_method_use    text default 'Tolerance Method',
  standard_equipment  text[] default '{}',
  client_name         text default '',
  client_address      text default '',
  condition_of_gauge  text default 'Visually Ok',
  date_received       date,
  calib_temp          text default '20°C ± 2°C & Humidity 40 to 60 % Rh.',
  uncertainty         text default '± 1 μm.',
  calib_location      text default 'Permanent Facility',
  remark              text default '',
  calibrated_by       text default '',
  approved_by         text default '',
  status              text not null default 'pending' check (status in ('pending','generated')),
  created_at          timestamptz default now()
);

-- ── dispatches ───────────────────────────────────────────────
create table if not exists dispatches (
  id             uuid primary key default uuid_generate_v4(),
  job_id         text not null,
  party          text not null,
  instruments    text default '',
  dc_no          text default '',
  dispatch_date  date,
  courier        text default 'By Hand',
  tracking_no    text default '',
  received_by    text default '',
  status         text default 'dispatched' check (status in ('pending','dispatched','delivered')),
  created_at     timestamptz default now()
);

-- ── invoices ─────────────────────────────────────────────────
create table if not exists invoices (
  id            uuid primary key default uuid_generate_v4(),
  invoice_no    text unique not null,
  party         text not null,
  dc_ref        text default '',
  invoice_date  date,
  amount        numeric(12,2) default 0,
  gst_amount    numeric(12,2) default 0,
  total         numeric(12,2) default 0,
  status        text default 'draft' check (status in ('draft','issued','paid','overdue')),
  created_at    timestamptz default now()
);

-- ── receipts ─────────────────────────────────────────────────
create table if not exists receipts (
  id            uuid primary key default uuid_generate_v4(),
  receipt_no    text unique not null,
  party         text not null,
  invoice_ref   text not null,
  receipt_date  date,
  amount        numeric(12,2) default 0,
  mode          text default 'cash' check (mode in ('cash','cheque','upi','neft','rtgs')),
  reference     text default '',
  created_at    timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table parties     enable row level security;
alter table gauges      enable row level security;
alter table app_users   enable row level security;
alter table calib_jobs  enable row level security;
alter table dispatches  enable row level security;
alter table invoices    enable row level security;
alter table receipts    enable row level security;

-- Authenticated users can read everything
create policy "auth read parties"     on parties     for select using (auth.role() = 'authenticated');
create policy "auth read gauges"      on gauges      for select using (auth.role() = 'authenticated');
create policy "auth read app_users"   on app_users   for select using (auth.role() = 'authenticated');
create policy "auth read calib_jobs"  on calib_jobs  for select using (auth.role() = 'authenticated');
create policy "auth read dispatches"  on dispatches  for select using (auth.role() = 'authenticated');
create policy "auth read invoices"    on invoices    for select using (auth.role() = 'authenticated');
create policy "auth read receipts"    on receipts    for select using (auth.role() = 'authenticated');

-- Service role (used by scripts and future admin API) can write everything
create policy "svc write parties"     on parties     for all using (auth.role() = 'service_role');
create policy "svc write gauges"      on gauges      for all using (auth.role() = 'service_role');
create policy "svc write app_users"   on app_users   for all using (auth.role() = 'service_role');
create policy "svc write calib_jobs"  on calib_jobs  for all using (auth.role() = 'service_role');
create policy "svc write dispatches"  on dispatches  for all using (auth.role() = 'service_role');
create policy "svc write invoices"    on invoices    for all using (auth.role() = 'service_role');
create policy "svc write receipts"    on receipts    for all using (auth.role() = 'service_role');
