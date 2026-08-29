-- ============================================================
-- Quotations and Purchase Orders tables
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists quotations (
  id              uuid primary key default uuid_generate_v4(),
  quotation_no    text unique not null,
  date            date,
  client_name     text default '',
  client_address  text default '',
  client_gstin    text default '',
  kind_attn       text default '',
  client_dc_no    text default '',
  client_dc_date  date,
  po_no           text default '',
  discount_percent numeric(5,2) default 0,
  base_total      numeric(12,2) default 0,
  discount_amount numeric(12,2) default 0,
  net_total       numeric(12,2) default 0,
  rounded_total   numeric(12,2) default 0,
  items           jsonb default '[]',
  created_by      text default '',
  created_at      timestamptz default now()
);

create table if not exists purchase_orders (
  id              uuid primary key default uuid_generate_v4(),
  po_number       text unique not null,
  po_date         date,
  customer_name   text default '',
  address         text default '',
  total_qty       integer default 0,
  total_amount    numeric(12,2) default 0,
  items           jsonb default '[]',
  created_by      text default '',
  created_at      timestamptz default now()
);

alter table quotations     enable row level security;
alter table purchase_orders enable row level security;

create policy "auth all quotations"      on quotations      for all using (auth.role() in ('authenticated','service_role')) with check (auth.role() in ('authenticated','service_role'));
create policy "auth all purchase_orders" on purchase_orders for all using (auth.role() in ('authenticated','service_role')) with check (auth.role() in ('authenticated','service_role'));
