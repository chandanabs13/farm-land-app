import { updateOrderStatus, deleteOrder } from '../lib/db.js';
import { requireAdmin } from '../lib/auth.js';

export default async function handler(req, res) {
  const denied = requireAdmin(req);
  if (denied) return res.status(denied.status).json({ error: denied.error });

  const { id } = req.query;

  if (req.method === 'PATCH') {
    const { status } = req.body || {};
    const allowed = ['pending', 'confirmed', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    try {
      const updated = await updateOrderStatus(id, status);
      if (!updated) return res.status(404).json({ error: 'Order not found' });
      return res.status(200).json(updated);
    } catch (err) {
      console.error('PATCH /api/orders:', err.message);
      return res.status(500).json({ error: 'Failed to update order' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const removed = await deleteOrder(id);
      if (!removed) return res.status(404).json({ error: 'Order not found' });
      return res.status(200).json(removed);
    } catch (err) {
      console.error('DELETE /api/orders:', err.message);
      return res.status(500).json({ error: 'Failed to delete order' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
