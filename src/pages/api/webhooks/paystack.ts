import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import prisma from '../../../lib/prisma';
import { buffer } from 'micro';

// Disable default body parser to get raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

const PAYSTACK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  try {
    const rawBody = await buffer(req);
    const signature = req.headers['x-paystack-signature'] as string | undefined;

    // Validate signature
    if (PAYSTACK_SECRET && signature) {
      const hmac = crypto.createHmac('sha512', PAYSTACK_SECRET).update(rawBody).digest('hex');
      if (hmac !== signature) {
        console.warn('Invalid Paystack signature');
        return res.status(401).send('Invalid signature');
      }
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    // Paystack sends structure: { event: 'charge.success', data: { reference, amount, ... } }
    const eventType = event.event;
    
    if (eventType === 'charge.success') {
      const reference = event.data.reference;
      const amount = (event.data.amount || 0) / 100; // paystack sends kobo
      
      // Handle Wallet TopUp
      if (reference.startsWith('topup_')) {
        const topup = await prisma.topUp.findUnique({ where: { paymentRef: reference } });
        if (!topup) {
          console.warn('TopUp not found for reference', reference);
          return res.status(200).send('ok');
        }
        
        if (!topup.paid) {
          // 1. Mark top-up as paid
          await prisma.topUp.update({ where: { id: topup.id }, data: { paid: true } });
          
          // 2. Add amount to wallet balance
          await prisma.wallet.update({
            where: { userId: topup.userId },
            data: { balance: { increment: topup.amount } }
          });
        }
        
        return res.status(200).send('ok');
      }
      
      // Handle Ticket Purchase
      const purchase = await prisma.purchase.findUnique({ where: { paymentRef: reference } });
      
      if (!purchase) {
        console.warn('Purchase not found for reference', reference);
        return res.status(200).send('ok');
      }
      
      // Mark paid
      if (!purchase.paid) {
        await prisma.purchase.update({ where: { id: purchase.id }, data: { paid: true } });
      }

      return res.status(200).send('ok');
    }

    return res.status(200).send('ignored');
  } catch (err) {
    console.error(err);
    return res.status(500).send('error');
  }
}
