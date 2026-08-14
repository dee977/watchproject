import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, canManageProducts } from '@/lib/auth';
import { slugify, generateSKU } from '@/lib/utils';
import { z } from 'zod';

const ProductInputSchema = z.object({
  name: z.string().min(2),
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
  collectionId: z.string().optional().nullable(),
  price: z.number().positive(),
  mrp: z.number().positive(),
  movement: z.string().default('Automatic'),
  gender: z.string().default('Unisex'),
  caseMaterial: z.string().optional().nullable(),
  caseDiameter: z.string().optional().nullable(),
  caseThickness: z.string().optional().nullable(),
  dialColor: z.string().optional().nullable(),
  strapMaterial: z.string().optional().nullable(),
  waterResistance: z.string().optional().nullable(),
  powerReserve: z.string().optional().nullable(),
  crystal: z.string().optional().nullable(),
  warranty: z.string().default('2 Years International'),
  condition: z.string().default('New / Unworn'),
  description: z.string().min(10),
  shortDescription: z.string().optional().nullable(),
  stockQuantity: z.number().int().min(0).default(5),
  lowStockThreshold: z.number().int().min(1).default(2),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  images: z.array(z.string().url()).min(1),
  specs: z.array(z.object({ group: z.string(), key: z.string(), value: z.string() })).optional(),
});

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !canManageProducts(session.role)) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        brand: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        inventory: true,
        images: { orderBy: { displayOrder: 'asc' } },
        _count: { select: { orderItems: true, reviews: true } },
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Admin products fetch error:', error);
    return NextResponse.json({ error: 'Failed to retrieve products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !canManageProducts(session.role)) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = ProductInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const data = parsed.data;

    // Fetch brand for SKU generation
    const brand = await prisma.brand.findUnique({ where: { id: data.brandId } });
    if (!brand) {
      return NextResponse.json({ error: 'Selected brand does not exist.' }, { status: 400 });
    }

    let slug = slugify(`${brand.name}-${data.name}`);
    // Check slug collision
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const sku = generateSKU(brand.name, data.name);
    const discountPercent = data.mrp > data.price ? Math.round(((data.mrp - data.price) / data.mrp) * 100) : 0;

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        sku,
        brandId: data.brandId,
        categoryId: data.categoryId,
        collectionId: data.collectionId,
        price: data.price,
        mrp: data.mrp,
        discountPercent,
        movement: data.movement,
        gender: data.gender,
        caseMaterial: data.caseMaterial,
        caseDiameter: data.caseDiameter,
        caseThickness: data.caseThickness,
        dialColor: data.dialColor,
        strapMaterial: data.strapMaterial,
        waterResistance: data.waterResistance,
        powerReserve: data.powerReserve,
        crystal: data.crystal,
        warranty: data.warranty,
        condition: data.condition,
        description: data.description,
        shortDescription: data.shortDescription,
        isFeatured: data.isFeatured,
        isBestSeller: data.isBestSeller,
        isNewArrival: data.isNewArrival,
        isPublished: data.isPublished,
        inventory: {
          create: {
            stockQuantity: data.stockQuantity,
            lowStockThreshold: data.lowStockThreshold,
          },
        },
        images: {
          create: data.images.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            displayOrder: idx,
            altText: `${data.name} View ${idx + 1}`,
          })),
        },
        specifications: {
          create: (data.specs || []).map((s, idx) => ({
            group: s.group,
            key: s.key,
            value: s.value,
            displayOrder: idx,
          })),
        },
      },
      include: {
        images: true,
        inventory: true,
        brand: true,
      },
    });

    // Log admin activity
    await prisma.adminActivityLog.create({
      data: {
        userId: session.userId,
        action: 'CREATE_PRODUCT',
        entityType: 'PRODUCT',
        entityId: product.id,
        details: `Created timepiece ${product.name} (SKU: ${product.sku})`,
      },
    });

    return NextResponse.json({
      message: 'Timepiece created successfully.',
      product,
    }, { status: 201 });
  } catch (error) {
    console.error('Admin create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
