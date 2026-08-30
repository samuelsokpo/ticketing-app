import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { getUserFromRequest, getOrCreatePrismaUser } from '../../../lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { amount } = req.body;
  const numAmount = Number(amount);
  if (!amount || isNaN(numAmount) || numAmount < 100) {
    return res.status(400).json({ error: 'Minimum top up amount is ₦100' });
  }

  // 1. Authenticate user from JWT token
  const { user: supabaseUser, error: authError } = await getUserFromRequest(req);
  if (authError || !supabaseUser) {
    return res.status(401).json({ error: authError || 'Unauthorized: You must be logged in' });
  }

  try {
    // 2. Ensure Prisma local user and wallet exist
    const localUser = await getOrCreatePrismaUser(supabaseUser);

    // 3. Generate a unique reference starting with topup_
    const paymentRef = `topup_${uuidv4()}`;

    // 4. Create pending TopUp record
    const topup = await prisma.topUp.create({
      data: {
        userId: localUser.id,
        amount: numAmount,
        paymentRef,
        paid: false,
      },
    });

    return res.json({
      ok: true,
      paymentRef: topup.paymentRef,
      email: localUser.email,
      amount: numAmount,
    });
  } catch (err: any) {
    console.error('Wallet top-up error:', err);
    return res.status(500).json({ error: err.message || 'Server error during wallet top-up' });
  }
}
