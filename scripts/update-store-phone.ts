import { prisma } from '../src/lib/prisma';

async function updatePhone() {
  console.log('Updating CONCIERGE_PHONE in database...');
  await prisma.siteSetting.upsert({
    where: { key: 'CONCIERGE_PHONE' },
    update: { value: '+91 9687949373' },
    create: { key: 'CONCIERGE_PHONE', value: '+91 9687949373', description: 'VIP support hotline' },
  });
  console.log('Successfully updated CONCIERGE_PHONE to +91 9687949373');
}

updatePhone()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
