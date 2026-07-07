-- Optional: view orders with community fields extracted (run in SQL Editor)

select
  id,
  customer->>'name' as name,
  customer->>'phone' as phone,
  customer->>'tower' as tower,
  customer->>'flat' as flat,
  customer->>'deliveryType' as delivery_type,
  shipping as delivery_fee,
  total,
  status,
  created_at
from orders
order by created_at desc;
