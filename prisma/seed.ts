import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.event.createMany({ data: [
    { title: 'Sonic Nights', slug: 'sonic-nights', description: 'An electronic music showcase.', location: 'Lagos Arena', startAt: new Date(Date.now()+86400000).toISOString(), endAt: new Date(Date.now()+86400000*2).toISOString(), price: 5000, capacity: 500 },
    { title: 'Design Futures Forum', slug: 'design-futures', description: 'Creative talks & workshops.', location: 'Abuja Creative Hub', startAt: new Date(Date.now()+86400000*3).toISOString(), endAt: new Date(Date.now()+86400000*3+3600000).toISOString(), price: 8000, capacity: 200 },
    { title: 'Indie Film Night', slug: 'indie-film', description: 'Local film screenings and Q&A.', location: 'Cinema Hall', startAt: new Date(Date.now()+86400000*5).toISOString(), endAt: new Date(Date.now()+86400000*5+7200000).toISOString(), price: 3000, capacity: 150 },
    { title: 'Startup Pitch Day', slug: 'pitch-day', description: 'Entrepreneurs pitch to investors.', location: 'Tech Hub', startAt: new Date(Date.now()+86400000*7).toISOString(), endAt: new Date(Date.now()+86400000*7+14400000).toISOString(), price: 0, capacity: 300 },
    { title: 'Soul Sessions', slug: 'soul-sessions', description: 'Acoustic performances and open mic.', location: 'Garden Stage', startAt: new Date(Date.now()+86400000*9).toISOString(), endAt: new Date(Date.now()+86400000*9+10800000).toISOString(), price: 2000, capacity: 250 },
    { title: 'Design Jam', slug: 'design-jam', description: 'Creative workshop & networking.', location: 'Studio 4', startAt: new Date(Date.now()+86400000*11).toISOString(), endAt: new Date(Date.now()+86400000*11+28800000).toISOString(), price: 6000, capacity: 100 }
  ]});
  console.log('Seed done');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
