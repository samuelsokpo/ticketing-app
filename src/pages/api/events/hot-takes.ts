import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const raw = await prisma.$queryRaw`
      SELECT e.id, e.title, e.slug, e.description, e.location, e.startAt, e.price, COUNT(p.id) AS purchases_last_24h
      FROM "Event" e
      LEFT JOIN "Purchase" p ON p."eventId" = e.id AND p.paid = TRUE AND p."createdAt" >= NOW() - INTERVAL '24 HOURS'
      GROUP BY e.id
      ORDER BY purchases_last_24h DESC
      LIMIT 12;`;
    res.json({ ok: true, events: raw });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
