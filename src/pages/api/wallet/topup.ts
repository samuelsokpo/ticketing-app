import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { createAuthenticatedClient } from '../../../lib/supabaseServer';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { amount } = req.body;
  if (!amount || amount < 1000) {
    return res.status(400).json({ error: 'Minimum top up amount is ₦1,000' });
  }

  // Get the access token from the Authorization header
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const supabase = createAuthenticatedClient(token);
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const localUser = await prisma.user.findUnique({ where: { email: user.email } });
    if (!localUser) {
      return res.status(404).json({ error: 'User not found in local db. Please visit dashboard first.' });
    }

    // Generate a unique reference starting with topup_
    const paymentRef = `topup_${uuidv4()}`;

    // Create a pending TopUp record
    const topup = await prisma.topUp.create({
      data: {
        userId: localUser.id,
        amount: Number(amount),
        paymentRef,
        paid: false,
      }
    });

    res.json({ ok: true, paymentRef: topup.paymentRef, email: localUser.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
}
