-- ============================================================
-- Convert gauges.id from manual integer → auto-increment serial
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- Create sequence starting after the current max id
create sequence if not exists gauges_id_seq;

select setval('gauges_id_seq', coalesce((select max(id) from gauges), 0) + 1, false);

alter table gauges alter column id set default nextval('gauges_id_seq');

alter sequence gauges_id_seq owned by gauges.id;
