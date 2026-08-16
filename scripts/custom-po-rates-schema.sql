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
