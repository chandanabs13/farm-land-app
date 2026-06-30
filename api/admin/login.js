import 'dotenv/config';

import { verifyPassword, createToken } from '../../server/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  if (!verifyPassword(password)) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  return res.status(200).json({ token: createToken() });
}
