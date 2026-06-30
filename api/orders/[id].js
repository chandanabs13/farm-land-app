import { updateOrderStatus, deleteOrder } from '../../lib/db.js';
import { requireAdmin } from '../../lib/auth.js';

function formatError(err) {
  console.error('API error:', err.message, err.code, err.hint);
  return {
    error: 'Request failed',
    details: err.message,
    hint: err.hint,
  };
}

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
      return res.status(500).json(formatError(err));
    }
  }

  if (req.method === 'DELETE') {
    try {
      const removed = await deleteOrder(id);
      if (!removed) return res.status(404).json({ error: 'Order not found' });
      return res.status(200).json(removed);
    } catch (err) {
      return res.status(500).json(formatError(err));
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
