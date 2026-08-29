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
