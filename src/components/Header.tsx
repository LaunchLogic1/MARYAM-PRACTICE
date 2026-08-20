import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, Menu, X, ArrowRight } from 'lucide-react';
import { OfficialLogo } from './OfficialLogo';
import { ActivePage, WebsiteSettings, BRAND_CONFIG } from '../types';
import { openWhatsApp } from '../utils/whatsapp';

interface HeaderProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  onOpenSearch: () => void;
  onSelectCategory?: (categorySlug: string) => void;
  settings?: WebsiteSettings;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  setActivePage,
  onOpenSearch,
  settings,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeSettings = settings || BRAND_CONFIG;
  const currentLogo = activeSettings.logo || activeSettings.logoUrl;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { label: string; page: ActivePage }[] = [
    { label: 'HOME', page: 'home' },
    { label: 'SHOP', page: 'shop' },
    { label: 'CATEGORIES', page: 'categories' },
    { label: 'ABOUT', page: 'about' },
    { label: 'CONTACT', page: 'contact' },
  ];

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsAppClick = () => {
    const number = activeSettings.whatsappRaw || activeSettings.whatsappNumber || BRAND_CONFIG.whatsappRaw;
    const cleanPhone = number.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello Maryam Trade Center! I would like to inquire about your fashion collection.')}`;
    openWhatsApp(url);
  };

  return (
    <>
      <header
        id="main-sticky-header"
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'glass-panel bg-white/70 backdrop-blur-xl shadow-sm border-b border-white/60 py-2.5 sm:py-3'
            : 'glass-panel-subtle bg-[#FDFBF7]/80 backdrop-blur-md border-b border-[#EAE3D9]/60 py-3.5 sm:py-4.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Official Logo */}
          <button
            id="header-logo-button"
            onClick={() => handleNavClick('home')}
            className="group text-left transition-opacity hover:opacity-90 focus:outline-hidden cursor-pointer"
            aria-label="Maryam Trade Center Home"
          >
            <OfficialLogo 
              customLogoUrl={currentLogo} 
              size={isScrolled ? 'sm' : 'md'} 
              showSubtitle={!isScrolled} 
            />
          </button>

          {/* Desktop Navigation */}
          <nav
            id="desktop-main-navigation"
            className="hidden md:flex items-center space-x-7 lg:space-x-9"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => {
              const isActive = activePage === item.page;
              return (
                <button
                  key={item.page}
                  id={`nav-link-${item.page}`}
                  onClick={() => handleNavClick(item.page)}
                  className={`relative font-sans text-xs lg:text-[13px] tracking-[0.14em] font-medium transition-colors duration-200 py-1.5 focus:outline-hidden cursor-pointer ${
                    isActive
                      ? 'text-[#421C2D] font-bold'
                      : 'text-[#5A4B54] hover:text-[#421C2D]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#BFA36D] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: Search & WhatsApp */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5">
            {/* Search Button with Glass Effect */}
            <button
              id="header-search-button"
              onClick={onOpenSearch}
              className="p-2 sm:p-2.5 rounded-full text-[#421C2D] hover:text-[#331523] glass-panel-subtle hover:bg-white/80 transition-all focus:outline-hidden cursor-pointer"
              aria-label="Search collection"
              title="Search products"
            >
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Direct WhatsApp Ordering / Contact CTA Button */}
            <button
              id="header-whatsapp-cta"
              onClick={handleWhatsAppClick}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-full bg-[#BFA36D] hover:bg-[#A88D56] text-white text-xs sm:text-[13px] font-medium tracking-wide shadow-xs hover:shadow-md transition-all focus:outline-hidden group cursor-pointer"
              aria-label="Order on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 shrink-0 fill-current text-white" />
              <span className="hidden sm:inline font-sans">ORDER ON WHATSAPP</span>
              <span className="sm:hidden font-sans">ORDER</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              id="header-mobile-menu-button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-full text-[#421C2D] glass-panel-subtle focus:outline-hidden cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation with Frosted Backdrop */}
      {isMobileMenuOpen && (
        <div
          id="mobile-drawer-overlay"
          className="fixed inset-0 z-50 md:hidden animate-fade-in flex"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#24101A]/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel with Glass Frosted Aesthetic */}
          <div className="relative ml-auto w-full max-w-xs bg-[#FAF8F5]/95 backdrop-blur-2xl h-full shadow-2xl p-6 flex flex-col justify-between border-l border-white/80 animate-slide-left">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-[#EAE3D9]">
                <OfficialLogo customLogoUrl={currentLogo} size="sm" showSubtitle={false} />
                <button
                  id="mobile-drawer-close-button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full text-[#421C2D] hover:bg-white/60 focus:outline-hidden cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="py-6 space-y-2">
                {navItems.map((item) => {
                  const isActive = activePage === item.page;
                  return (
                    <button
                      key={item.page}
                      id={`mobile-nav-link-${item.page}`}
                      onClick={() => handleNavClick(item.page)}
                      className={`w-full text-left px-4 py-3 rounded-xl font-sans text-sm tracking-wider font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'glass-panel bg-white/70 text-[#421C2D] font-bold border border-white/80'
                          : 'text-[#5A4B54] hover:bg-white/50'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="w-4 h-4 text-[#BFA36D]" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-6 border-t border-[#EAE3D9] space-y-3">
              <button
                id="mobile-drawer-whatsapp-button"
                onClick={() => {
                  handleWhatsAppClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#BFA36D] hover:bg-[#A88D56] text-white font-medium text-sm tracking-wide shadow-md cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>ORDER ON WHATSAPP</span>
              </button>

              <div className="text-center text-xs text-[#7A6B74] pt-2">
                <p className="font-serif italic">{activeSettings.subtagline || 'Elegance that moves with you.'}</p>
                <p className="mt-1 font-sans font-mono">{activeSettings.whatsappNumber || BRAND_CONFIG.whatsappNumber}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
