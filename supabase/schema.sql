-- Coorg Farm — orders table (Supabase)
-- Run in Supabase → SQL Editor only if the table does not exist yet.

create table if not exists orders (
  id          text primary key,
  customer    jsonb not null,
  items       jsonb not null,
  subtotal    numeric not null,
  shipping    numeric not null,   -- 0 = tower pickup, 10 = home delivery
  total       numeric not null,
  status      text not null default 'pending',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);

-- customer JSON shape (community checkout):
-- {
--   "name": "Ravi Kumar",
--   "phone": "9876543210",
--   "tower": "1",
--   "flat": "601",
--   "deliveryType": "pickup" | "home",
--   "notes": "optional"
-- }
--
-- items JSON shape:
-- [
--   {
--     "productId": "1",
--     "name": "Arabica Coffee Beans",
--     "pricePerKg": 980,
--     "unit": "kg",
--     "qty": 2,
--     "total": 1960
--   }
-- ]

-- No column changes needed when checkout fields change — customer & items are JSONB.

alter table orders enable row level security;
