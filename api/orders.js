import { readOrders, insertOrder } from '../lib/db.js';
import { requireAdmin } from '../lib/auth.js';
import { parseBody } from '../lib/parseBody.js';

function formatError(err) {
  console.error('API error:', err.message, err.code, err.hint);
  return {
    error: err.message?.includes('Missing') || err.message?.includes('service_role')
      ? err.message
      : 'Request failed',
    details: err.message,
    hint: err.hint,
  };
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const denied = requireAdmin(req);
    if (denied) return res.status(denied.status).json({ error: denied.error });
    try {
      return res.status(200).json(await readOrders());
    } catch (err) {
      return res.status(500).json(formatError(err));
    }
  }

  if (req.method === 'POST') {
    const { customer, items, subtotal, shipping, total } = parseBody(req);
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
      return res.status(500).json(formatError(err));
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
