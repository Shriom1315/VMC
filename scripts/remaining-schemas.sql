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
