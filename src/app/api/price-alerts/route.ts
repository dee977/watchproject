import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const { productId, email, targetPrice } = await req.json();

    if (!productId || !email || !targetPrice) {
      return NextResponse.json({ error: 'Missing required price alert parameters' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    await prisma.priceAlert.create({
      data: {
        productId,
        userId: session?.userId || null,
        email: cleanEmail,
        targetPrice: Number(targetPrice),
      },
    });

    return NextResponse.json({
      message: 'Price drop alert configured successfully.',
    });
  } catch (error) {
    console.error('Price alert error:', error);
    return NextResponse.json({ error: 'Failed to set price alert' }, { status: 500 });
  }
}
