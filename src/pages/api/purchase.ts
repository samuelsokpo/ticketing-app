import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Securely get the user from Supabase session
  const supabase = createPagesServerClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized: You must be logged in' });
  }

  const { eventId, paymentMethod, amount: customAmount } = req.body;
  if (!eventId || !paymentMethod) return res.status(400).json({ error: 'Missing fields' });

  try {
    // Look up the local user by email from the secure session
    const localUser = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    });
    
    // If localUser doesn't exist yet (e.g. no trigger setup), we'll gracefully leave userId null
    const userId = localUser?.id || null;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const amount = customAmount ? Number(customAmount) : event.price;
    // create purchase intent
    const paymentRef = `txn_${uuidv4()}`;
    const purchase = await prisma.purchase.create({ 
      data: { userId, eventId, amount, paymentRef, paid: false } 
    });

    if (paymentMethod === 'wallet') {
      if (!userId) return res.status(400).json({ error: 'User wallet not found' });
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance < amount) return res.status(402).json({ error: 'Insufficient wallet balance' });
      // debit wallet and mark purchase paid atomically
      await prisma.$transaction([
        prisma.wallet.update({ where: { userId }, data: { balance: { decrement: amount } } }),
        prisma.purchase.update({ where: { id: purchase.id }, data: { paid: true } }),
      ]);
      return res.json({ ok: true, purchaseId: purchase.id, status: 'paid' });
    }

    // For external payment (Paystack), return a payment reference for client to initialize
    return res.json({ ok: true, purchaseId: purchase.id, paymentRef, amount, paymentUrl: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
