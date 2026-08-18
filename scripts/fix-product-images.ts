import { prisma } from '../src/lib/prisma';
import { getPublicImageUrl, SUPABASE_STORAGE_BASE_URL, FALLBACK_WATCH_IMAGE } from '../src/lib/images';

// High-resolution luxury image fallbacks keyed by brand/style
const BRAND_HERO_IMAGES: Record<string, string[]> = {
  rolex: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
  ],
  omega: [
    'https://images.unsplash.com/photo-1547996160-71dfa635826f?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80',
  ],
  'tag heuer': [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1000&q=80',
  ],
  breitling: [
    'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
  ],
  tissot: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
  ],
  seiko: [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
  ],
  casio: [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1000&q=80',
  ],
  longines: [
    'https://images.unsplash.com/photo-1517467139951-f5a925c9f9de?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1619134778706-7015533a6150?auto=format&fit=crop&w=1000&q=80',
  ],
  versace: [
    'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
  ],
  'armani exchange': [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
  ],
  'hugo boss': [
    'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
  ],
  guess: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
  ],
};

async function fixProductImages() {
  console.log('====================================================');
  console.log('   KSHAN Product Image Normalization & Fix Utility   ');
  console.log('====================================================\n');
  console.log(`Supabase Public Bucket URL: ${SUPABASE_STORAGE_BASE_URL}`);

  try {
    const products = await prisma.product.findMany({
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        brand: true,
      },
    });

    console.log(`Processing ${products.length} products...\n`);

    let updatedCount = 0;
    let createdImageCount = 0;

    for (const product of products) {
      const brandKey = (product.brand?.name || '').toLowerCase();
      const defaultBrandImages =
        BRAND_HERO_IMAGES[brandKey] || [FALLBACK_WATCH_IMAGE];

      if (product.images.length === 0) {
        // Create initial primary image
        for (let i = 0; i < defaultBrandImages.length; i++) {
          await prisma.productImage.create({
            data: {
              productId: product.id,
              url: defaultBrandImages[i],
              isPrimary: i === 0,
              displayOrder: i,
              altText: `${product.name} - View ${i + 1}`,
            },
          });
          createdImageCount++;
        }
        console.log(`[+] Added ${defaultBrandImages.length} images for "${product.name}" (${product.sku})`);
        updatedCount++;
      } else {
        // Fix existing images
        let hasPrimary = false;
        for (let i = 0; i < product.images.length; i++) {
          const img = product.images[i];
          const normalizedUrl = getPublicImageUrl(img.url, defaultBrandImages[0]);
          const shouldBePrimary = i === 0 || img.isPrimary;

          if (!hasPrimary && shouldBePrimary) {
            hasPrimary = true;
          }

          if (normalizedUrl !== img.url || img.isPrimary !== shouldBePrimary) {
            await prisma.productImage.update({
              where: { id: img.id },
              data: {
                url: normalizedUrl,
                isPrimary: i === 0,
                displayOrder: i,
              },
            });
            console.log(`[~] Updated Image ${img.id} for "${product.name}": ${normalizedUrl}`);
            updatedCount++;
          }
        }
      }
    }

    console.log(`\nSuccessfully normalized product images.`);
    console.log(`Total products processed: ${products.length}`);
    console.log(`Images updated/created: ${updatedCount + createdImageCount}`);
  } catch (error) {
    console.error('Error fixing product images in database:', error);
  }
}

fixProductImages();
