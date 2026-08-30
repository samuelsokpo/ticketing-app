import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getUserFromRequest, getOrCreatePrismaUser } from '../../../lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // 1. Authenticate user from JWT token
  const { user: supabaseUser, error: authError } = await getUserFromRequest(req);
  if (authError || !supabaseUser) {
    return res.status(401).json({ error: authError || 'Unauthorized: You must be logged in' });
  }

  try {
    // 2. Ensure Prisma local user and wallet exist
    const localUser = await getOrCreatePrismaUser(supabaseUser);

    // 3. Compute real-time user statistics
    const ticketsPurchased = await prisma.purchase.count({
      where: { userId: localUser.id, paid: true },
    });

    const total = await prisma.purchase.aggregate({
      where: { userId: localUser.id, paid: true },
      _sum: { amount: true },
    });
    const totalSpent = total._sum.amount || 0;

    const FREE_THRESHOLD = Number(process.env.FREE_THRESHOLD || 50000);
    const progressPercent = Math.min(100, Math.round((totalSpent / FREE_THRESHOLD) * 100));

    const badges = [
      { id: 'first', title: 'First Purchase', earned: ticketsPurchased >= 1 },
      { id: '5tickets', title: '5 Tickets', earned: ticketsPurchased >= 5 },
      { id: '10tickets', title: '10 Tickets', earned: ticketsPurchased >= 10 },
    ];

    // Fetch user's purchased tickets / events
    const purchases = await prisma.purchase.findMany({
      where: { userId: localUser.id, paid: true },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return res.json({
      ok: true,
      ticketsPurchased,
      walletBalance: localUser.wallet?.balance || 0,
      totalSpent,
      progressPercent,
      badges,
      purchases,
    });
  } catch (err: any) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ error: err.message || 'Server error fetching dashboard data' });
  }
}
