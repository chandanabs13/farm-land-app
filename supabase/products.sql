-- Run once in Supabase → SQL Editor
-- Shared products catalog (same on laptop + mobile)

create table if not exists products (
  id           text primary key,
  name         text not null,
  category     text not null,
  origin       text not null,
  price_per_kg numeric not null,
  unit         text not null default 'kg',
  description  text not null default '',
  image        text,
  emoji        text default '🌿',
  available    boolean not null default true,
  featured     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz
);

alter table products enable row level security;
