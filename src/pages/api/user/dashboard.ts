import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // In production, authenticate user via cookie/JWT
  const userId = req.query.userId as string || req.body.userId;
  if (!userId) return res.status(401).json({ error: 'Missing userId (demo)' });

  try {
    const ticketsPurchased = await prisma.purchase.count({ where: { userId, paid: true } });
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    const total = await prisma.purchase.aggregate({ where: { userId, paid: true }, _sum: { amount: true } });
    const totalSpent = total._sum.amount || 0;
    const FREE_THRESHOLD = Number(process.env.FREE_THRESHOLD || 50000);
    const progressPercent = Math.min(100, Math.round((totalSpent / FREE_THRESHOLD) * 100));
    const badges = [
      { id: 'first', title: 'First Purchase', earned: ticketsPurchased >= 1 },
      { id: '5tickets', title: '5 Tickets', earned: ticketsPurchased >= 5 },
      { id: '10tickets', title: '10 Tickets', earned: ticketsPurchased >= 10 },
    ];

    res.json({ ok: true, ticketsPurchased, walletBalance: wallet?.balance || 0, totalSpent, progressPercent, badges });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}
