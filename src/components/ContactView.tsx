import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, Send, CheckCircle2, Clock, MapPin, Sparkles } from 'lucide-react';
import { WebsiteSettings, BRAND_CONFIG } from '../types';
import { getGeneralWhatsAppInquiryUrl, openWhatsApp } from '../utils/whatsapp';

interface ContactViewProps {
  settings?: WebsiteSettings;
}

export const ContactView: React.FC<ContactViewProps> = ({ settings }) => {
  const activeSettings = settings || BRAND_CONFIG;
  const rawNumber = activeSettings.whatsappRaw || activeSettings.whatsappNumber || BRAND_CONFIG.whatsappRaw;
  const cleanPhone = rawNumber.replace(/[^0-9]/g, '');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Product & Availability Inquiry',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct WhatsApp message from form data
    const text = `Hello Maryam Trade Center!\n\nNew Inquiry from Contact Form:\n• Name: ${formData.name}\n• Phone: ${formData.phone || 'N/A'}\n• Email: ${formData.email || 'N/A'}\n• Subject: ${formData.subject}\n• Message: ${formData.message}\n\nPlease get back to me. Thank you!`;
    
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    openWhatsApp(whatsappUrl);
    setIsSubmitted(true);
  };

  return (
    <div id="contact-page-view" className="py-12 sm:py-20 bg-[#FDFBF7] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-sans tracking-[0.25em] uppercase text-[#BFA36D] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Concierge</span>
          </div>
          <h1
            id="contact-page-title"
            className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#421C2D] font-normal tracking-tight"
          >
            CONTACT MARYAM TRADE CENTER
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#5A4B54] mt-2">
            Reach out directly for orders, custom stitch inquiries, product sizing, or wholesale questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
          {/* Left Column: Direct Business Information & Prominent WhatsApp Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary WhatsApp Card (Frosted Plum Glass Panel) */}
            <div className="glass-panel-plum rounded-3xl p-7 sm:p-8 text-white shadow-2xl space-y-5 border border-white/20">
              <div>
                <span className="text-[11px] font-sans tracking-widest text-[#BFA36D] uppercase font-semibold">
                  Fastest Communication Channel
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-white font-normal mt-1">
                  WhatsApp Direct Service
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#F0E6DA] mt-2 leading-relaxed">
                  For immediate assistance, price quotes, real-time video demonstrations, or to place an order immediately, click below to open WhatsApp.
                </p>
              </div>

              <button
                id="contact-chat-on-whatsapp-cta"
                onClick={() => openWhatsApp(getGeneralWhatsAppInquiryUrl())}
                className="w-full py-4 px-6 rounded-2xl bg-[#BFA36D] hover:bg-[#A88D56] text-[#24101A] font-sans text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.01] focus:outline-hidden"
              >
                <MessageCircle className="w-5 h-5 fill-current shrink-0" />
                <span>CHAT ON WHATSAPP</span>
              </button>

              <div className="text-center text-xs text-[#E8D8C4]">
                <span>WhatsApp: </span>
                <strong className="text-white font-mono">{activeSettings.whatsappNumber || BRAND_CONFIG.whatsappNumber}</strong>
              </div>
            </div>

            {/* Business Contact Cards (Frosted Glass Panel) */}
            <div className="glass-panel bg-white/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/60 shadow-lg space-y-5">
              <h3 className="font-serif text-xl text-[#421C2D] font-normal border-b border-[#EAE3D9] pb-3">
                Official Business Details
              </h3>

              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#BFA36D]/20 text-[#BFA36D] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-sans uppercase tracking-wider text-[#7A6B74] block">
                    Official Email
                  </span>
                  <a
                    href={`mailto:${activeSettings.email || BRAND_CONFIG.email}`}
                    className="font-sans text-sm font-medium text-[#421C2D] hover:text-[#BFA36D] transition-colors"
                  >
                    {activeSettings.email || BRAND_CONFIG.email}
                  </a>
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#BFA36D]/20 text-[#BFA36D] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-sans uppercase tracking-wider text-[#7A6B74] block">
                    Phone &amp; WhatsApp
                  </span>
                  <a
                    href={`tel:${activeSettings.whatsappNumber || BRAND_CONFIG.whatsappNumber}`}
                    className="font-sans text-sm font-medium text-[#421C2D] hover:text-[#BFA36D] transition-colors font-mono"
                  >
                    {activeSettings.whatsappNumber || BRAND_CONFIG.whatsappNumber}
                  </a>
                </div>
              </div>

              {/* Business Name */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#BFA36D]/20 text-[#BFA36D] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-sans uppercase tracking-wider text-[#7A6B74] block">
                    Business Entity
                  </span>
                  <span className="font-serif text-sm font-semibold text-[#421C2D]">
                    {activeSettings.businessName || 'Maryam Trade Center'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Message Form */}
          <div className="lg:col-span-7 glass-panel bg-white/70 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/60 shadow-lg">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#421C2D] font-normal mb-2">
              Send an Inquiry
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#5A4B54] mb-6">
              Fill in your details below and our team will receive your message with full details on WhatsApp.
            </p>

            {isSubmitted ? (
              <div className="p-8 text-center glass-panel bg-white/80 rounded-2xl border border-white/60 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#BFA36D] mx-auto" />
                <h3 className="font-serif text-2xl text-[#421C2D]">Inquiry Prepared</h3>
                <p className="font-sans text-xs sm:text-sm text-[#5A4B54]">
                  WhatsApp was opened with your message. If it did not launch automatically, tap below to contact us directly:
                </p>
                <button
                  onClick={() => openWhatsApp(getGeneralWhatsAppInquiryUrl())}
                  className="px-6 py-2.5 rounded-full bg-[#421C2D] text-white text-xs font-semibold uppercase font-sans shadow-xs"
                >
                  OPEN WHATSAPP
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#421C2D] uppercase tracking-wider mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Fatima Ali"
                      className="w-full text-xs font-sans px-3.5 py-3 rounded-xl bg-white/60 border border-[#E2D9CC] text-[#2A2A2A] focus:outline-hidden focus:border-[#BFA36D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#421C2D] uppercase tracking-wider mb-1.5">
                      WhatsApp Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +92 300 1234567"
                      className="w-full text-xs font-sans px-3.5 py-3 rounded-xl bg-white/60 border border-[#E2D9CC] text-[#2A2A2A] focus:outline-hidden focus:border-[#BFA36D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#421C2D] uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. yourname@example.com"
                      className="w-full text-xs font-sans px-3.5 py-3 rounded-xl bg-white/60 border border-[#E2D9CC] text-[#2A2A2A] focus:outline-hidden focus:border-[#BFA36D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#421C2D] uppercase tracking-wider mb-1.5">
                      Inquiry Type
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full text-xs font-sans px-3.5 py-3 rounded-xl bg-white/60 border border-[#E2D9CC] text-[#2A2A2A] focus:outline-hidden focus:border-[#BFA36D]"
                    >
                      <option value="Product & Availability Inquiry">Product &amp; Availability Inquiry</option>
                      <option value="Custom Size / Stitching Request">Custom Size / Stitching Request</option>
                      <option value="Handbag & Accessories Query">Handbag &amp; Accessories Query</option>
                      <option value="Wholesale / Bulk Export Inquiry">Wholesale / Bulk Export Inquiry</option>
                      <option value="Other Question">Other Question</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#421C2D] uppercase tracking-wider mb-1.5">
                    Your Message / Desired Items *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us which suit, handbag, or accessory you're inquiring about..."
                    className="w-full text-xs font-sans p-3.5 rounded-xl bg-white/60 border border-[#E2D9CC] text-[#2A2A2A] focus:outline-hidden focus:border-[#BFA36D]"
                  />
                </div>

                <button
                  type="submit"
                  id="submit-contact-form-button"
                  className="w-full py-4 rounded-xl bg-[#421C2D] hover:bg-[#331523] text-white font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>SUBMIT INQUIRY ON WHATSAPP</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
