import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, eventId, paymentMethod } = req.body;
  if (!eventId || !paymentMethod) return res.status(400).json({ error: 'Missing fields' });

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const amount = event.price;
    // create purchase intent
    const paymentRef = `txn_${uuidv4()}`;
    const purchase = await prisma.purchase.create({ data: { userId, eventId, amount, paymentRef, paid: false } });

    if (paymentMethod === 'wallet') {
      if (!userId) return res.status(400).json({ error: 'userId required for wallet payments' });
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance < amount) return res.status(402).json({ error: 'Insufficient wallet balance' });
      // debit wallet and mark purchase paid atomically
      await prisma.$transaction([
        prisma.wallet.update({ where: { userId }, data: { balance: { decrement: amount } } }),
        prisma.purchase.update({ where: { id: purchase.id }, data: { paid: true } }),
      ]);
      return res.json({ ok: true, purchaseId: purchase.id, status: 'paid' });
    }

    // For external payment (Paystack/Stripe), return a payment reference for client to initialize
    return res.json({ ok: true, purchaseId: purchase.id, paymentRef, amount, paymentUrl: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
