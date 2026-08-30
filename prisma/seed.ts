import { PrismaClient } from '@prisma/client';
import { DEFAULT_EVENTS } from '../src/lib/eventsData';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding events...');
  for (const event of DEFAULT_EVENTS) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: { ...event },
      create: { ...event },
    });
  }
  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
