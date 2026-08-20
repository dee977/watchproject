import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { getProductImageUrl } from '../src/lib/images';

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
  console.log('====================================================');
  console.log('   VERIFYING ALL DATABASE PRODUCT IMAGES LIVE       ');
  console.log('====================================================\n');

  const products = await prisma.product.findMany({
    include: { images: true, brand: true },
    orderBy: { createdAt: 'asc' },
  });

  let passCount = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const rawUrl = p.images[0]?.url;
    const normalizedUrl = getProductImageUrl(rawUrl);

    let status = 0;
    let contentType = '';
    try {
      const res = await fetch(normalizedUrl, { method: 'HEAD' });
      status = res.status;
      contentType = res.headers.get('content-type') || '';
    } catch (err: any) {
      console.error(`Fetch error for ${p.slug}:`, err.message);
    }

    const isOk = status === 200;
    if (isOk) passCount++;

    console.log(`[${i + 1}/${products.length}] ${isOk ? '✅' : '❌'} Product: "${p.name}"`);
    console.log(`     Slug: ${p.slug}`);
    console.log(`     Image URL: ${normalizedUrl}`);
    console.log(`     HTTP Status: ${status} (${contentType})\n`);
  }

  console.log('====================================================');
  console.log(`   Result: ${passCount} / ${products.length} images verified HTTP 200 OK (${Math.round((passCount/products.length)*100)}%)`);
  console.log('====================================================\n');

  if (passCount !== products.length) {
    throw new Error('Not all images returned HTTP 200 OK');
  }
}

main()
  .catch((e) => {
    console.error('Verification failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
