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

    // Enrich with real purchase counts and remaining tickets
    const enriched = await Promise.all(
      events.map(async (e) => {
        const purchases = await prisma.purchase.findMany({ where: { eventId: e.id, paid: true }, select: { amount: true } });
        const ticketsSold = purchases.length;
        const ticketsRemaining = Math.max(0, e.capacity - ticketsSold);
        
        let balenciagaSold = 0; let wozaSold = 0; let kalakutaSold = 0; let badSold = 0;
        for (const p of purchases) {
          if (p.amount === 5000) balenciagaSold++;
          else if (p.amount === 20000) wozaSold++;
          else if (p.amount === 500000) kalakutaSold++;
          else if (p.amount === 1000000) badSold++;
        }
        
        return {
          ...e,
          purchaseCount: ticketsSold,
          ticketsSold,
          ticketsRemaining,
          soldOut: ticketsRemaining === 0,
          tierRemaining: {
            BALENCIAGA: Math.max(0, 500 - balenciagaSold),
            WOZA: Math.max(0, 200 - wozaSold),
            KALAKUTA: Math.max(0, 20 - kalakutaSold),
            BAD: Math.max(0, 10 - badSold),
          }
        };
      })
    );

    res.json({ ok: true, events: enriched });
  } catch (err: any) {
    console.error('Events error:', err);
    res.status(500).json({ error: err.message || 'Server error loading events' });
  }
}
