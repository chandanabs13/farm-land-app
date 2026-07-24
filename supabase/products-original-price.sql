-- Run once if products table already exists (adds MRP / strike-through price)
alter table products
  add column if not exists original_price numeric;
