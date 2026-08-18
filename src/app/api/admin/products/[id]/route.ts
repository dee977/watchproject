import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, canManageProducts } from '@/lib/auth';
import { getPublicImageUrl } from '@/lib/images';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || !canManageProducts(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        brand: true,
        category: true,
        collection: true,
        inventory: true,
        images: { orderBy: { displayOrder: 'asc' } },
        specifications: { orderBy: { displayOrder: 'asc' } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || !canManageProducts(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      price,
      mrp,
      stockQuantity,
      lowStockThreshold,
      isFeatured,
      isBestSeller,
      isNewArrival,
      isPublished,
      description,
      shortDescription,
      movement,
      caseMaterial,
      caseDiameter,
      waterResistance,
      warranty,
      images,
    } = body;

    const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        price: Number(price),
        mrp: Number(mrp),
        discountPercent,
        description,
        shortDescription,
        movement,
        caseMaterial,
        caseDiameter,
        waterResistance,
        warranty,
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        isNewArrival: Boolean(isNewArrival),
        isPublished: Boolean(isPublished),
        inventory: {
          upsert: {
            create: {
              stockQuantity: Number(stockQuantity || 0),
              lowStockThreshold: Number(lowStockThreshold || 2),
            },
            update: {
              stockQuantity: Number(stockQuantity || 0),
              lowStockThreshold: Number(lowStockThreshold || 2),
            },
          },
        },
      },
      include: {
        inventory: true,
        brand: true,
      },
    });

    // If new images provided
    if (images && Array.isArray(images) && images.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId: params.id } });
      await prisma.productImage.createMany({
        data: images.map((url: string, idx: number) => ({
          productId: params.id,
          url: getPublicImageUrl(url),
          isPrimary: idx === 0,
          displayOrder: idx,
        })),
      });
    }

    await prisma.adminActivityLog.create({
      data: {
        userId: session.userId,
        action: 'UPDATE_PRODUCT',
        entityType: 'PRODUCT',
        entityId: params.id,
        details: `Updated product ${updated.name}`,
      },
    });

    return NextResponse.json({
      message: 'Product updated successfully.',
      product: updated,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || !canManageProducts(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    await prisma.adminActivityLog.create({
      data: {
        userId: session.userId,
        action: 'DELETE_PRODUCT',
        entityType: 'PRODUCT',
        entityId: params.id,
        details: `Deleted product ID: ${params.id}`,
      },
    });

    return NextResponse.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
