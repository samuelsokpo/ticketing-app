import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Securely get the user from Supabase session
  const supabase = createPagesServerClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseEmail = session.user.email!;
  
  try {
    // 1. Find or create the local user
    let user = await prisma.user.findUnique({ where: { email: supabaseEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: supabaseEmail,
          name: session.user.user_metadata?.full_name || supabaseEmail.split('@')[0],
        }
      });
    }

    // 2. Find or create the Wallet
    let wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
        }
      });
    }

    // 3. Get Stats
    const ticketsPurchased = await prisma.purchase.count({ where: { userId: user.id, paid: true } });
    const total = await prisma.purchase.aggregate({ where: { userId: user.id, paid: true }, _sum: { amount: true } });
    const totalSpent = total._sum.amount || 0;
    
    const FREE_THRESHOLD = Number(process.env.FREE_THRESHOLD || 50000);
    const progressPercent = Math.min(100, Math.round((totalSpent / FREE_THRESHOLD) * 100));
    const badges = [
      { id: 'first', title: 'First Purchase', earned: ticketsPurchased >= 1 },
      { id: '5tickets', title: '5 Tickets', earned: ticketsPurchased >= 5 },
      { id: '10tickets', title: '10 Tickets', earned: ticketsPurchased >= 10 },
    ];

    res.json({ 
      ok: true, 
      ticketsPurchased, 
      walletBalance: wallet.balance, 
      totalSpent, 
      progressPercent, 
      badges 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}
