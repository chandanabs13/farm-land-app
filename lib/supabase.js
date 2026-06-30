import { createClient } from '@supabase/supabase-js';

let client;

function normalizeUrl(url) {
  if (!url) return url;
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
}

export function getSupabaseConfig() {
  const url = normalizeUrl(process.env.SUPABASE_URL);
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  return { url, key };
}

export function getKeyRole(key) {
  if (!key) return null;
  try {
    const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString());
    return payload.role;
  } catch {
    return 'unknown';
  }
}

export function getSupabase() {
  if (client) return client;

  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  if (getKeyRole(key) === 'anon') {
    throw new Error('Use service_role key in SUPABASE_SERVICE_ROLE_KEY, not anon key');
  }

  client = createClient(url, key);
  return client;
}
