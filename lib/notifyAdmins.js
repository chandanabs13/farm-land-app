/**
 * Notify admins via browser Web Push (Zomato-style phone notification).
 * Admins must open /admin once and tap "Enable notifications".
 *
 * Env:
 *   VAPID_PUBLIC_KEY=...
 *   VAPID_PRIVATE_KEY=...
 *   VAPID_SUBJECT=mailto:you@example.com
 */

import webpush from 'web-push';
import { listPushSubscriptions, deletePushSubscription } from './pushSubscriptions.js';

function formatOrderPush(order) {
  const c = order.customer || {};
  const name = (c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Customer').trim();
  const phone = c.phone || '';
  const place =
    c.tower && c.flat
      ? `Tower ${c.tower}, Flat ${c.flat}`
      : [c.address, c.city].filter(Boolean).join(', ') || '';
  const mode = c.deliveryType === 'home' ? 'Home delivery' : 'Pickup';
  const total = Number(order.total || 0).toLocaleString('en-IN');

  const bodyParts = [name, phone, place, mode, `₹${total}`].filter(Boolean);
  return {
    title: `New order · ${order.id}`,
    body: bodyParts.join(' · '),
    url: '/admin/orders',
  };
}

function configureVapid() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@coorgfarms.local',
    publicKey,
    privateKey
  );
  return true;
}

export async function notifyAdminsNewOrder(order) {
  if (!configureVapid()) {
    console.warn('notifyAdmins: VAPID keys not set — skipping push');
    return { skipped: true, reason: 'no_vapid' };
  }

  let subscriptions;
  try {
    subscriptions = await listPushSubscriptions();
  } catch (err) {
    console.error('notifyAdmins: could not load subscriptions:', err.message);
    return { ok: false, error: err.message };
  }

  if (!subscriptions.length) {
    console.warn('notifyAdmins: no admin browsers subscribed yet');
    return { skipped: true, reason: 'no_subscribers' };
  }

  const payload = JSON.stringify(formatOrderPush(order));
  let sent = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, payload);
        sent += 1;
      } catch (err) {
        const code = err.statusCode || err.status;
        console.error('notifyAdmins: push failed', code, err.message);
        if (code === 404 || code === 410) {
          await deletePushSubscription(sub.endpoint).catch(() => {});
        }
      }
    })
  );

  console.log(`notifyAdmins: push sent to ${sent}/${subscriptions.length} devices`);
  return { ok: true, sent };
}
