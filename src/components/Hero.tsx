import React, { useState } from 'react';
import { ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { ActivePage, WebsiteSettings, BRAND_CONFIG } from '../types';
import { isDeadBlobUrl } from '../utils/imageStorage';

interface HeroProps {
  setActivePage: (page: ActivePage) => void;
  onExploreCategories: () => void;
  settings?: WebsiteSettings;
}

export const Hero: React.FC<HeroProps> = ({
  setActivePage,
  onExploreCategories,
  settings,
}) => {
  const [imgError, setImgError] = useState(false);
  const activeSettings = settings || BRAND_CONFIG;
  const defaultHero = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=2000&auto=format&fit=crop';
  const heroImg = (!activeSettings.heroImage || isDeadBlobUrl(activeSettings.heroImage) || imgError) 
    ? defaultHero 
    : activeSettings.heroImage;
  const headline = activeSettings.heroTitle || activeSettings.tagline || 'CARRY THE MOMENT';
  const subtitle = activeSettings.heroSubtitle || activeSettings.subtagline || 'Elegance that moves with you.';
  const buttonText = activeSettings.heroButtonText || 'SHOP COLLECTION';

  return (
    <section
      id="homepage-hero-section"
      className="relative w-full min-h-[82vh] md:min-h-[88vh] lg:min-h-[92vh] flex items-center justify-center bg-[#24101A] text-white overflow-hidden"
    >
      {/* Background Campaign Imagery with Luxury Plum/Charcoal Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImg}
          alt="Maryam Trade Center Luxury Pakistani Fashion Campaign"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
          loading="eager"
        />
        {/* Editorial Fashion Vignette Overlay with deep plum & glass tint */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#200B15] via-[#2A111E]/60 to-[#1F0C16]/40" />
        <div className="absolute inset-0 bg-radial-[at_center_center] from-transparent via-[#200B15]/30 to-[#200B15]/80" />
      </div>

      {/* Hero Content Box with Frosted Glass Accents */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        {/* Frosted Glass Brand Eyebrow Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel bg-white/15 backdrop-blur-xl border border-white/30 text-[#F5EADB] text-[11px] sm:text-xs tracking-[0.25em] uppercase font-sans mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#BFA36D]" />
          <span>{activeSettings.subtitle || 'PAKISTANI LUXURY COUTURE & ACCESSORIES'}</span>
        </div>

        {/* Brand Name */}
        <span className="font-serif italic text-lg sm:text-2xl text-[#E8D8C4] tracking-wide mb-2 opacity-95">
          {activeSettings.businessName || 'Maryam Trade Center'}
        </span>

        {/* Main Headline */}
        <h1
          id="hero-main-headline"
          className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-white leading-[1.05] sm:leading-[1.1] max-w-4xl text-balance"
        >
          {headline}
        </h1>

        {/* Supporting Text */}
        <p
          id="hero-supporting-text"
          className="mt-4 sm:mt-6 text-base sm:text-xl md:text-2xl text-[#F2EAE0] font-light max-w-2xl text-balance leading-relaxed font-sans"
        >
          {subtitle}
        </p>

        {activeSettings.heroDescription && (
          <p className="mt-2 text-xs sm:text-sm text-[#D8C6B6] max-w-lg font-sans">
            {activeSettings.heroDescription}
          </p>
        )}

        {/* CTAs with Frosted Glass & Gold Styling */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 w-full sm:w-auto">
          {/* Shop Collection CTA */}
          <button
            id="hero-shop-collection-cta"
            onClick={() => {
              setActivePage('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-8 sm:px-9 py-3.5 sm:py-4 rounded-full bg-[#BFA36D] hover:bg-[#A88D56] text-[#24101A] font-semibold text-xs sm:text-sm tracking-[0.16em] uppercase transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 group focus:outline-hidden cursor-pointer"
          >
            <span>{buttonText}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Explore Categories CTA (Frosted Glass Panel Button) */}
          <button
            id="hero-explore-categories-cta"
            onClick={onExploreCategories}
            className="w-full sm:w-auto px-8 sm:px-9 py-3.5 sm:py-4 rounded-full glass-panel bg-white/15 hover:bg-white/25 backdrop-blur-xl border border-white/35 text-white font-medium text-xs sm:text-sm tracking-[0.16em] uppercase transition-all hover:border-white/60 flex items-center justify-center gap-2 focus:outline-hidden shadow-sm cursor-pointer"
          >
            <span>EXPLORE CATEGORIES</span>
          </button>
        </div>

        {/* WhatsApp Fast Order Hint Pill */}
        <div className="mt-8 sm:mt-12 inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-subtle bg-white/10 backdrop-blur-md border border-white/20 text-xs text-[#E8DDD0]">
          <MessageCircle className="w-4 h-4 text-[#BFA36D]" />
          <span>Direct personal ordering on WhatsApp • Worldwide &amp; Nationwide Inquiries</span>
        </div>
      </div>

      {/* Decorative Bottom Fade to Ivory Canvas */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FDFBF7] to-transparent pointer-events-none" />
    </section>
  );
};
