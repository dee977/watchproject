import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const { productId, email } = await req.json();

    if (!productId || !email) {
      return NextResponse.json({ error: 'Product ID and email are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    await prisma.stockNotification.create({
      data: {
        productId,
        userId: session?.userId || null,
        email: cleanEmail,
      },
    });

    return NextResponse.json({
      message: 'You have been registered for restock notifications.',
    });
  } catch (error) {
    console.error('Stock notification error:', error);
    return NextResponse.json({ error: 'Failed to register restock notification' }, { status: 500 });
  }
}
