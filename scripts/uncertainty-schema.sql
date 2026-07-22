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
