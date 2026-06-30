-- Run this in Supabase → SQL Editor if your table columns don't match

create table if not exists orders (
  id          text primary key,
  customer    jsonb not null,
  items       jsonb not null,
  subtotal    numeric not null,
  shipping    numeric not null,
  total       numeric not null,
  status      text not null default 'pending',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);

-- Optional: disable RLS for now (server uses service_role key which bypasses RLS anyway)
alter table orders enable row level security;
