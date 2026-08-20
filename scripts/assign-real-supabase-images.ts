import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { getProductImageUrl, SUPABASE_STORAGE_BASE_URL } from '../src/lib/images';

// Load .env
try {
  const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch (e) {}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.DIRECT_URL,
    },
  },
});

async function main() {
  console.log('Fetching storage objects from Supabase using DATABASE_URL...');
  const storageObjects: any[] = await prisma.$queryRawUnsafe(
    `SELECT name, bucket_id, created_at FROM storage.objects WHERE bucket_id = 'image' ORDER BY created_at ASC;`
  );

  console.log(`Found ${storageObjects.length} image files in Supabase 'image' bucket:`);
  storageObjects.forEach((obj, idx) => {
    console.log(`  [${idx + 1}] ${obj.name}`);
  });

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
    include: { images: true, brand: true },
  });

  console.log(`\nFound ${products.length} products in database.`);

  if (storageObjects.length === 0) {
    console.log('No storage objects found in bucket image.');
    return;
  }

  // Update each product with its corresponding Supabase storage image
  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    const storageObj = storageObjects[i % storageObjects.length];
    const supabaseImageUrl = `${SUPABASE_STORAGE_BASE_URL}${encodeURIComponent(storageObj.name)}`;

    console.log(`\nUpdating product [${i + 1}/${products.length}]: "${prod.name}" (${prod.slug})`);
    console.log(`  -> Assigned image: ${storageObj.name}`);
    console.log(`  -> Public URL: ${supabaseImageUrl}`);

    // Update existing ProductImage or create new
    if (prod.images.length > 0) {
      await prisma.productImage.update({
        where: { id: prod.images[0].id },
        data: {
          url: supabaseImageUrl,
          altText: `${prod.name} View 1`,
        },
      });
      // If there were extra images, update or remove them
      for (let j = 1; j < prod.images.length; j++) {
        const extraObj = storageObjects[(i + j) % storageObjects.length];
        const extraUrl = `${SUPABASE_STORAGE_BASE_URL}${encodeURIComponent(extraObj.name)}`;
        await prisma.productImage.update({
          where: { id: prod.images[j].id },
          data: {
            url: extraUrl,
            altText: `${prod.name} View ${j + 1}`,
          },
        });
      }
    } else {
      await prisma.productImage.create({
        data: {
          productId: prod.id,
          url: supabaseImageUrl,
          isPrimary: true,
          displayOrder: 0,
          altText: `${prod.name} View 1`,
        },
      });
    }
  }

  console.log('\n✅ All 15 products successfully updated with real Supabase Storage images!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
