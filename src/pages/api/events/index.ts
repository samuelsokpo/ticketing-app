import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { DEFAULT_EVENTS } from '../../../lib/eventsData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { search, limit = '20' } = req.query;
    const take = Number(limit);
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { slug: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    let events = await prisma.event.findMany({ where, take, orderBy: { startAt: 'asc' } });

    // If database has 0 events, auto-seed with standard defaults
    if (events.length === 0 && !search) {
      for (const evt of DEFAULT_EVENTS) {
        await prisma.event.upsert({
          where: { slug: evt.slug },
          update: {},
          create: { ...evt },
        });
      }
      events = await prisma.event.findMany({ take, orderBy: { startAt: 'asc' } });
    }

    // Enrich with real purchase counts
    const enriched = await Promise.all(
      events.map(async (e) => {
        const purchases = await prisma.purchase.count({ where: { eventId: e.id, paid: true } });
        return { ...e, purchaseCount: purchases };
      })
    );

    res.json({ ok: true, events: enriched });
  } catch (err: any) {
    console.error('Events error:', err);
    res.status(500).json({ error: err.message || 'Server error loading events' });
  }
}
