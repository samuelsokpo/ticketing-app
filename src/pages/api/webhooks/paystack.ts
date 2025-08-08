import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import prisma from '../../../lib/prisma';

const PAYSTACK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const signature = req.headers['x-paystack-signature'] as string | undefined;
  const bodyRaw = JSON.stringify(req.body);

  // Validate signature
  if (PAYSTACK_SECRET && signature) {
    const hmac = crypto.createHmac('sha512', PAYSTACK_SECRET).update(bodyRaw).digest('hex');
    if (hmac !== signature) {
      console.warn('Invalid Paystack signature');
      return res.status(401).send('Invalid signature');
    }
  }

  const event = req.body;
  // Paystack sends structure: { event: 'charge.success', data: { reference, amount, ... } }
  const eventType = event.event;
  try {
    if (eventType === 'charge.success') {
      const reference = event.data.reference;
      const amount = (event.data.amount || 0) / 100; // paystack sends kobo
      const purchase = await prisma.purchase.findUnique({ where: { paymentRef: reference } });
      if (!purchase) {
        console.warn('Purchase not found for reference', reference);
        return res.status(200).send('ok');
      }
      // Mark paid and set paymentRef
      await prisma.purchase.update({ where: { id: purchase.id }, data: { paid: true } });

      // Optionally top-up wallet if payload indicates wallet topup
      return res.status(200).send('ok');
    }

    return res.status(200).send('ignored');
  } catch (err) {
    console.error(err);
    return res.status(500).send('error');
  }
}
