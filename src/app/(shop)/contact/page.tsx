'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Timepiece Sourcing / Allocation Inquiry',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
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
          <div className="p-6 rounded-xl bg-obsidian-900/60 border border-obsidian-800 space-y-4">
            <h2 className="font-cinzel text-sm uppercase tracking-luxury text-gold-400 font-semibold">
              Flagship Vault Atelier
            </h2>
            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">AURELIA Haute Horlogerie Flagship</strong>
                  <p>Altamount Road, Cumballa Hill</p>
                  <p>Mumbai, Maharashtra 400026, India</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-obsidian-800">
                <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <div>
                  <strong className="text-white">+91 22 4988 7700</strong>
                  <p className="text-[11px] text-gray-400">Direct VIP Client Line</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-obsidian-800">
                <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <div>
                  <strong className="text-white">concierge@aureliawatches.com</strong>
                  <p className="text-[11px] text-gray-400">Average response within 2 hours</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-obsidian-800">
                <Clock className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <div>
                  <strong className="text-white">Private Salon Hours</strong>
                  <p className="text-[11px] text-gray-400">Monday – Saturday: 10:00 AM – 8:00 PM IST</p>
                  <p className="text-[11px] text-gray-400">Sunday: By Private Invitation Only</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-xl bg-obsidian-900/60 border border-obsidian-800 space-y-6">
            <h2 className="font-cinzel text-sm uppercase tracking-luxury text-gold-400 font-semibold">
              Send Private Inquiry
            </h2>

            {submitted ? (
              <div className="p-8 text-center bg-gold-500/10 border border-gold-500/30 rounded-lg space-y-3">
                <CheckCircle2 className="w-10 h-10 text-gold-400 mx-auto" />
                <h3 className="text-lg font-cinzel font-bold text-white">Inquiry Received</h3>
                <p className="text-xs text-gray-300">
                  Thank you, {formData.name}. A Master Horologist has been assigned to your request and will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-medium block">Your Name</label>
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
                    <label className="text-gray-400 font-medium block">Email Address</label>
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
                    <label className="text-gray-400 font-medium block">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-gold-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-medium block">Inquiry Type</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
                  <label className="text-gray-400 font-medium block">Your Message</label>
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
                  className="btn-gold px-7 py-3 rounded text-xs font-bold uppercase tracking-luxury flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
