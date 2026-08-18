import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Inspecting Product and ProductImage records in database...');
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        brand: true,
        category: true,
      },
    });

    console.log(`Found ${products.length} products in database:`);
    for (const p of products) {
      console.log(`- [${p.sku}] "${p.name}" (Brand: ${p.brand?.name}, Cat: ${p.category?.name})`);
      console.log(`  Images (${p.images.length}):`, p.images.map((img) => ({ id: img.id, url: img.url, isPrimary: img.isPrimary })));
    }
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}

main();
