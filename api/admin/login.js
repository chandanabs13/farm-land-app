import { verifyPassword, createToken } from '../../lib/auth.js';
import { parseBody } from '../../lib/parseBody.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = parseBody(req);
  if (!verifyPassword(password)) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  return res.status(200).json({ token: createToken() });
}
