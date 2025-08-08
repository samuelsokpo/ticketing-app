import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { search, limit = '12', cursor } = req.query;
    const take = Number(limit);
    const where: any = {};
    if (search) where.OR = [{ title: { contains: String(search), mode: 'insensitive' } }, { description: { contains: String(search), mode: 'insensitive' } }];

    const events = await prisma.event.findMany({ where, take, orderBy: { startAt: 'asc' } });
    // add purchaseCount for each
    const enriched = await Promise.all(events.map(async (e) => {
      const purchases = await prisma.purchase.count({ where: { eventId: e.id, paid: true } });
      return { ...e, purchaseCount: purchases };
    }));

    res.json({ ok: true, events: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
