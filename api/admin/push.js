import { requireAdmin } from '../../lib/auth.js';
import { parseBody } from '../../lib/parseBody.js';
import { savePushSubscription, deletePushSubscription } from '../../lib/pushSubscriptions.js';

export default async function handler(req, res) {
  const denied = requireAdmin(req);
  if (denied) return res.status(denied.status).json({ error: denied.error });

  if (req.method === 'GET') {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    if (!publicKey) {
      return res.status(503).json({ error: 'Push notifications not configured (missing VAPID_PUBLIC_KEY)' });
    }
    return res.status(200).json({ publicKey });
  }

  if (req.method === 'POST') {
    const body = parseBody(req);
    try {
      await savePushSubscription(body);
      return res.status(201).json({ ok: true });
    } catch (err) {
      console.error('POST push subscribe:', err.message);
      return res.status(500).json({ error: 'Could not save subscription', details: err.message });
    }
  }

  if (req.method === 'DELETE') {
    const body = parseBody(req);
    try {
      await deletePushSubscription(body?.endpoint);
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: 'Could not remove subscription', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
