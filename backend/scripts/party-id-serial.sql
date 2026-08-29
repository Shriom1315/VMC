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
