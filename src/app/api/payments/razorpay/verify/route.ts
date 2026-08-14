import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { sendEmail, getOrderConfirmationEmailHtml } from '@/lib/email';
import { formatPrice } from '@/lib/currency';

export async function POST(req: NextRequest) {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (!orderId || !razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json({ error: 'Missing payment verification parameters.' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Verify HMAC-SHA256 signature
    const isValidSignature = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      // Record failed payment attempt
      await prisma.payment.create({
        data: {
          orderId: order.id,
          paymentMethod: 'RAZORPAY',
          paymentStatus: 'FAILED',
          amount: order.totalAmount,
          currency: order.currency,
          gatewayPaymentId: razorpay_payment_id,
          gatewayOrderId: razorpay_order_id,
          errorMessage: 'Signature verification mismatch.',
        },
      });

      return NextResponse.json({ error: 'Payment signature verification failed.' }, { status: 400 });
    }

    // Execute atomic state update & inventory deduction
    await prisma.$transaction(async (tx) => {
      // 1. Update Order Status
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
        },
      });

      // 2. Create / Update Payment Record
      await tx.payment.create({
        data: {
          orderId: order.id,
          paymentMethod: 'RAZORPAY',
          paymentStatus: 'PAID',
          amount: order.totalAmount,
          currency: order.currency,
          gatewayPaymentId: razorpay_payment_id,
          gatewayOrderId: razorpay_order_id,
          gatewaySignature: razorpay_signature,
          paidAt: new Date(),
        },
      });

      // 3. Atomically decrement stock
      for (const item of order.items) {
        if (item.productId) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          });
        }
      }

      // 4. Create Shipment Record
      const trackingNumber = `BD${Math.floor(100000000 + Math.random() * 900000000)}IN`;
      await tx.shipment.create({
        data: {
          orderId: order.id,
          courierName: 'BlueDart Apex Armored Transport',
          trackingNumber,
          trackingUrl: `https://www.bluedart.com/tracking?trackNumber=${trackingNumber}`,
          status: 'Processing in Vault Logistics',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      });
    });

    // 5. Dispatch Order Confirmation Email
    const customerEmail = order.user?.email || order.guestEmail;
    const customerName = order.user?.name || order.guestName || 'Valued Collector';

    if (customerEmail) {
      const emailHtml = getOrderConfirmationEmailHtml({
        orderNumber: order.orderNumber,
        customerName,
        totalAmount: formatPrice(order.totalAmount),
        shippingAddress: order.shippingAddressSnapshot,
        items: order.items.map((i) => ({
          name: i.productName,
          brand: i.brandName,
          quantity: i.quantity,
          price: formatPrice(i.totalPrice),
        })),
      });

      await sendEmail({
        to: customerEmail,
        subject: `Order Confirmation #${order.orderNumber} • AURELIA Haute Horlogerie`,
        html: emailHtml,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed successfully.',
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Server error during payment verification.' }, { status: 500 });
  }
}
