import React from 'react';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { MessageSquare, Send, CheckCircle2, User } from 'lucide-react';
import { AdminQuestionsManager } from './AdminQuestionsManager';

export const dynamic = 'force-dynamic';

export default async function AdminQuestionsPage() {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { id: true, name: true, sku: true } },
      user: { select: { name: true, email: true } },
      answers: { orderBy: { createdAt: 'asc' } },
    },
  });

  const formatted = questions.map((q) => ({
    id: q.id,
    productName: q.product.name,
    productSku: q.product.sku,
    userName: q.user.name,
    userEmail: q.user.email,
    questionText: q.questionText,
    createdAt: formatDate(q.createdAt),
    answers: q.answers.map((a) => ({
      id: a.id,
      authorName: a.authorName,
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
