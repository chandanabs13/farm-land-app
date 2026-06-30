import crypto from 'crypto';

const SESSION_HOURS = 12;

export function createToken() {
  const secret = process.env.ADMIN_SECRET || 'coorg-farm-admin-secret-change-me';
  const exp = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyToken(token) {
  if (!token) return false;
  const secret = process.env.ADMIN_SECRET || 'coorg-farm-admin-secret-change-me';
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (sig !== expected) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return Date.now() < exp;
  } catch {
    return false;
  }
}

export function verifyPassword(password) {
  return password === (process.env.ADMIN_PASSWORD || 'CoorgFarm@2026');
}

export function requireAdmin(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!verifyToken(token)) return { error: 'Admin access required', status: 401 };
  return null;
}
