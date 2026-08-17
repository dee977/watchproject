import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getStoreSettings } from '@/lib/store-settings';
import { z } from 'zod';

const OrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
});

const AddressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().default('India'),
});

const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  paymentMethod: z.literal('COD').default('COD'),
  couponCode: z.string().optional(),
  deliveryType: z.enum(['STANDARD', 'EXPRESS']).default('STANDARD'),
  customerNotes: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  guestName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const body = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const {
      items: rawItems,
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode,
      deliveryType,
      customerNotes,
      guestEmail,
      guestPhone,
      guestName,
    } = parsed.data;

    // Fetch product details from DB to guarantee legitimate pricing and inventory check
    const productIds = rawItems.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isPublished: true },
      include: {
        inventory: true,
        brand: true,
        images: { take: 1, orderBy: { displayOrder: 'asc' } },
      },
    });

    if (dbProducts.length !== rawItems.length) {
      return NextResponse.json({ error: 'One or more items in your cart are no longer available.' }, { status: 400 });
    }

    // Verify stock availability
    for (const item of rawItems) {
      const prod = dbProducts.find((p) => p.id === item.productId);
      if (!prod) continue;
      const currentStock = prod.inventory?.stockQuantity ?? 0;
      if (currentStock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${prod.name}. Available: ${currentStock}` },
          { status: 400 }
        );
      }
    }

    // Calculate server subtotal
    let subtotal = 0;
    const orderItemsData = rawItems.map((item) => {
      const prod = dbProducts.find((p) => p.id === item.productId)!;
      const itemTotal = prod.price * item.quantity;
      subtotal += itemTotal;

      return {
        productId: prod.id,
        productName: prod.name,
        productSku: prod.sku,
        productImage: prod.images[0]?.url || '',
        brandName: prod.brand.name,
        unitPrice: prod.price,
        quantity: item.quantity,
        totalPrice: itemTotal,
      };
    });

    const settings = await getStoreSettings();

    // Discount calculation
    let discountAmount = 0;
    let validCouponId: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.isActive && subtotal >= coupon.minOrderAmount) {
        validCouponId = coupon.id;
        if (coupon.type === 'PERCENTAGE') {
          discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
          }
        } else {
          discountAmount = Math.min(coupon.discountValue, subtotal);
        }
      }
    }

    const taxableSubtotal = Math.max(0, subtotal - discountAmount);

    // GST/Tax Calculation
    const taxRate = settings.TAX_RATE_PERCENT / 100;
    const taxAmount = Math.round(taxableSubtotal * taxRate);

    // Shipping Fee
    let shippingAmount = 0;
    if (taxableSubtotal < settings.FREE_SHIPPING_THRESHOLD) {
      shippingAmount =
        deliveryType === 'EXPRESS'
          ? settings.EXPRESS_SHIPPING_FEE
          : settings.STANDARD_SHIPPING_FEE;
    } else if (deliveryType === 'EXPRESS') {
      shippingAmount = settings.EXPRESS_SHIPPING_FEE;
    }

    // COD Handling Fee
    const codFee = settings.COD_FEE;

    const totalAmount = taxableSubtotal + taxAmount + shippingAmount + codFee;

    // Generate unique order number (e.g. AUR-2026-XXXX)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AUR-${new Date().getFullYear()}-${randomSuffix}`;

    // Create Order Record with COD payment record
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.userId || null,
        guestEmail: !session ? guestEmail : null,
        guestName: !session ? (guestName || shippingAddress.fullName) : null,
        guestPhone: !session ? (guestPhone || shippingAddress.phone) : null,
        shippingAddressSnapshot: JSON.stringify(shippingAddress),
        billingAddressSnapshot: billingAddress ? JSON.stringify(billingAddress) : JSON.stringify(shippingAddress),
        subtotal,
        discountAmount,
        couponCode: validCouponId ? couponCode : null,
        taxAmount,
        shippingAmount,
        codFee,
        totalAmount,
        currency: settings.STORE_CURRENCY,
        status: 'CONFIRMED',
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        notes: customerNotes,
        items: {
          create: orderItemsData,
        },
        payments: {
          create: {
            paymentMethod: 'COD',
            paymentStatus: 'PENDING',
            amount: totalAmount,
            currency: settings.STORE_CURRENCY,
            gatewayPaymentId: `COD-${orderNumber}`,
          },
        },
      },
      include: {
        items: true,
      },
    });

    // Execute atomic inventory stock deduction and tracking creation
    await prisma.$transaction(async (tx) => {
      // Reserve/decrement stock
      for (const item of rawItems) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            stockQuantity: { decrement: item.quantity },
            reservedQuantity: { increment: item.quantity },
          },
        });
      }

      // Record coupon usage if applied
      if (validCouponId) {
        await tx.couponUsage.create({
          data: {
            couponId: validCouponId,
            userId: session?.userId || null,
            orderId: order.id,
          },
        });
        await tx.coupon.update({
          where: { id: validCouponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      // Create Shipment Manifest
      await tx.shipment.create({
        data: {
          orderId: order.id,
          courierName: 'BlueDart Vault Logistics',
          trackingNumber: `BD${Math.floor(100000000 + Math.random() * 900000000)}IN`,
          status: 'Processing in Vault Logistics',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      });
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      currency: order.currency,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order. Please try again.' }, { status: 500 });
  }
}
