import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { z } from 'zod';

const ReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(2).max(120),
  comment: z.string().min(5).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: 'Please sign in to submit a horological appraisal.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = ReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { productId, rating, title, comment } = parsed.data;

    // Check if user has purchased this product
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.userId,
          paymentStatus: 'PAID',
        },
      },
    });

    const isVerifiedPurchase = Boolean(purchase);

    // Prevent duplicate reviews from same user on same product
    const existing = await prisma.review.findFirst({
      where: {
        productId,
        userId: session.userId,
      },
    });

    if (existing) {
      const updated = await prisma.review.update({
        where: { id: existing.id },
        data: {
          rating,
          title,
          comment,
          isVerifiedPurchase,
          isApproved: true,
        },
      });

      return NextResponse.json({
        message: 'Your appraisal has been updated.',
        review: updated,
      });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.userId,
        rating,
        title,
        comment,
        isVerifiedPurchase,
        isApproved: true,
      },
    });

    return NextResponse.json({
      message: 'Your appraisal has been published successfully.',
      review,
    });
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
