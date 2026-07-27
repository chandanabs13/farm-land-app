-- Run once in Supabase → SQL Editor
-- Stores admin browser push subscriptions (Zomato-style notifications)

create table if not exists push_subscriptions (
  endpoint   text primary key,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;
