import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { getUserFromRequest, getOrCreatePrismaUser, findOrEnsureEvent } from '../../lib/supabaseServer';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 1. Authenticate user from JWT token
  const { user: supabaseUser, error: authError } = await getUserFromRequest(req);
  if (authError || !supabaseUser) {
    return res.status(401).json({ error: authError || 'Unauthorized: You must be logged in' });
  }

  const { eventId, amount: customAmount } = req.body;
  if (!eventId) {
    return res.status(400).json({ error: 'Missing eventId' });
  }

  try {
    // 2. Ensure Prisma local user exists
    const localUser = await getOrCreatePrismaUser(supabaseUser);
    const userId = localUser.id;

    // 3. Find or ensure event exists in database
    const event = await findOrEnsureEvent(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // 4. CHECK TICKET AVAILABILITY — security gate to prevent overselling
    const ticketsSold = await prisma.purchase.count({
      where: { eventId: event.id, paid: true },
    });
    const ticketsRemaining = event.capacity - ticketsSold;
    if (ticketsRemaining <= 0) {
      return res.status(409).json({
        error: 'SOLD OUT — All tickets for this event have been purchased.',
        soldOut: true,
      });
    }

    const amount = customAmount && Number(customAmount) > 0 ? Number(customAmount) : event.price;
    const paymentRef = `txn_${uuidv4()}`;

    // 4. Create purchase record (unpaid)
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        eventId: event.id,
        amount,
        paymentRef,
        paid: false,
      },
    });

    // 5. Initialize transaction on Paystack server-side
    //    This returns an authorization_url the client redirects to.
    const callbackUrl = `${req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || 'https://okpogroup.com'}/api/payment/callback`;

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: localUser.email,
        amount: Math.round(amount * 100), // Paystack expects kobo
        reference: paymentRef,
        callback_url: callbackUrl,
        metadata: {
          purchase_id: purchase.id,
          event_title: event.title,
          user_id: userId,
        },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status || !paystackData.data?.authorization_url) {
      console.error('Paystack initialize error:', paystackData);
      return res.status(502).json({
        error: paystackData.message || 'Failed to initialize payment with Paystack',
      });
    }

    // 6. Return the authorization URL for the client to redirect to
    return res.json({
      ok: true,
      purchaseId: purchase.id,
      paymentRef,
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
    });
  } catch (err: any) {
    console.error('Purchase error:', err);
    return res.status(500).json({ error: err.message || 'Server error during purchase' });
  }
}
