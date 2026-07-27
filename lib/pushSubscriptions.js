import { getSupabase } from './supabase.js';

export async function savePushSubscription(sub) {
  const endpoint = sub?.endpoint;
  const p256dh = sub?.keys?.p256dh;
  const auth = sub?.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    throw new Error('Invalid push subscription');
  }

  const { data, error } = await getSupabase()
    .from('push_subscriptions')
    .upsert(
      {
        endpoint,
        p256dh,
        auth,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePushSubscription(endpoint) {
  if (!endpoint) return;
  const { error } = await getSupabase()
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);
  if (error) throw error;
}

export async function listPushSubscriptions() {
  const { data, error } = await getSupabase()
    .from('push_subscriptions')
    .select('*');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    endpoint: row.endpoint,
    keys: { p256dh: row.p256dh, auth: row.auth },
  }));
}
