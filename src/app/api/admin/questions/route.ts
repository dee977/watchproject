import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hasAdminAccess } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !hasAdminAccess(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const questions = await prisma.question.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        user: { select: { name: true, email: true } },
        answers: true,
      },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !hasAdminAccess(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { questionId, answerText, authorName } = await req.json();

    if (!questionId || !answerText) {
      return NextResponse.json({ error: 'Question ID and answer text are required' }, { status: 400 });
    }

    const answer = await prisma.answer.create({
      data: {
        questionId,
        authorName: authorName || 'AURELIA Master Concierge',
        isOfficial: true,
        answerText,
      },
    });

    return NextResponse.json({ message: 'Answer posted successfully', answer });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to post answer' }, { status: 500 });
  }
}
