import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getStoreSettings } from '@/lib/store-settings';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Please sign in to request a return.' }, { status: 401 });
    }

    const { orderId, reason, description } = await req.json();

    if (!orderId || !reason) {
      return NextResponse.json({ error: 'Order and reason are required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== session.userId) {
      return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
    }

    // Verify return window from store settings
    const settings = await getStoreSettings();
    const daysSinceOrder = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceOrder > settings.RETURN_WINDOW_DAYS) {
      return NextResponse.json(
        {
          error: `Return window expired. Orders can only be returned within ${settings.RETURN_WINDOW_DAYS} days of acquisition.`,
        },
        { status: 400 }
      );
    }

    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId: order.id,
        userId: session.userId,
        reason,
        description,
        status: 'PENDING',
        refundAmount: order.totalAmount,
      },
    });

    // Update order status to RETURN_REQUESTED
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'RETURN_REQUESTED' },
    });

    return NextResponse.json({
      message: 'Return request submitted successfully. Concierge team will reach out within 24 hours.',
      returnRequest,
    });
  } catch (error) {
    console.error('Return request error:', error);
    return NextResponse.json({ error: 'Failed to submit return request' }, { status: 500 });
  }
}
