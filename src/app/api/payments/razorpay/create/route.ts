import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRazorpayOrder, getRazorpayKeyId } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ error: 'Order has already been paid and settled.' }, { status: 400 });
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(order.totalAmount * 100);

    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency: order.currency || 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });

    // Update payment record with gateway order ID
    await prisma.payment.upsert({
      where: { gatewayPaymentId: razorpayOrder.id },
      create: {
        orderId: order.id,
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PENDING',
        amount: order.totalAmount,
        currency: order.currency,
        gatewayOrderId: razorpayOrder.id,
      },
      update: {
        gatewayOrderId: razorpayOrder.id,
      },
    });

    return NextResponse.json({
      keyId: getRazorpayKeyId(),
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json({ error: 'Failed to initiate payment gateway.' }, { status: 500 });
  }
}
