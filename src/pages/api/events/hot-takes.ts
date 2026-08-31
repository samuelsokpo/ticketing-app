import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const raw: any[] = await prisma.$queryRaw`
      SELECT e.id, e.title, e.slug, e.description, e.location, e."startAt", e.price,
             COUNT(p.id)::int AS purchases_last_24h
      FROM "Event" e
      LEFT JOIN "Purchase" p ON p."eventId" = e.id AND p.paid = TRUE AND p."createdAt" >= NOW() - INTERVAL '24 HOURS'
      GROUP BY e.id
      ORDER BY purchases_last_24h DESC
      LIMIT 12;`;

    // Safely serialize BigInt values (fallback in case ::int cast doesn't cover all)
    const safe = raw.map((row: any) => {
      const obj: any = {};
      for (const [key, value] of Object.entries(row)) {
        obj[key] = typeof value === 'bigint' ? Number(value) : value;
      }
      return obj;
    });

    res.json({ ok: true, events: safe });
  } catch (err) {
    console.error('hot-takes error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
