import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { getUserFromRequest, getOrCreatePrismaUser, findOrEnsureEvent } from '../../lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 1. Authenticate user from JWT token
  const { user: supabaseUser, error: authError } = await getUserFromRequest(req);
  if (authError || !supabaseUser) {
    return res.status(401).json({ error: authError || 'Unauthorized: You must be logged in' });
  }

  const { eventId, paymentMethod = 'paystack', amount: customAmount } = req.body;
  if (!eventId) {
    return res.status(400).json({ error: 'Missing eventId' });
  }

  try {
    // 2. Ensure Prisma local user and wallet exist
    const localUser = await getOrCreatePrismaUser(supabaseUser);
    const userId = localUser.id;

    // 3. Find or ensure event exists in database
    const event = await findOrEnsureEvent(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const amount = customAmount && Number(customAmount) > 0 ? Number(customAmount) : event.price;
    const paymentRef = `txn_${uuidv4()}`;

    // 4. Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        eventId: event.id,
        amount,
        paymentRef,
        paid: false,
      },
    });

    // 5. Handle direct wallet payment
    if (paymentMethod === 'wallet') {
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance < amount) {
        return res.status(402).json({
          error: `Insufficient wallet balance (Available: ₦${(wallet?.balance || 0).toLocaleString()}, Needed: ₦${amount.toLocaleString()})`,
        });
      }

      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId },
          data: { balance: { decrement: amount } },
        }),
        prisma.purchase.update({
          where: { id: purchase.id },
          data: { paid: true },
        }),
      ]);

      return res.json({ ok: true, purchaseId: purchase.id, status: 'paid' });
    }

    // 6. Handle Paystack gateway payment
    return res.json({
      ok: true,
      purchaseId: purchase.id,
      paymentRef,
      amount,
      email: localUser.email,
    });
  } catch (err: any) {
    console.error('Purchase error:', err);
    return res.status(500).json({ error: err.message || 'Server error during purchase' });
  }
}
