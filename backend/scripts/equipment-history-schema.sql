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
