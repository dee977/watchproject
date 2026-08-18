import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { formatPrice } from '@/lib/currency';
import { ProductGallery } from '@/components/customer/shop/ProductGallery';
import { Product360Viewer } from '@/components/customer/shop/Product360Viewer';
import { SpecificationTable } from '@/components/customer/shop/SpecificationTable';
import { ReviewsSection } from '@/components/customer/shop/ReviewsSection';
import { QASection } from '@/components/customer/shop/QASection';
import { ProductGrid } from '@/components/customer/shop/ProductGrid';
import { ProductCardData } from '@/components/customer/shop/ProductCard';
import { ProductPurchasePanel } from './ProductPurchasePanel';
import { generateProductJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo';
import { ShieldCheck, Truck, RotateCcw, Clock, Award, Compass } from 'lucide-react';

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { brand: true, images: { take: 1 } },
  });

  if (!product) return { title: 'Timepiece Not Found | AURELIA' };

  const title = `${product.name} | ${product.brand.name} | AURELIA`;
  const description = product.shortDescription || product.description.substring(0, 160);
  const imageUrl = product.images[0]?.url || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  let product: any = null;
  let session: any = null;

  try {
    const [prodRes, sessRes] = await Promise.all([
      prisma.product.findUnique({
        where: { slug: params.slug },
        include: {
          brand: true,
          category: true,
          collection: true,
          inventory: true,
          images: { orderBy: { displayOrder: 'asc' } },
          specifications: { orderBy: { displayOrder: 'asc' } },
          reviews: {
            where: { isApproved: true },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
          },
          questions: {
            where: { isApproved: true },
            include: {
              user: { select: { name: true, email: true } },
              answers: { orderBy: { createdAt: 'asc' } },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      getSessionUser(),
    ]);
    product = prodRes;
    session = sessRes;
  } catch (err) {
    console.error('Product detail query error:', err);
  }

  if (!product || !product.isPublished) {
    notFound();
  }

  // Increment view count asynchronously
  prisma.product.update({
    where: { id: product.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  // Fetch related products
  let relatedProducts: any[] = [];
  try {
    relatedProducts = await prisma.product.findMany({
      where: {
        isPublished: true,
        id: { not: product.id },
        OR: [
          { brandId: product.brandId },
          { categoryId: product.categoryId },
        ],
      },
      take: 4,
      include: {
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        images: { orderBy: { displayOrder: 'asc' } },
        inventory: { select: { stockQuantity: true } },
        reviews: { where: { isApproved: true }, select: { rating: true } },
      },
    });
  } catch (err) {
    console.error('Related products query error:', err);
  }

  const formattedRelated: ProductCardData[] = relatedProducts.map((p) => {
    const rCount = p.reviews?.length || 0;
    const avgRating = rCount > 0 ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) / rCount : 0;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      brand: p.brand,
      category: p.category,
      price: p.price,
      mrp: p.mrp,
      discountPercent: p.discountPercent,
      movement: p.movement,
      caseDiameter: p.caseDiameter,
      waterResistance: p.waterResistance,
      shortDescription: p.shortDescription,
      description: p.description,
      isFeatured: p.isFeatured,
      isNewArrival: p.isNewArrival,
      isBestSeller: p.isBestSeller,
      stockQuantity: p.inventory?.stockQuantity ?? 0,
      images: p.images,
      averageRating: avgRating,
      reviewCount: rCount,
    };
  });

  const reviewCount = product.reviews?.length || 0;
  const averageRating =
    reviewCount > 0
      ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount
      : 0;

  // SEO JSON-LD
  const productJsonLd = generateProductJsonLd({
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: product.brand?.name || 'AURELIA',
    price: product.price,
    images: (product.images || []).map((i: any) => i.url),
    inStock: (product.inventory?.stockQuantity ?? 0) > 0,
    ratingValue: reviewCount > 0 ? averageRating : undefined,
    reviewCount: reviewCount > 0 ? reviewCount : undefined,
    slug: product.slug,
  });

  const breadcrumbsJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Watches', url: '/watches' },
    { name: product.category.name, url: `/watches/${product.category.slug}` },
    { name: product.name, url: `/product/${product.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-gold-400">Home</Link>
          <span>/</span>
          <Link href="/watches" className="hover:text-gold-400">Watches</Link>
          <span>/</span>
          <Link href={`/brands/${product.brand.slug}`} className="hover:text-gold-400">
            {product.brand.name}
          </Link>
          <span>/</span>
          <span className="text-gold-300 font-medium truncate">{product.name}</span>
        </nav>

        {/* Top Product Section: Gallery + Purchase Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Gallery Column (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <ProductGallery images={product.images} productName={product.name} />

            {/* 360 Viewer if 2+ images */}
            {product.images.length > 1 && (
              <Product360Viewer images={product.images} productName={product.name} />
            )}
          </div>

          {/* Details & Purchase Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <ProductPurchasePanel
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                brand: product.brand,
                category: product.category,
                price: product.price,
                mrp: product.mrp,
                discountPercent: product.discountPercent,
                movement: product.movement,
                gender: product.gender,
                caseMaterial: product.caseMaterial,
                caseDiameter: product.caseDiameter,
                caseThickness: product.caseThickness,
                waterResistance: product.waterResistance,
                powerReserve: product.powerReserve,
                warranty: product.warranty,
                condition: product.condition,
                stockQuantity: product.inventory?.stockQuantity ?? 0,
                images: product.images,
                shortDescription: product.shortDescription,
                averageRating,
                reviewCount,
              }}
            />

            {/* Concierge Guarantee Box */}
            <div className="p-6 bg-obsidian-900/60 border border-obsidian-800 rounded-lg space-y-4 text-xs text-gray-300">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-gold-400 flex-shrink-0" />
                <div>
                  <strong className="text-white">Authenticity & Warranty Sealed</strong>
                  <p className="text-[11px] text-gray-400">
                    Includes stamped manufacturer guarantee card and international certificate.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-obsidian-800">
                <Truck className="w-5 h-5 text-gold-400 flex-shrink-0" />
                <div>
                  <strong className="text-white">Armored Vault Delivery</strong>
                  <p className="text-[11px] text-gray-400">
                    Complimentary full-value insured transit in security-sealed packaging.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-obsidian-800">
                <RotateCcw className="w-5 h-5 text-gold-400 flex-shrink-0" />
                <div>
                  <strong className="text-white">14-Day Vault Return Privilege</strong>
                  <p className="text-[11px] text-gray-400">
                    Hassle-free return or exchange for unworn pieces with intact factory seals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative & Horological Description */}
        <section className="space-y-6 pt-12 border-t border-obsidian-800">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
              Maison Horological Notes
            </span>
            <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-white">
              The Architecture of {product.name}
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed font-light whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </section>

        {/* Structured Technical Specifications */}
        <section className="space-y-6 pt-12 border-t border-obsidian-800">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
              Technical Data Sheet
            </span>
            <h2 className="text-2xl font-cinzel font-bold text-white">
              Horological Specifications
            </h2>
          </div>

          <SpecificationTable
            specifications={product.specifications}
            productData={{
              movement: product.movement,
              caseMaterial: product.caseMaterial,
              caseDiameter: product.caseDiameter,
              caseThickness: product.caseThickness,
              dialColor: product.dialColor,
              strapMaterial: product.strapMaterial,
              strapColor: product.strapColor,
              waterResistance: product.waterResistance,
              powerReserve: product.powerReserve,
              crystal: product.crystal,
              warranty: product.warranty,
              condition: product.condition,
              gender: product.gender,
            }}
          />
        </section>

        {/* Verified Collector Reviews & Ratings */}
        <section className="space-y-6 pt-12 border-t border-obsidian-800">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
              Collector Appraisals
            </span>
            <h2 className="text-2xl font-cinzel font-bold text-white">
              Verified Client Reviews ({reviewCount})
            </h2>
          </div>

          <ReviewsSection
            productId={product.id}
            productName={product.name}
            reviews={product.reviews}
            user={session ? { id: session.userId, name: session.name } : null}
          />
        </section>

        {/* Questions & Concierge Q&A */}
        <section className="space-y-6 pt-12 border-t border-obsidian-800">
          <QASection
            productId={product.id}
            productName={product.name}
            questions={product.questions}
            user={session ? { id: session.userId, name: session.name } : null}
          />
        </section>

        {/* Related Timepieces */}
        {formattedRelated.length > 0 && (
          <section className="space-y-8 pt-12 border-t border-obsidian-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
                  Complementary Timepieces
                </span>
                <h2 className="text-2xl font-cinzel font-bold text-white mt-1">
                  You May Also Admire
                </h2>
              </div>
            </div>

            <ProductGrid products={formattedRelated} columns={4} />
          </section>
        )}
      </div>
    </>
  );
}
