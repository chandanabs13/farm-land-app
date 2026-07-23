import { readProducts, seedProductsIfEmpty, insertProduct } from '../lib/products.js';
import { requireAdmin } from '../lib/auth.js';
import { parseBody } from '../lib/parseBody.js';
import { INITIAL_PRODUCTS } from '../lib/seedProducts.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      let products = await readProducts();
      if (products.length === 0) {
        products = await seedProductsIfEmpty(INITIAL_PRODUCTS);
      }
      return res.status(200).json(products);
    } catch (err) {
      console.error('GET /api/products:', err.message);
      return res.status(500).json({ error: 'Failed to load products', details: err.message });
    }
  }

  if (req.method === 'POST') {
    const denied = requireAdmin(req);
    if (denied) return res.status(denied.status).json({ error: denied.error });

    const body = parseBody(req);
    if (!body?.name?.trim() || body.pricePerKg == null) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    try {
      const product = await insertProduct({
        ...body,
        id: body.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
      });
      return res.status(201).json(product);
    } catch (err) {
      console.error('POST /api/products:', err.message);
      return res.status(500).json({ error: 'Failed to add product', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
