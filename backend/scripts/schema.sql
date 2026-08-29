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
-- ============================================================
-- Equipment History Table
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists equipment_history (
  id                     serial primary key,
  master_equipment_name  text not null,
  cal_by                 text default '',
  calibration_date       date,
  remark                 text default '',
  calibration_due_dt     date,
  format_no              text default '',
  cal_certi_no           text default '',
  traceability           text default '',
  ranges                 jsonb default '[]'::jsonb,
  created_at             timestamptz default now()
);

-- Row Level Security
alter table equipment_history enable row level security;

create policy "auth read equipment_history"
  on equipment_history for select
  using (auth.role() = 'authenticated');

create policy "auth write equipment_history"
  on equipment_history for all
  using (auth.role() = 'authenticated');
-- ============================================================
-- Quotations and Purchase Orders tables
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists quotations (
  id              uuid primary key default uuid_generate_v4(),
  quotation_no    text unique not null,
  date            date,
  client_name     text default '',
  client_address  text default '',
  client_gstin    text default '',
  kind_attn       text default '',
  client_dc_no    text default '',
  client_dc_date  date,
  po_no           text default '',
  discount_percent numeric(5,2) default 0,
  base_total      numeric(12,2) default 0,
  discount_amount numeric(12,2) default 0,
  net_total       numeric(12,2) default 0,
  rounded_total   numeric(12,2) default 0,
  items           jsonb default '[]',
  created_by      text default '',
  created_at      timestamptz default now()
);

create table if not exists purchase_orders (
  id              uuid primary key default uuid_generate_v4(),
  po_number       text unique not null,
  po_date         date,
  customer_name   text default '',
  address         text default '',
  total_qty       integer default 0,
  total_amount    numeric(12,2) default 0,
  items           jsonb default '[]',
  created_by      text default '',
  created_at      timestamptz default now()
);

alter table quotations     enable row level security;
alter table purchase_orders enable row level security;

create policy "auth all quotations"      on quotations      for all using (auth.role() in ('authenticated','service_role')) with check (auth.role() in ('authenticated','service_role'));
create policy "auth all purchase_orders" on purchase_orders for all using (auth.role() in ('authenticated','service_role')) with check (auth.role() in ('authenticated','service_role'));
-- ============================================================
-- Employees Master Schema
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists employees (
  id           serial primary key,
  name         text not null,
  designation  text default '',
  department   text default '',
  employee_code text default '',
  phone        text default '',
  email        text default '',
  join_date    date,
  is_active    boolean default true,
  signature_authority boolean default false,
  remark       text default '',
  created_at   timestamptz default now()
);

alter table employees enable row level security;

drop policy if exists "auth_all_employees" on employees;
drop policy if exists "svc_all_employees"  on employees;

create policy "auth_all_employees" on employees for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "svc_all_employees" on employees for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ── Add effective_from to scopes for versioning ───────────────
alter table scopes add column if not exists effective_from date default current_date;
alter table scopes add column if not exists is_active boolean default true;

-- ── Add parameters/results/scope_snapshot to calib_jobs ──────
alter table calib_jobs add column if not exists parameters jsonb default '[]';
alter table calib_jobs add column if not exists results    jsonb default '[]';
alter table calib_jobs add column if not exists scope_snapshot jsonb default '{}';
alter table calib_jobs add column if not exists observation text default '';
alter table calib_jobs add column if not exists conformity_statement text default '';
-- ============================================================
-- Vikramaditya Metrology Center — Uncertainty Records Schema
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists uncertainty_records (
  id                      uuid primary key default gen_random_uuid(),
  master_equipment_name   text not null,
  accuracy_value          text default '',
  accuracy_factor         text default '',
  uncertainty_cert_value  text default '',
  uncertainty_cert_factor text default '',
  k_factor_value          text default '',
  k_factor_factor         text default '',
  list_count_iuc_value    text default '',
  list_count_iuc_factor   text default '',
  resolution_value        text default '',
  resolution_factor       text default '',
  repeatability_value     text default '',
  repeatability_factor    text default '',
  created_at              timestamptz default now()
);

alter table uncertainty_records enable row level security;

drop policy if exists "auth_all_uncertainty_records" on uncertainty_records;
drop policy if exists "svc_all_uncertainty_records"  on uncertainty_records;

create policy "auth_all_uncertainty_records" on uncertainty_records
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "svc_all_uncertainty_records" on uncertainty_records
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
-- ============================================================
-- Inward Bill / Challan Master — additional tables
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── inward_bills ─────────────────────────────────────────────
create table if not exists inward_bills (
  id                    serial primary key,
  client_name           text not null,
  billing_to            text default '',
  delivery_to           text default '',
  other_access_to       text default '',
  client_dc_no          text default '',
  client_dc_date        date,
  through               text default '',
  inward_date           date default current_date,
  receive_date          date default current_date,
  commit_date           date default current_date,
  calib_method          text default 'Lab Method',
  method_of_reporting   text default 'Lab Format',
  mode_of_collection    text default 'By Hand',
  mode_of_dispatch      text default 'By Hand',
  compliance            text default 'Required',
  decision_rule         text default 'Yes',
  any_specific_req      text default '',
  lab_authorized_person text default '',
  designation           text default '',
  customer_auth_person  text default '',
  contact               text default '',
  billing_firm          text default 'Vikramaditya Calibration',
  created_at            timestamptz default now()
);

-- ── inward_items ─────────────────────────────────────────────
create table if not exists inward_items (
  id                    serial primary key,
  inward_bill_id        integer references inward_bills(id) on delete cascade,
  gauge_name            text not null,
  class                 text default 'No Type',
  gauge_type            text default 'OD Limit Gauge',
  identification_no     text default '',
  calib_frequency       text default '',
  make                  text default '',
  manu_sr_no            text default '',
  process               text default 'Calibration',
  unit                  text default 'mm',
  calib_location        text default 'Permanent Facility',
  calib_under           text default 'NABL',
  gauge_condition       text default '',
  method                text default 'Tolerance Method',
  size                  text default '',
  upper_tolerance       text default '',
  lower_tolerance       text default '',
  specification         text default '',
  -- Parameters stored as JSON array: [{parameter, basicSize, specLimitMax, specLimitMin, wearLimit}]
  parameters            jsonb default '[]',
  lab_id                text default '',
  created_at            timestamptz default now()
);

-- RLS
alter table inward_bills  enable row level security;
alter table inward_items  enable row level security;

create policy "auth all inward_bills"  on inward_bills  for all using (auth.role() in ('authenticated','service_role')) with check (auth.role() in ('authenticated','service_role'));
create policy "auth all inward_items"  on inward_items  for all using (auth.role() in ('authenticated','service_role')) with check (auth.role() in ('authenticated','service_role'));
-- ============================================================
-- Remaining Schemas — run all at once in Supabase SQL Editor
-- ============================================================

-- ── firms ─────────────────────────────────────────────────────
create table if not exists firms (
  id          serial primary key,
  firm_name   text not null,
  address     text default '',
  phone       text default '',
  email       text default '',
  gst_no      text default '',
  gst_type    text default 'CGST/SGST',
  pan_no      text default '',
  bank_name   text default '',
  account_no  text default '',
  ifsc_code   text default '',
  is_default  boolean default false,
  created_at  timestamptz default now()
);

-- ── instrument_repairs ────────────────────────────────────────
create table if not exists instrument_repairs (
  id                serial primary key,
  equipment_name    text not null,
  code_no           text default '',
  fault_description text default '',
  repair_action     text default '',
  repair_date       date,
  repaired_by       text default '',
  cost              numeric(10,2) default 0,
  status            text default 'Pending',
  remark            text default '',
  created_at        timestamptz default now()
);

-- ── thread_specs ──────────────────────────────────────────────
create table if not exists thread_specs (
  id              serial primary key,
  gauge_type      text not null,
  designation     text not null,
  pitch           text default '',
  major_dia_min   text default '',
  major_dia_max   text default '',
  pitch_dia_min   text default '',
  pitch_dia_max   text default '',
  minor_dia_min   text default '',
  minor_dia_max   text default '',
  tolerance_class text default '6H',
  is_std          text default '',
  remark          text default '',
  created_at      timestamptz default now()
);

-- ── taper_readings ────────────────────────────────────────────
create table if not exists taper_readings (
  id           serial primary key,
  gauge_type   text not null,
  designation  text not null,
  taper_ratio  text default '',
  small_end_dia text default '',
  large_end_dia text default '',
  gauge_length  text default '',
  standoff      text default '',
  is_std        text default '',
  remark        text default '',
  created_at    timestamptz default now()
);

-- ── reading_masters ───────────────────────────────────────────
create table if not exists reading_masters (
  id             serial primary key,
  gauge_type     text not null,
  parameter_name text not null,
  nominal_value  text default '',
  upper_limit    text default '',
  lower_limit    text default '',
  unit           text default 'mm',
  calib_method   text default 'Tolerance Method',
  remark         text default '',
  created_at     timestamptz default now()
);

-- ── dial_table ────────────────────────────────────────────────
create table if not exists dial_table (
  id             serial primary key,
  gauge_type     text not null,
  range_from     text default '',
  range_to       text default '',
  least_count    text default '',
  dial_divisions text default '',
  multiplier     text default '',
  calib_value    text default '',
  unit           text default 'mm',
  remark         text default '',
  created_at     timestamptz default now()
);

-- ── RLS for all new tables ────────────────────────────────────
do $$
declare
  t text;
begin
  foreach t in array array[
    'firms', 'instrument_repairs', 'thread_specs',
    'taper_readings', 'reading_masters', 'dial_table'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'drop policy if exists "auth_all_%1$s" on %1$I', t
    );
    execute format(
      'create policy "auth_all_%1$s" on %1$I for all
       using (auth.role() = ''authenticated'')
       with check (auth.role() = ''authenticated'')',
      t
    );
    execute format(
      'drop policy if exists "svc_all_%1$s" on %1$I', t
    );
    execute format(
      'create policy "svc_all_%1$s" on %1$I for all
       using (auth.role() = ''service_role'')
       with check (auth.role() = ''service_role'')',
      t
    );
  end loop;
end $$;
-- ============================================================
-- Custom PO Rate Master Schema
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists custom_po_rates (
  id               serial primary key,
  party_name       text not null,
  gauge_type       text not null,
  process_type     text default 'Calibration',
  calib_type       text default 'NABL',
  repair_rate      numeric(10,2) default 0,
  calib_rate       numeric(10,2) default 0,
  discount_percent numeric(5,2)  default 0,
  effective_from   date,
  remark           text default '',
  created_at       timestamptz default now()
);

alter table custom_po_rates enable row level security;

drop policy if exists "auth_all_custom_po_rates" on custom_po_rates;
drop policy if exists "svc_all_custom_po_rates"  on custom_po_rates;

create policy "auth_all_custom_po_rates" on custom_po_rates for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "svc_all_custom_po_rates" on custom_po_rates for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
-- ============================================================
-- Rate Register Schema
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists rates (
  id           serial primary key,
  gauge_type   text not null,
  process_type text default 'Calibration',
  calib_type   text default 'NABL',
  repair_rate  numeric(10,2) default 0,
  calib_rate   numeric(10,2) default 0,
  unit         text default 'Per Instrument',
  remark       text default '',
  created_at   timestamptz default now()
);

alter table rates enable row level security;

drop policy if exists "auth_all_rates" on rates;
drop policy if exists "svc_all_rates"  on rates;

create policy "auth_all_rates" on rates for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "svc_all_rates" on rates for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
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
-- ============================================================
-- Convert gauges.id from manual integer → auto-increment serial
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- Create sequence starting after the current max id
create sequence if not exists gauges_id_seq;

select setval('gauges_id_seq', coalesce((select max(id) from gauges), 0) + 1, false);

alter table gauges alter column id set default nextval('gauges_id_seq');

alter sequence gauges_id_seq owned by gauges.id;
-- ============================================================
-- Lab ID auto-generation for inward_items
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- Sequence that resets each year (managed via a function)
create sequence if not exists lab_id_seq start 1;

-- Function to generate VMC-YYYY-NNNN style lab IDs
create or replace function generate_lab_id()
returns text
language plpgsql
as $$
declare
  year_str text := to_char(current_date, 'YYYY');
  seq_val  bigint;
begin
  select nextval('lab_id_seq') into seq_val;
  return 'VMC-' || year_str || '-' || lpad(seq_val::text, 4, '0');
end;
$$;

-- Trigger function: auto-set lab_id if not provided
create or replace function set_lab_id_if_empty()
returns trigger
language plpgsql
as $$
begin
  if NEW.lab_id is null or trim(NEW.lab_id) = '' then
    NEW.lab_id := generate_lab_id();
  end if;
  return NEW;
end;
$$;

-- Attach trigger to inward_items
drop trigger if exists trg_set_lab_id on inward_items;
create trigger trg_set_lab_id
  before insert on inward_items
  for each row
  execute function set_lab_id_if_empty();
-- ============================================================
-- Convert parties.id from manual integer → auto-increment serial
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- Step 1: Create a sequence starting from max existing id + 1
create sequence if not exists parties_id_seq;

-- Step 2: Set the sequence to start after the current max id
select setval('parties_id_seq', coalesce((select max(id) from parties), 0) + 1, false);

-- Step 3: Set the column default to use the sequence
alter table parties alter column id set default nextval('parties_id_seq');

-- Step 4: Make the sequence owned by the column (so it drops with the table)
alter sequence parties_id_seq owned by parties.id;

-- ============================================================
-- Performance Indexes for Fast Sorting & Lookups
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_parties_created_at ON parties(created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_gauges_created_at ON gauges(created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_calib_jobs_created_at ON calib_jobs(created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_dispatches_created_at ON dispatches(created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(receipt_date DESC NULLS LAST, created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_equipments_created_at ON equipments(created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_equipment_history_created_at ON equipment_history(created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON quotations(created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_at ON purchase_orders(created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON employees(created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_inward_bills_created_at ON inward_bills(created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_inward_items_created_at ON inward_items(created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_firms_created_at ON firms(created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_instrument_repairs_created_at ON instrument_repairs(created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_rates_created_at ON rates(created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_scopes_created_at ON scopes(created_at DESC NULLS LAST);

-- Foreign Key & Relationship Indexes
CREATE INDEX IF NOT EXISTS idx_inward_items_bill_id ON inward_items(inward_bill_id);
CREATE INDEX IF NOT EXISTS idx_receipts_invoice_ref ON receipts(invoice_ref);
CREATE INDEX IF NOT EXISTS idx_invoices_party ON invoices(party);
CREATE INDEX IF NOT EXISTS idx_dispatches_job_id ON dispatches(job_id);

-- Lookup & Dropdown Autocomplete Indexes
CREATE INDEX IF NOT EXISTS idx_parties_name ON parties(name);
CREATE INDEX IF NOT EXISTS idx_gauges_gauge_name ON gauges(gauge_name);
CREATE INDEX IF NOT EXISTS idx_equipments_name ON equipments(equipment_name);
CREATE INDEX IF NOT EXISTS idx_calib_jobs_lab_id ON calib_jobs(lab_id);

-- Status & Filter Indexes
CREATE INDEX IF NOT EXISTS idx_calib_jobs_status ON calib_jobs(status);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_dispatches_status ON dispatches(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date DESC NULLS LAST);
