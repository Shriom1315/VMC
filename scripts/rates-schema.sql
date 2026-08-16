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
