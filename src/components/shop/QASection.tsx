'use client';

import React, { useState } from 'react';
import { HelpCircle, MessageSquare, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export interface QAItem {
  id: string;
  questionText: string;
  createdAt: string | Date;
  answers: Array<{
    id: string;
    authorName: string;
    answerText: string;
    isOfficial: boolean;
    createdAt: string | Date;
  }>;
}

interface QASectionProps {
  productId: string;
  productName: string;
  questions: QAItem[];
  user?: { id: string; name: string } | null;
}

export const QASection: React.FC<QASectionProps> = ({
  productId,
  productName,
  questions = [],
  user,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    setStatus('loading');
    setStatusMessage('');

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          questionText: questionText.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setStatusMessage('Your horological question has been received. Our Master Concierge will respond shortly.');
        setQuestionText('');
        setTimeout(() => {
          setIsModalOpen(false);
          setStatus('idle');
        }, 2000);
      } else {
        setStatus('error');
        setStatusMessage(data.error || 'Failed to submit question.');
      }
    } catch (err) {
      setStatus('error');
      setStatusMessage('Network connection error. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-obsidian-900/40 border border-obsidian-800 rounded-lg">
        <div className="space-y-1">
          <h4 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-gold-400" />
            <span>Horological Questions & Concierge Insights</span>
          </h4>
          <p className="text-xs text-gray-400">
            Inquire about movement specifications, bracelet sizing, service intervals, or boutique availability.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-outline-gold px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-luxury flex items-center gap-1.5 self-start sm:self-auto"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Ask Concierge</span>
        </button>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-10 bg-obsidian-900/20 border border-obsidian-800 rounded-lg p-6 space-y-2">
            <p className="text-xs text-gray-400">
              Have questions regarding the {productName}? Ask our certified horologists.
            </p>
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className="p-6 bg-obsidian-900/30 border border-obsidian-800/80 rounded-lg space-y-4"
            >
              {/* Question */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-semibold text-white">Client Inquiry</span>
                  <span className="font-mono text-[10px]">{formatDate(q.createdAt)}</span>
                </div>
                <p className="text-xs text-gray-200 font-medium">{q.questionText}</p>
              </div>

              {/* Answers */}
              {q.answers.length > 0 && (
                <div className="pl-4 border-l-2 border-gold-500/40 space-y-3 pt-2">
                  {q.answers.map((a) => (
                    <div key={a.id} className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-gold-300">{a.authorName}</span>
                        {a.isOfficial && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold bg-gold-500/10 text-gold-300 border border-gold-500/20 flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            <span>Official Maison Answer</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{a.answerText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Ask Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <div className="min-h-screen px-4 flex items-center justify-center py-12">
            <div className="relative w-full max-w-lg bg-obsidian-950 border border-gold-500/30 rounded-lg p-6 md:p-8 shadow-2xl text-white z-10 animate-scaleIn space-y-6">
              <div>
                <h3 className="font-cinzel text-lg font-bold text-white">
                  Ask a Horological Question
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Our watchmakers will review and publish an official answer for {productName}.
                </p>
              </div>

              <form onSubmit={handleAskQuestion} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-luxury text-gold-400 font-semibold block">
                    Your Question
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="e.g. What is the lug-to-lug length? Does the bracelet come with half-links for micro-adjustment?"
                    className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                {status === 'success' && (
                  <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                {status === 'error' && (
                  <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded bg-obsidian-900 border border-obsidian-800 text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex-1 btn-gold py-2.5 rounded text-xs font-semibold uppercase tracking-luxury disabled:opacity-50"
                  >
                    {status === 'loading' ? 'Sending...' : 'Submit Inquiry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
