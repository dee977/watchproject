import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, canManageOrders } from '@/lib/auth';
import { sendEmail, getShipmentDispatchedEmailHtml } from '@/lib/email';
import { formatDate } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || !canManageOrders(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: params.id }, { orderNumber: params.id }],
      },
      include: {
        user: true,
        items: true,
        payments: true,
        shipments: true,
        returnRequests: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || !canManageOrders(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { status, paymentStatus, courierName, trackingNumber, trackingUrl, adminNotes } = body;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: params.id }, { orderNumber: params.id }],
      },
      include: { user: true, shipments: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
        ...(adminNotes !== undefined ? { adminNotes } : {}),
      },
    });

    // Update or create shipment if courier/tracking provided
    if (courierName || trackingNumber) {
      if (order.shipments.length > 0) {
        await prisma.shipment.update({
          where: { id: order.shipments[0].id },
          data: {
            courierName: courierName || order.shipments[0].courierName,
            trackingNumber: trackingNumber || order.shipments[0].trackingNumber,
            trackingUrl: trackingUrl || order.shipments[0].trackingUrl,
            status: status === 'SHIPPED' ? 'In Transit' : status === 'DELIVERED' ? 'Delivered' : 'Processing',
            shippedAt: status === 'SHIPPED' ? new Date() : undefined,
            deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
          },
        });
      } else {
        await prisma.shipment.create({
          data: {
            orderId: order.id,
            courierName: courierName || 'BlueDart Armored Logistics',
            trackingNumber: trackingNumber || `BD${Math.floor(100000000 + Math.random() * 900000000)}IN`,
            trackingUrl,
            status: 'In Transit',
            shippedAt: new Date(),
          },
        });
      }

      // If marked SHIPPED, dispatch customer email
      if (status === 'SHIPPED') {
        const customerEmail = order.user?.email || order.guestEmail;
        const customerName = order.user?.name || order.guestName || 'Collector';
        if (customerEmail) {
          const emailHtml = getShipmentDispatchedEmailHtml({
            orderNumber: order.orderNumber,
            customerName,
            courierName: courierName || 'BlueDart Armored Logistics',
            trackingNumber: trackingNumber || 'BD88921098IN',
            trackingUrl,
            estimatedDelivery: formatDate(Date.now() + 3 * 24 * 60 * 60 * 1000),
          });

          await sendEmail({
            to: customerEmail,
            subject: `Shipment In Transit #${order.orderNumber} • AURELIA Haute Horlogerie`,
            html: emailHtml,
          });
        }
      }
    }

    await prisma.adminActivityLog.create({
      data: {
        userId: session.userId,
        action: 'UPDATE_ORDER_STATUS',
        entityType: 'ORDER',
        entityId: order.id,
        details: `Updated order #${order.orderNumber} status to ${status || order.status}`,
      },
    });

    return NextResponse.json({
      message: 'Order updated successfully.',
      order: updated,
    });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
