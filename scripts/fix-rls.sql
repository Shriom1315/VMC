-- ============================================================
-- Fix RLS policies — allow authenticated users to read AND write
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Drop the old restrictive write policies
drop policy if exists "svc write parties"     on parties;
drop policy if exists "svc write gauges"      on gauges;
drop policy if exists "svc write app_users"   on app_users;
drop policy if exists "svc write calib_jobs"  on calib_jobs;
drop policy if exists "svc write dispatches"  on dispatches;
drop policy if exists "svc write invoices"    on invoices;
drop policy if exists "svc write receipts"    on receipts;

-- Also drop old read policies (we'll recreate them combined)
drop policy if exists "auth read parties"     on parties;
drop policy if exists "auth read gauges"      on gauges;
drop policy if exists "auth read app_users"   on app_users;
drop policy if exists "auth read calib_jobs"  on calib_jobs;
drop policy if exists "auth read dispatches"  on dispatches;
drop policy if exists "auth read invoices"    on invoices;
drop policy if exists "auth read receipts"    on receipts;

-- New: authenticated users can do everything (read + write)
-- This covers both the anon key (when logged in) and service_role
create policy "auth all parties"     on parties     for all using (auth.role() in ('authenticated', 'service_role')) with check (auth.role() in ('authenticated', 'service_role'));
create policy "auth all gauges"      on gauges      for all using (auth.role() in ('authenticated', 'service_role')) with check (auth.role() in ('authenticated', 'service_role'));
create policy "auth all app_users"   on app_users   for all using (auth.role() in ('authenticated', 'service_role')) with check (auth.role() in ('authenticated', 'service_role'));
create policy "auth all calib_jobs"  on calib_jobs  for all using (auth.role() in ('authenticated', 'service_role')) with check (auth.role() in ('authenticated', 'service_role'));
create policy "auth all dispatches"  on dispatches  for all using (auth.role() in ('authenticated', 'service_role')) with check (auth.role() in ('authenticated', 'service_role'));
create policy "auth all invoices"    on invoices    for all using (auth.role() in ('authenticated', 'service_role')) with check (auth.role() in ('authenticated', 'service_role'));
create policy "auth all receipts"    on receipts    for all using (auth.role() in ('authenticated', 'service_role')) with check (auth.role() in ('authenticated', 'service_role'));
