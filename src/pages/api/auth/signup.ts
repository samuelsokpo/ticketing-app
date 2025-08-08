import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(200).json({ ok: true, user: existing, next: 'login' });

    const user = await prisma.user.create({ data: { name, email, phone } });
    // create wallet
    await prisma.wallet.create({ data: { userId: user.id, balance: 0 } });

    // issue a lightweight JWT session (for demo only)
    const token = jwt.sign({ uid: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({ ok: true, user: { id: user.id, name: user.name, email: user.email }, token, next: 'verify' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
