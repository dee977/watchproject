import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
    }

    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const { payload } = event;

    if (event.event === 'payment.captured') {
      const paymentEntity = payload.payment.entity;
      const orderReceipt = paymentEntity.notes?.orderNumber;

      if (orderReceipt) {
        await prisma.order.updateMany({
          where: { orderNumber: orderReceipt },
          data: {
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
          },
        });
      }
    } else if (event.event === 'payment.failed') {
      const paymentEntity = payload.payment.entity;
      const orderReceipt = paymentEntity.notes?.orderNumber;

      if (orderReceipt) {
        await prisma.order.updateMany({
          where: { orderNumber: orderReceipt },
          data: {
            paymentStatus: 'FAILED',
          },
        });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
