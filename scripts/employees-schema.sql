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
