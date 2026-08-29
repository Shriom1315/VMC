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
