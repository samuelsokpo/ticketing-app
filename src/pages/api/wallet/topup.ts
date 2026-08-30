import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { amount } = req.body;
  if (!amount || amount < 1000) {
    return res.status(400).json({ error: 'Minimum top up amount is ₦1,000' });
  }

  // Securely get user from Supabase session
  const supabase = createPagesServerClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found in local db. Please visit dashboard first.' });
    }

    // Generate a unique reference starting with topup_
    const paymentRef = `topup_${uuidv4()}`;

    // Create a pending TopUp record
    const topup = await prisma.topUp.create({
      data: {
        userId: user.id,
        amount: Number(amount),
        paymentRef,
        paid: false,
      }
    });

    res.json({ ok: true, paymentRef: topup.paymentRef, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}
