import 'dotenv/config';

import { readOrders, insertOrder, updateOrderStatus, deleteOrder } from '../../server/db.js';
import { requireAdmin } from './auth.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const denied = requireAdmin(req);
    if (denied) return res.status(denied.status).json({ error: denied.error });
    try {
      return res.status(200).json(await readOrders());
    } catch {
      return res.status(500).json({ error: 'Failed to load orders' });
    }
  }

  if (req.method === 'POST') {
    const { customer, items, subtotal, shipping, total } = req.body;
    if (!customer?.email || !items?.length || total == null) {
      return res.status(400).json({ error: 'Invalid order data' });
    }
    try {
      const order = await insertOrder({
        id: `ORD-${Date.now()}`,
        customer,
        items,
        subtotal,
        shipping,
        total,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      return res.status(201).json(order);
    } catch (err) {
      console.error('POST /api/orders:', err.message);
      return res.status(500).json({ error: 'Failed to save order' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
