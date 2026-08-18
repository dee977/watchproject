import React from 'react';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { AdminQuestionsManager } from '@/components/admin/AdminQuestionsManager';

export const dynamic = 'force-dynamic';

export default async function AdminQuestionsPage() {
  let questions: any[] = [];
  try {
    questions = await prisma.question.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        user: { select: { name: true, email: true } },
        answers: { orderBy: { createdAt: 'asc' } },
      },
    });
  } catch (error) {
    console.error('[AdminQuestionsPage] Questions query error:', error);
  }

  const formatted = (questions || []).map((q) => ({
    id: q.id,
    productName: q.product?.name || 'Archived Timepiece',
    productSku: q.product?.sku || 'N/A',
    userName: q.user?.name || 'VIP Client',
    userEmail: q.user?.email || '',
    questionText: q.questionText,
    createdAt: formatDate(q.createdAt),
    answers: (q.answers || []).map((a: any) => ({
      id: a.id,
      authorName: a.authorName || 'Concierge',
      answerText: a.answerText,
      createdAt: formatDate(a.createdAt),
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-obsidian-800 pb-4">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Client Advisory
        </span>
        <h1 className="text-2xl font-cinzel font-bold text-white mt-0.5">
          Horological Inquiries & Q&A ({questions.length})
        </h1>
      </div>

      <AdminQuestionsManager initialQuestions={formatted} />
    </div>
  );
}
