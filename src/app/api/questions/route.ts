import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const { productId, questionText } = await req.json();

    if (!productId || !questionText || !questionText.trim()) {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 });
    }

    // Default guest fallback user if unauthenticated
    let userId = session?.userId;
    if (!userId) {
      const defaultUser = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
      userId = defaultUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'User context not found' }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        productId,
        userId,
        questionText: questionText.trim(),
        isApproved: true,
      },
    });

    return NextResponse.json({
      message: 'Question submitted successfully.',
      question,
    });
  } catch (error) {
    console.error('Question API error:', error);
    return NextResponse.json({ error: 'Failed to submit question' }, { status: 500 });
  }
}
