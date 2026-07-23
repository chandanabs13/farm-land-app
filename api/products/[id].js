import {
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
} from '../../lib/products.js';
import { requireAdmin } from '../../lib/auth.js';
import { parseBody } from '../../lib/parseBody.js';

export default async function handler(req, res) {
  const denied = requireAdmin(req);
  if (denied) return res.status(denied.status).json({ error: denied.error });

  const { id } = req.query;

  if (req.method === 'PATCH') {
    const body = parseBody(req);
    try {
      if (body.toggleAvailability) {
        const updated = await toggleProductAvailability(id);
        if (!updated) return res.status(404).json({ error: 'Product not found' });
        return res.status(200).json(updated);
      }

      const updated = await updateProduct({ ...body, id });
      if (!updated) return res.status(404).json({ error: 'Product not found' });
      return res.status(200).json(updated);
    } catch (err) {
      console.error('PATCH /api/products:', err.message);
      return res.status(500).json({ error: 'Failed to update product', details: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const removed = await deleteProduct(id);
      if (!removed) return res.status(404).json({ error: 'Product not found' });
      return res.status(200).json(removed);
    } catch (err) {
      console.error('DELETE /api/products:', err.message);
      return res.status(500).json({ error: 'Failed to delete product', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
