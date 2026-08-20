import React from 'react';
import { Sparkles, MessageCircle, ShieldCheck, HeartHandshake, Eye, CheckCircle2, ArrowRight } from 'lucide-react';
import { OfficialLogo } from './OfficialLogo';
import { ActivePage, BRAND_CONFIG } from '../types';
import { getGeneralWhatsAppInquiryUrl, openWhatsApp } from '../utils/whatsapp';

interface AboutViewProps {
  setActivePage: (page: ActivePage) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ setActivePage }) => {
  return (
    <div id="about-page-view" className="py-12 sm:py-20 bg-[#FDFBF7] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-sans tracking-[0.25em] uppercase text-[#BFA36D] font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Brand</span>
          </div>
          <h1
            id="about-page-title"
            className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#421C2D] font-normal tracking-tight leading-tight"
          >
            ABOUT MARYAM TRADE CENTER
          </h1>
          <p className="font-serif italic text-lg sm:text-2xl text-[#BFA36D] mt-3">
            "Carry the Moment. Elegance that moves with you."
          </p>
          <div className="w-16 h-[2px] bg-[#BFA36D] mx-auto mt-6" />
        </div>

        {/* Brand Official Banner / Frosted Plum Glass Panel */}
        <div className="glass-panel-plum rounded-3xl p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/20">
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3 max-w-xl">
            <OfficialLogo variant="light" size="lg" />
            <p className="font-sans text-sm text-[#F0E6DA] leading-relaxed pt-2">
              Maryam Trade Center is a premier fashion and accessories destination, curating distinguished Pakistani ensembles, embroidered formals, and structured leather goods for discerning clientele.
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-center gap-3">
            <button
              id="about-banner-whatsapp-cta"
              onClick={() => openWhatsApp(getGeneralWhatsAppInquiryUrl())}
              className="px-7 py-4 rounded-full bg-[#BFA36D] hover:bg-[#A88D56] text-[#24101A] font-sans text-xs font-bold tracking-wider uppercase flex items-center gap-2 shadow-lg transition-all transform hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>DIRECT WHATSAPP CONCIERGE</span>
            </button>
            <span className="text-[11px] text-[#E8D8C4] font-sans">
              Instant responses &amp; customized sizing
            </span>
          </div>
        </div>

        {/* 1. OUR STORY */}
        <section id="about-our-story" className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-center">
          <div className="md:col-span-6 space-y-4">
            <span className="text-xs font-sans tracking-[0.2em] uppercase text-[#BFA36D] font-semibold">
              Section 01
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#421C2D] font-normal">
              OUR STORY
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#5A4B54] leading-relaxed">
              Maryam Trade Center was established with a singular vision: to bring the rich sartorial traditions of Pakistani design and craftsmanship to modern women seeking poise, elegance, and effortless sophistication.
            </p>
            <p className="font-sans text-sm sm:text-base text-[#5A4B54] leading-relaxed">
              We curate a distinguished spectrum of apparel—ranging from hand-embellished raw silks and layered chiffons to everyday breathable lawn ensembles—paired harmoniously with structured handbags and artisanal footwear.
            </p>
          </div>

          <div className="md:col-span-6 rounded-3xl overflow-hidden shadow-lg border border-white/60 bg-[#EAE3D9] aspect-4/3">
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop"
              alt="Maryam Trade Center Story"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* 2. OUR APPROACH */}
        <section id="about-our-approach" className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-center">
          <div className="md:col-span-6 order-2 md:order-1 rounded-3xl overflow-hidden shadow-lg border border-white/60 bg-[#EAE3D9] aspect-4/3">
            <img
              src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop"
              alt="Maryam Trade Center Approach"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="md:col-span-6 order-1 md:order-2 space-y-4">
            <span className="text-xs font-sans tracking-[0.2em] uppercase text-[#BFA36D] font-semibold">
              Section 02
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#421C2D] font-normal">
              OUR APPROACH
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#5A4B54] leading-relaxed">
              At Maryam Trade Center, our approach is defined by uncompromising attention to detail:
            </p>
            <div className="space-y-2.5 pt-2">
              {[
                { title: 'Elegance & Pakistani Style', desc: 'Preserving heritage zardozi, tilla, and resham threadwork in contemporary cuts.' },
                { title: 'Curated Quality', desc: 'Rigorous selection of fabrics, durable hardware, and fine finishes across every piece.' },
                { title: 'Effortless Customer Experience', desc: 'Direct, personal communication without impersonal checkout carts or automated friction.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm font-sans text-[#5A4B54]">
                  <CheckCircle2 className="w-4 h-4 text-[#BFA36D] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#421C2D]">{item.title}:</strong> {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. OUR COLLECTION & WHATSAPP ORDERING */}
        <section id="about-our-collection" className="glass-panel bg-white/70 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-white/60 text-center space-y-6 shadow-lg">
          <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#BFA36D] font-semibold">
            Section 03
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#421C2D] font-normal">
            OUR COLLECTION &amp; DIRECT ORDERING
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#5A4B54] max-w-2xl mx-auto leading-relaxed">
            Customers can explore our latest collections through this interactive digital catalog. To place an order or inquire about customized tailoring, simply tap the <strong>"ORDER ON WHATSAPP"</strong> button on any product.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-3xl mx-auto text-left">
            <div className="glass-card bg-white/80 p-5 rounded-2xl border border-white/60 shadow-xs">
              <span className="font-serif text-lg font-bold text-[#421C2D]">1. Select</span>
              <p className="text-xs text-[#5A4B54] mt-1 font-sans">Browse products, pick your preferred size, fabric, and color.</p>
            </div>
            <div className="glass-card bg-white/80 p-5 rounded-2xl border border-white/60 shadow-xs">
              <span className="font-serif text-lg font-bold text-[#421C2D]">2. WhatsApp</span>
              <p className="text-xs text-[#5A4B54] mt-1 font-sans">Tap Order on WhatsApp to generate your pre-filled inquiry.</p>
            </div>
            <div className="glass-card bg-white/80 p-5 rounded-2xl border border-white/60 shadow-xs">
              <span className="font-serif text-lg font-bold text-[#421C2D]">3. Confirm</span>
              <p className="text-xs text-[#5A4B54] mt-1 font-sans">Our representative confirms availability, sizing, and shipping.</p>
            </div>
          </div>

          <div className="pt-6 flex justify-center gap-4">
            <button
              onClick={() => {
                setActivePage('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-8 py-3.5 rounded-full bg-[#421C2D] hover:bg-[#331523] text-white text-xs sm:text-sm font-sans tracking-wider uppercase font-semibold transition-all shadow-md"
            >
              BROWSE COLLECTION
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
