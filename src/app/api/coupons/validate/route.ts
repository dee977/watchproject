import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const orderSubtotal = Number(subtotal) || 0;

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive privilege code.' }, { status: 404 });
    }

    // Check expiration
    if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
      return NextResponse.json({ error: 'This coupon code has expired.' }, { status: 400 });
    }

    // Check minimum order requirement
    if (orderSubtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          error: `This coupon requires a minimum acquisition subtotal of ₹${coupon.minOrderAmount.toLocaleString('en-IN')}.`,
        },
        { status: 400 }
      );
    }

    // Check total usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'This coupon usage limit has been reached.' }, { status: 400 });
    }

    // Check per-user limit if user logged in
    const session = await getSessionUser();
    if (session && coupon.perUserLimit) {
      const userUsageCount = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userId: session.userId,
        },
      });

      if (userUsageCount >= coupon.perUserLimit) {
        return NextResponse.json(
          { error: 'You have already utilized this privilege voucher.' },
          { status: 400 }
        );
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = Math.round((orderSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, orderSubtotal);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
