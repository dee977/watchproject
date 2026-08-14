import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasAdminAccess } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !hasAdminAccess(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const returns = await prisma.returnRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            items: true,
            payments: true,
          },
        },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    return NextResponse.json({ returns });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch returns' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasAdminAccess(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, status, adminNotes, refundAmount } = await req.json();

    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!returnRequest) {
      return NextResponse.json({ error: 'Return request not found' }, { status: 404 });
    }

    const updated = await prisma.returnRequest.update({
      where: { id },
      data: {
        status,
        adminNotes,
        ...(refundAmount !== undefined ? { refundAmount: Number(refundAmount) } : {}),
      },
    });

    // If marked REFUNDED, update order status and payment status
    if (status === 'REFUNDED') {
      await prisma.order.update({
        where: { id: returnRequest.orderId },
        data: {
          status: 'REFUNDED',
          paymentStatus: 'REFUNDED',
        },
      });
    }

    return NextResponse.json({
      message: 'Return request updated successfully.',
      returnRequest: updated,
    });
  } catch (error) {
    console.error('Update return error:', error);
    return NextResponse.json({ error: 'Failed to update return' }, { status: 500 });
  }
}
