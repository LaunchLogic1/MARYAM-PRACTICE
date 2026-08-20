import React from 'react';
import { Sparkles, MessageCircle, HeartHandshake, ShieldCheck, ArrowRight } from 'lucide-react';
import { OfficialLogo } from './OfficialLogo';
import { ActivePage, BRAND_CONFIG } from '../types';
import { getGeneralWhatsAppInquiryUrl, openWhatsApp } from '../utils/whatsapp';

interface HomeStoryAndValuesProps {
  setActivePage: (page: ActivePage) => void;
}

export const HomeStoryAndValues: React.FC<HomeStoryAndValuesProps> = ({
  setActivePage,
}) => {
  return (
    <>
      {/* 1. BRAND STORY / ABOUT PREVIEW */}
      <section id="brand-story-section" className="py-16 sm:py-24 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
            {/* Visual Portrait Grid */}
            <div className="lg:col-span-5 relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-xl border border-white/60 bg-[#EAE3D9] aspect-4/5">
                <img
                  src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop"
                  alt="Maryam Trade Center Craftsmanship"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Offset Decorative Accent Badge (Frosted Glass Plum Panel) */}
              <div className="hidden sm:block absolute -bottom-6 -right-6 z-20 glass-panel-plum text-white p-5 rounded-3xl shadow-xl max-w-xs border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#BFA36D] text-[#24101A] flex items-center justify-center font-serif text-lg font-bold">
                    M
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold">Maryam Trade Center</h4>
                    <p className="text-[11px] font-sans text-[#F0E6DA]">Elegance that moves with you.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Editorial Brand Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-sans tracking-[0.25em] uppercase text-[#BFA36D] font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The House of Maryam</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#421C2D] font-normal tracking-tight leading-tight">
                WHERE TRADITIONAL OPULENCE MEETS CONTEMPORARY GRACE
              </h2>

              <p className="font-sans text-sm sm:text-base text-[#5A4B54] leading-relaxed">
                Maryam Trade Center brings together curated Pakistani fashion collections and modern accessories. From intricately embroidered three-piece ensembles and pure chiffon dupattas to structured leather handbags, every piece in our catalog is chosen to elevate your personal style.
              </p>

              <p className="font-sans text-sm sm:text-base text-[#5A4B54] leading-relaxed">
                We believe shopping should be personal, transparent, and direct. Rather than impersonal checkout carts, we connect you one-on-one with our team on WhatsApp, ensuring your size, color, and delivery requirements are handled with utmost attention.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  id="about-read-story-btn"
                  onClick={() => {
                    setActivePage('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-7 py-3.5 rounded-full bg-[#421C2D] hover:bg-[#331523] text-white text-xs sm:text-sm font-sans tracking-wider uppercase font-semibold transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>OUR FULL STORY</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="about-whatsapp-inquiry-btn"
                  onClick={() => openWhatsApp(getGeneralWhatsAppInquiryUrl())}
                  className="px-7 py-3.5 rounded-full glass-panel bg-white/80 hover:bg-white text-[#BFA36D] border border-[#BFA36D]/40 text-xs sm:text-sm font-sans tracking-wider uppercase font-semibold transition-all flex items-center gap-2 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>CONTACT ON WHATSAPP</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY MARYAM TRADE CENTER */}
      <section id="why-maryam-trade-center-section" className="py-16 sm:py-20 bg-[#F7F3EC] border-t border-[#EAE3D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="font-sans text-xs tracking-[0.25em] text-[#BFA36D] uppercase font-semibold">
              The Experience
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#421C2D] mt-1.5 font-normal tracking-tight">
              WHY MARYAM TRADE CENTER
            </h2>
            <div className="w-12 h-[2px] bg-[#BFA36D] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Benefit 1 */}
            <div className="glass-card rounded-3xl p-7 sm:p-8 border border-white/60 shadow-xs hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#BFA36D]/20 text-[#BFA36D] flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#421C2D] font-normal">
                CURATED STYLE
              </h3>
              <p className="font-sans text-sm text-[#5A4B54] mt-2.5 leading-relaxed">
                Thoughtfully selected fashion and accessories. Each design is vetted for aesthetic refinement, authentic embroidery, and superior material drape.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="glass-card rounded-3xl p-7 sm:p-8 border border-white/60 shadow-xs hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#BFA36D]/20 text-[#BFA36D] flex items-center justify-center mb-5">
                <MessageCircle className="w-6 h-6 fill-current" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#421C2D] font-normal">
                EFFORTLESS ORDERING
              </h3>
              <p className="font-sans text-sm text-[#5A4B54] mt-2.5 leading-relaxed">
                Order directly through WhatsApp. No complicated checkout forms, no passwords to memorize, and no automated bots—just simple, human convenience.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="glass-card rounded-3xl p-7 sm:p-8 border border-white/60 shadow-xs hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#421C2D]/15 text-[#421C2D] flex items-center justify-center mb-5">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#421C2D] font-normal">
                PERSONAL SERVICE
              </h3>
              <p className="font-sans text-sm text-[#5A4B54] mt-2.5 leading-relaxed">
                Connect directly with Maryam Trade Center. Receive real-time video previews, tailored size recommendations, and dedicated order tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CTA SECTION */}
      <section
        id="homepage-cta-section"
        className="relative py-20 sm:py-28 glass-panel-plum text-white text-center overflow-hidden"
      >
        {/* Subtle Background Pattern & Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#BFA36D_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#BFA36D]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <span className="text-xs font-sans tracking-[0.25em] text-[#E8D8C4] uppercase font-semibold mb-3">
            Maryam Trade Center
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-white font-normal tracking-tight leading-tight">
            FIND YOUR NEXT LOOK
          </h2>
          <p className="font-sans text-base sm:text-xl text-[#F0E6DA] mt-4 max-w-xl font-light">
            Explore the collection and order directly on WhatsApp.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-4">
            <button
              id="cta-shop-collection-button"
              onClick={() => {
                setActivePage('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-[#BFA36D] hover:bg-[#A88D56] text-[#24101A] font-semibold text-xs sm:text-sm tracking-[0.16em] uppercase shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>SHOP COLLECTION</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="cta-whatsapp-chat-button"
              onClick={() => openWhatsApp(getGeneralWhatsAppInquiryUrl())}
              className="w-full sm:w-auto px-9 py-4 rounded-full glass-panel bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/35 text-white font-medium text-xs sm:text-sm tracking-[0.16em] uppercase shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current text-[#BFA36D]" />
              <span>CHAT ON WHATSAPP</span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
