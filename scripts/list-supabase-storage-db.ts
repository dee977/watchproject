import { PrismaClient } from '@prisma/client';

const directPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('Connecting to database via DIRECT_URL...');
  try {
    const buckets: any[] = await directPrisma.$queryRawUnsafe('SELECT * FROM storage.buckets;');
    console.log('--- Storage Buckets ---');
    console.dir(buckets, { depth: null });

    const objects: any[] = await directPrisma.$queryRawUnsafe('SELECT id, name, bucket_id, created_at, updated_at, metadata FROM storage.objects LIMIT 100;');
    console.log(`\n--- Storage Objects (${objects.length} objects found) ---`);
    console.dir(objects, { depth: null });

    const products = await directPrisma.product.findMany({
      include: { images: true }
    });
    console.log(`\n--- Products in DB (${products.length}) ---`);
    for (const p of products) {
      console.log(`- ${p.name} (${p.slug}):`);
      console.log('  Images:', p.images.map(i => i.url));
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await directPrisma.$disconnect();
  }
}

main().catch(console.error);
