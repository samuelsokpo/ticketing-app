import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';

/**
 * Paystack redirects the user here after payment.
 * We verify the transaction server-side, mark the purchase as paid,
 * then redirect the user to the dashboard with a success message.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { reference, trxref } = req.query;
  const ref = (reference || trxref) as string;

  if (!ref) {
    return res.redirect('/dashboard?payment=error&msg=missing_reference');
  }

  try {
    // Verify the transaction with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    });

    const verifyData = await verifyRes.json();

    if (verifyData.status && verifyData.data?.status === 'success') {
      // Mark purchase as paid in our database
      const purchase = await prisma.purchase.findUnique({
        where: { paymentRef: ref },
      });

      if (purchase && !purchase.paid) {
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: { paid: true },
        });
      }

      return res.redirect('/dashboard?payment=success');
    } else {
      console.warn('Payment verification failed:', verifyData);
      return res.redirect(`/dashboard?payment=failed&msg=${encodeURIComponent(verifyData.data?.gateway_response || 'Payment was not successful')}`);
    }
  } catch (err: any) {
    console.error('Payment callback error:', err);
    return res.redirect('/dashboard?payment=error&msg=verification_failed');
  }
}
