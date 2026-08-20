import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { WebsiteSettings, BRAND_CONFIG } from '../types';
import { openWhatsApp } from '../utils/whatsapp';

interface FloatingWhatsAppProps {
  settings?: WebsiteSettings;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ settings }) => {
  const [isHovered, setIsHovered] = useState(false);
  const activeSettings = settings || BRAND_CONFIG;
  const rawNumber = activeSettings.whatsappRaw || activeSettings.whatsappNumber || BRAND_CONFIG.whatsappRaw;
  const cleanPhone = rawNumber.replace(/[^0-9]/g, '');

  const handleClick = () => {
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello Maryam Trade Center! I would like to inquire about your fashion collection.')}`;
    openWhatsApp(url);
  };

  return (
    <div
      id="floating-whatsapp-widget"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-3 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Desktop Tooltip Label */}
      <div
        className={`hidden sm:flex items-center gap-2 glass-panel-plum text-white px-4 py-2.5 rounded-full shadow-2xl border border-white/25 text-xs font-sans font-semibold tracking-wide transition-all duration-300 transform ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3 pointer-events-none'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#BFA36D] animate-pulse" />
        <span>ORDER / CHAT ON WHATSAPP</span>
      </div>

      {/* Floating Action Button */}
      <button
        id="floating-whatsapp-button"
        onClick={handleClick}
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-108 focus:outline-hidden ring-4 ring-white/50 cursor-pointer"
        aria-label="Order / Chat on WhatsApp with Maryam Trade Center"
        title={`Chat on WhatsApp (${activeSettings.whatsappNumber || BRAND_CONFIG.whatsappNumber})`}
      >
        <MessageCircle className="w-7 h-7 fill-current text-white" />
      </button>
    </div>
  );
};
