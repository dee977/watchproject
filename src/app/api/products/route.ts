import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const collection = searchParams.get('collection');
    const movement = searchParams.get('movement');
    const gender = searchParams.get('gender');
    const inStock = searchParams.get('inStock') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const sort = searchParams.get('sort') || 'recommended';
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.max(1, Math.min(50, Number(searchParams.get('limit') || 12)));
    const search = searchParams.get('q') || '';

    // Build where clause
    const where: any = {
      isPublished: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
        { brand: { name: { contains: search } } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (brand) {
      const brandList = brand.split(',');
      if (brandList.length > 1) {
        where.brand = { slug: { in: brandList } };
      } else {
        where.brand = { slug: brand };
      }
    }

    if (collection) {
      where.collection = { slug: collection };
    }

    if (movement) {
      const movementList = movement.split(',');
      if (movementList.length > 1) {
        where.movement = { in: movementList };
      } else {
        where.movement = movement;
      }
    }

    if (gender) {
      where.gender = gender;
    }

    if (featured) {
      where.isFeatured = true;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (inStock) {
      where.inventory = {
        stockQuantity: { gt: 0 },
      };
    }

    // Build order by
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    if (sort === 'price-desc') orderBy = { price: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };
    if (sort === 'rating' || sort === 'popular') orderBy = { viewCount: 'desc' };

    const total = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        images: {
          orderBy: { displayOrder: 'asc' },
          select: { url: true, altText: true, isPrimary: true },
        },
        inventory: { select: { stockQuantity: true } },
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
    });

    const formatted = products.map((p) => {
      const reviewCount = p.reviews.length;
      const averageRating =
        reviewCount > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
          : 0;

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
        gender: p.gender,
        caseMaterial: p.caseMaterial,
        caseDiameter: p.caseDiameter,
        waterResistance: p.waterResistance,
        shortDescription: p.shortDescription,
        description: p.description,
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        isBestSeller: p.isBestSeller,
        stockQuantity: p.inventory?.stockQuantity ?? 0,
        images: p.images,
        averageRating,
        reviewCount,
      };
    });

    return NextResponse.json({
      products: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve products' },
      { status: 500 }
    );
  }
}
