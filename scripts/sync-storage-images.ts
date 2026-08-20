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
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: { displayOrder: 'asc' } },
      brand: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${products.length} products in database:`);
  products.forEach((p, idx) => {
    console.log(`\n[${idx + 1}] ID: ${p.id} | Name: "${p.name}" | Slug: "${p.slug}"`);
    console.log(`    Images count: ${p.images.length}`);
    p.images.forEach((img, imgIdx) => {
      console.log(`      (${imgIdx + 1}) URL: "${img.url}"`);
      console.log(`          Normalized: "${getProductImageUrl(img.url)}"`);
    });
  });
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
