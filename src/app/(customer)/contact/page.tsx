'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'Timepiece Sourcing / Allocation Inquiry',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Friend / Owner WhatsApp details
  const whatsappNumber = '919687949373';
  const whatsappPreFilledText = encodeURIComponent(
    'Hello KSHAN, I would like to contact you regarding a watch inquiry. Please assist me.'
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappPreFilledText}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;

    setStatus('loading');
    setFeedbackMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setStatus('success');
        setFeedbackMessage(
          data.message || 'Your inquiry has been sent successfully. Our concierge will contact you shortly.'
        );
        setFormData({
          name: '',
          email: '',
          phone: '',
          inquiryType: 'Timepiece Sourcing / Allocation Inquiry',
          message: '',
        });
      } else {
        setStatus('error');
        setFeedbackMessage(
          data.error || 'We could not send your inquiry. Please try again or contact us on WhatsApp.'
        );
      }
    } catch (err) {
      setStatus('error');
      setFeedbackMessage(
        'We could not send your inquiry. Please try again or contact us on WhatsApp.'
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
          Private Client Services
        </span>
        <h1 className="text-4xl font-cinzel font-bold text-white">
          Contact The Master Concierge
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed">
          Our horological specialists are available 24/7 to assist with private viewings, rare allocation sourcing, and technical inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Info Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl bg-obsidian-900/60 border border-obsidian-800 space-y-5">
            <h2 className="font-cinzel text-sm uppercase tracking-luxury text-gold-400 font-semibold">
              Flagship Vault Atelier
            </h2>

            <div className="space-y-4 text-xs text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">KSHAN</strong>
                  <p>Surat, Gujarat 395004, India</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-obsidian-800">
                <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <div>
                  <strong className="text-white">+91 9687949373</strong>
                  <p className="text-[11px] text-gray-400">WhatsApp / Direct Contact</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-obsidian-800">
                <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <div>
                  <strong className="text-white">kshan92788@gmail.com</strong>
                  <p className="text-[11px] text-gray-400">Direct Inquiries & Concierge Support</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-obsidian-800">
                <Clock className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <div>
                  <strong className="text-white">Private Salon Hours</strong>
                  <p className="text-[11px] text-gray-400">Monday – Saturday: 10:00 AM – 8:00 PM IST</p>
                  <p className="text-[11px] text-gray-400">Sunday: By Private Invitation Only</p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Contact Button */}
            <div className="pt-4 border-t border-obsidian-800 space-y-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-5 py-3.5 rounded bg-emerald-700/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-xs font-bold uppercase tracking-luxury flex items-center justify-center gap-2.5 transition-all shadow-md"
              >
                <svg
                  className="w-4 h-4 fill-current text-emerald-400"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>Contact Us on WhatsApp</span>
              </a>
              <p className="text-[10px] text-gray-500 text-center">
                Direct instant chat with owner • +91 9687949373
              </p>
            </div>
          </div>
        </div>

        {/* Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-xl bg-obsidian-900/60 border border-obsidian-800 space-y-6">
            <div>
              <h2 className="font-cinzel text-sm uppercase tracking-luxury text-gold-400 font-semibold">
                Send Private Inquiry
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Transmit a detailed allocation or technical inquiry directly to our atelier ledger.
              </p>
            </div>

            {status === 'success' && (
              <div className="p-6 text-center bg-gold-500/10 border border-gold-500/30 rounded-lg space-y-2">
                <CheckCircle2 className="w-8 h-8 text-gold-400 mx-auto" />
                <h3 className="text-base font-cinzel font-bold text-white">Inquiry Transmitted Successfully</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {feedbackMessage}
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-lg flex items-start gap-3 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-medium text-red-200">Transmission Failed</strong>
                  <span>{feedbackMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-medium block">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Vikramaditya Roy"
                    className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-medium block">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@luxury.com"
                    className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-medium block">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-medium block">Inquiry Type *</label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white focus:border-gold-500 focus:outline-none"
                  >
                    <option value="Timepiece Sourcing / Allocation Inquiry">Timepiece Allocation & Sourcing</option>
                    <option value="Private Salon Viewing Appointment">Private Salon Appointment</option>
                    <option value="Order & Logistics Inquiries">Order & Armored Logistics</option>
                    <option value="Warranty & Atelier Servicing">Warranty & Servicing</option>
                    <option value="General Concierge Assistance">General Concierge Assistance</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-medium block">Your Message *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Specify watch references, complications, or tailored requirements..."
                  className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-gold px-7 py-3 rounded text-xs font-bold uppercase tracking-luxury flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Transmit Inquiry</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
