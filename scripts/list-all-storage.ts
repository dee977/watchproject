import { PrismaClient } from '@prisma/client';

const directPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  const buckets: any[] = await directPrisma.$queryRawUnsafe('SELECT id, name, public, avif_autodetection, file_size_limit, allowed_mime_types FROM storage.buckets;');
  console.log('Buckets:', JSON.stringify(buckets, null, 2));

  const objects: any[] = await directPrisma.$queryRawUnsafe('SELECT id, name, bucket_id, created_at, metadata FROM storage.objects ORDER BY created_at ASC;');
  console.log(`Total Objects: ${objects.length}`);
  for (const obj of objects) {
    console.log(`Bucket: "${obj.bucket_id}", Name: "${obj.name}"`);
  }
}

main().catch(console.error).finally(() => directPrisma.$disconnect());
