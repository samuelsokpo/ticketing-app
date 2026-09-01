import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const raw: any[] = await prisma.$queryRaw`
      SELECT e.id, e.title, e.slug, e.description, e.location, e."startAt", e.price, e.capacity,
             COUNT(p.id)::int AS purchases_last_24h,
             (SELECT COUNT(*)::int FROM "Purchase" WHERE "eventId" = e.id AND paid = TRUE) AS tickets_sold
      FROM "Event" e
      LEFT JOIN "Purchase" p ON p."eventId" = e.id AND p.paid = TRUE AND p."createdAt" >= NOW() - INTERVAL '24 HOURS'
      GROUP BY e.id
      ORDER BY purchases_last_24h DESC
      LIMIT 12;`;

    // Safely serialize BigInt values and compute remaining tickets
    const safe = raw.map((row: any) => {
      const obj: any = {};
      for (const [key, value] of Object.entries(row)) {
        obj[key] = typeof value === 'bigint' ? Number(value) : value;
      }
      obj.ticketsSold = obj.tickets_sold || 0;
      obj.ticketsRemaining = Math.max(0, (obj.capacity || 0) - obj.ticketsSold);
      obj.soldOut = obj.ticketsRemaining === 0;
      return obj;
    });

    res.json({ ok: true, events: safe });
  } catch (err) {
    console.error('hot-takes error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
