import React from 'react';
import { Mail, Phone, MessageCircle, Instagram, Facebook } from 'lucide-react';
import { OfficialLogo } from './OfficialLogo';
import { ActivePage, WebsiteSettings, BRAND_CONFIG } from '../types';
import { openWhatsApp } from '../utils/whatsapp';

interface FooterProps {
  setActivePage: (page: ActivePage) => void;
  onSelectCategory?: (slug: string) => void;
  onOpenAdmin?: () => void;
  settings?: WebsiteSettings;
}

export const Footer: React.FC<FooterProps> = ({
  setActivePage,
  onSelectCategory,
  onOpenAdmin,
  settings,
}) => {
  const activeSettings = settings || BRAND_CONFIG;
  const currentLogo = activeSettings.logo || activeSettings.logoUrl;

  const instagramUrl =
    activeSettings.instagramUrl ||
    'https://www.instagram.com/maryam12345688901?utm_source=qr&igsh=bzM1czV1d3Y5dTRo';
  const facebookUrl =
    activeSettings.facebookUrl ||
    'https://www.facebook.com/profile.php?id=61593629782975';

  const handleNav = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryNav = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
    } else {
      setActivePage('categories');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsAppClick = () => {
    const number = activeSettings.whatsappRaw || activeSettings.whatsappNumber || BRAND_CONFIG.whatsappRaw;
    const cleanPhone = number.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello Maryam Trade Center! I would like to inquire about your fashion collection.')}`;
    openWhatsApp(url);
  };

  return (
    <footer id="main-website-footer" className="bg-[#24101A] text-white border-t border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-[#421C2D]/30 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* COLUMN 1: Official Logo & Brand Description */}
          <div className="lg:col-span-4 space-y-4">
            <OfficialLogo 
              customLogoUrl={currentLogo} 
              variant="light" 
              size="md" 
            />
            <p className="font-sans text-xs sm:text-sm text-[#E2D5CC] leading-relaxed pt-2 max-w-sm">
              {activeSettings.footerDescription || activeSettings.footerAbout || 'Maryam Trade Center is a premier Pakistani fashion and accessories catalog. Discover exquisite handcrafted suits, structured leather handbags, and festive ensembles with effortless direct ordering via WhatsApp.'}
            </p>
            
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                id="footer-whatsapp-chat-button"
                onClick={handleWhatsAppClick}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#BFA36D] hover:bg-[#A88D56] text-[#24101A] text-xs font-sans font-bold tracking-wide uppercase transition-all shadow-md transform hover:scale-[1.02] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>ORDER ON WHATSAPP</span>
              </button>
            </div>

            {/* Follow Us / Social Profiles */}
            <div className="pt-3 space-y-2.5">
              <span className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#BFA36D] block">
                FOLLOW US
              </span>
              <div className="flex items-center gap-3" id="footer-social-links">
                {/* Official Instagram Button */}
                <a
                  id="footer-instagram-link"
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Maryam Trade Center on Instagram"
                  title="Maryam Trade Center on Instagram"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#BFA36D] text-white hover:text-[#24101A] border border-white/15 hover:border-[#BFA36D] flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-xs cursor-pointer group"
                >
                  <Instagram className="w-5 h-5 transition-transform group-hover:scale-105" />
                </a>

                {/* Official Facebook Button */}
                <a
                  id="footer-facebook-link"
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Maryam Trade Center on Facebook"
                  title="Maryam Trade Center on Facebook"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#BFA36D] text-white hover:text-[#24101A] border border-white/15 hover:border-[#BFA36D] flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-xs cursor-pointer group"
                >
                  <Facebook className="w-5 h-5 transition-transform group-hover:scale-105" />
                </a>
              </div>
            </div>
          </div>

          {/* COLUMN 2: QUICK LINKS */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="font-sans text-xs font-bold tracking-[0.2em] uppercase text-[#BFA36D]">
              QUICK LINKS
            </h4>
            <ul className="space-y-2.5 font-sans text-xs sm:text-sm text-[#E2D5CC]">
              <li>
                <button
                  id="footer-link-home"
                  onClick={() => handleNav('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  id="footer-link-shop"
                  onClick={() => handleNav('shop')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Shop All
                </button>
              </li>
              <li>
                <button
                  id="footer-link-categories"
                  onClick={() => handleNav('categories')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Categories
                </button>
              </li>
              <li>
                <button
                  id="footer-link-about"
                  onClick={() => handleNav('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  id="footer-link-contact"
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: SHOP */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="font-sans text-xs font-bold tracking-[0.2em] uppercase text-[#BFA36D]">
              SHOP
            </h4>
            <ul className="space-y-2.5 font-sans text-xs sm:text-sm text-[#E2D5CC]">
              <li>
                <button
                  id="footer-cat-suits"
                  onClick={() => handleCategoryNav('suits')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Luxury Suits
                </button>
              </li>
              <li>
                <button
                  id="footer-cat-handbags"
                  onClick={() => handleCategoryNav('handbags')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Handbags
                </button>
              </li>
              <li>
                <button
                  id="footer-cat-accessories"
                  onClick={() => handleCategoryNav('accessories')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Accessories
                </button>
              </li>
              <li>
                <button
                  id="footer-cat-new"
                  onClick={() => handleCategoryNav('new-arrivals')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  id="footer-cat-womens"
                  onClick={() => handleCategoryNav('womens-collection')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Women's Collection
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: CONTACT & FOLLOW */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="font-sans text-xs font-bold tracking-[0.2em] uppercase text-[#BFA36D]">
              CONTACT
            </h4>
            <div className="space-y-3 font-sans text-xs sm:text-sm text-[#E2D5CC]">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#BFA36D] shrink-0" />
                <a
                  href={`mailto:${activeSettings.email || BRAND_CONFIG.email}`}
                  className="hover:text-white transition-colors truncate"
                >
                  {activeSettings.email || BRAND_CONFIG.email}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#BFA36D] shrink-0" />
                <a
                  href={`tel:${activeSettings.whatsappNumber || BRAND_CONFIG.whatsappNumber}`}
                  className="hover:text-white transition-colors font-mono"
                >
                  {activeSettings.whatsappNumber || BRAND_CONFIG.whatsappNumber}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#BFA36D] shrink-0" />
                <span>WhatsApp: {activeSettings.whatsappNumber || BRAND_CONFIG.whatsappNumber}</span>
              </div>

              <div className="pt-2 text-xs text-[#C4B2BA]">
                <p className="font-serif italic text-[#BFA36D]">{activeSettings.tagline || 'CARRY THE MOMENT'}</p>
                <p>{activeSettings.subtagline || 'Elegance that moves with you.'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: Copyright & Admin Portal Link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-[#A896A0]">
          <div className="flex items-center gap-3">
            <p>© {new Date().getFullYear()} {activeSettings.businessName || 'Maryam Trade Center'}. All rights reserved.</p>
            <span className="opacity-40">•</span>
            <button
              id="footer-admin-login-link"
              onClick={onOpenAdmin || (() => window.location.hash = '#admin')}
              className="text-[11px] font-sans uppercase tracking-widest text-[#A896A0] hover:text-[#BFA36D] transition-colors cursor-pointer"
            >
              ADMIN
            </button>
          </div>
          <p className="text-center sm:text-right">
            Official E-Commerce Catalog • Direct WhatsApp Ordering
          </p>
        </div>
      </div>
    </footer>
  );
};

