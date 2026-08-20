import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  const products = await prisma.product.findMany({
    orderBy: { sku: 'asc' },
    include: { images: true, brand: true, category: true }
  });
  console.log(`Found ${products.length} products:`);
  products.forEach((p, idx) => {
    console.log(`${idx + 1}. [${p.sku}] "${p.name}" (Brand: ${p.brand.name})`);
    console.log(`   Slug: ${p.slug}`);
    console.log(`   Images:`, p.images.map(i => i.url));
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
