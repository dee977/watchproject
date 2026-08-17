'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';

interface QuestionItem {
  id: string;
  productName: string;
  productSku: string;
  userName: string;
  userEmail: string;
  questionText: string;
  createdAt: string;
  answers: Array<{ id: string; authorName: string; answerText: string; createdAt: string }>;
}

export const AdminQuestionsManager: React.FC<{ initialQuestions: QuestionItem[] }> = ({
  initialQuestions,
}) => {
  const [questions, setQuestions] = useState<QuestionItem[]>(initialQuestions);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePostAnswer = async (questionId: string) => {
    if (!replyText.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          answerText: replyText.trim(),
          authorName: 'AURELIA Master Concierge',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  answers: [
                    ...q.answers,
                    {
                      id: data.answer.id,
                      authorName: 'AURELIA Master Concierge',
                      answerText: replyText.trim(),
                      createdAt: 'Just now',
                    },
                  ],
                }
              : q
          )
        );
        setReplyText('');
        setActiveReplyId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {questions.length === 0 ? (
        <div className="p-8 text-center bg-obsidian-900/40 border border-obsidian-800 rounded-xl text-xs text-gray-500">
          No questions submitted by collectors yet.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="p-5 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gold-400 font-cinzel font-semibold">
                    Regarding: <strong className="text-white">{q.productName}</strong> (SKU: {q.productSku})
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">{q.createdAt}</span>
                </div>
                <h3 className="text-sm font-semibold text-white font-serif italic">
                  &quot;{q.questionText}&quot;
                </h3>
                <span className="text-[10px] text-gray-500 block">
                  Asked by: {q.userName} ({q.userEmail})
                </span>
              </div>

              {/* Answers */}
              {q.answers.length > 0 && (
                <div className="pl-4 border-l-2 border-gold-500/40 space-y-2 pt-1">
                  {q.answers.map((a) => (
                    <div key={a.id} className="p-3 rounded bg-obsidian-950/60 border border-obsidian-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <strong className="text-gold-300">{a.authorName}</strong>
                        <span className="text-[10px] text-gray-500">{a.createdAt}</span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{a.answerText}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Answer input */}
              {activeReplyId === q.id ? (
                <div className="space-y-2 pt-2 border-t border-obsidian-800">
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write official Maison Concierge response..."
                    className="w-full bg-obsidian-950 border border-obsidian-800 rounded p-3 text-white focus:border-gold-500 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setActiveReplyId(null)}
                      className="px-3 py-1.5 rounded bg-obsidian-900 text-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handlePostAnswer(q.id)}
                      disabled={isLoading || !replyText.trim()}
                      className="btn-gold px-4 py-1.5 rounded font-semibold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Post Official Answer</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-obsidian-800/60">
                  <button
                    onClick={() => {
                      setActiveReplyId(q.id);
                      setReplyText('');
                    }}
                    className="text-gold-400 hover:text-gold-300 underline font-medium text-xs flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{q.answers.length > 0 ? 'Add Follow-up Answer' : 'Post Concierge Answer'}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
