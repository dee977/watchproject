import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, canManageProducts } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !canManageProducts(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const inventory = await prisma.inventory.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            movement: true,
            brand: { select: { name: true } },
            images: { take: 1, select: { url: true } },
          },
        },
      },
      orderBy: { stockQuantity: 'asc' },
    });

    return NextResponse.json({ inventory });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !canManageProducts(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { productId, adjustment, stockQuantity, lowStockThreshold } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    let updated;
    if (adjustment !== undefined) {
      updated = await prisma.inventory.update({
        where: { productId },
        data: {
          stockQuantity: {
            increment: Number(adjustment),
          },
        },
      });
    } else if (stockQuantity !== undefined) {
      updated = await prisma.inventory.update({
        where: { productId },
        data: {
          stockQuantity: Math.max(0, Number(stockQuantity)),
          ...(lowStockThreshold !== undefined ? { lowStockThreshold: Number(lowStockThreshold) } : {}),
        },
      });
    }

    await prisma.adminActivityLog.create({
      data: {
        userId: session.userId,
        action: 'UPDATE_INVENTORY',
        entityType: 'INVENTORY',
        entityId: productId,
        details: `Adjusted inventory for product ID: ${productId}`,
      },
    });

    return NextResponse.json({
      message: 'Inventory updated successfully.',
      inventory: updated,
    });
  } catch (error) {
    console.error('Inventory update error:', error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}
