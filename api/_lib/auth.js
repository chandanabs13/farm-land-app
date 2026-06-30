import 'dotenv/config';
import { verifyToken } from '../../server/auth.js';

export { verifyPassword, createToken } from '../../server/auth.js';

export function requireAdmin(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!verifyToken(token)) return { error: 'Admin access required', status: 401 };
  return null;
}
