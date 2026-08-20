import React from 'react';
import { Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import { Product, ActivePage } from '../types';
import { ProductCard } from './ProductCard';
import { getGeneralWhatsAppInquiryUrl, openWhatsApp } from '../utils/whatsapp';

interface FeaturedCollectionProps {
  products: Product[];
  onViewProduct: (product: Product) => void;
  setActivePage: (page: ActivePage) => void;
}

export const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({
  products,
  onViewProduct,
  setActivePage,
}) => {
  const featuredList = products.filter((p) => p.featured).slice(0, 4);

  return (
    <section id="featured-collection-section" className="py-16 sm:py-24 bg-[#F8F4EE] border-t border-[#EAE3D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Intro */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="font-sans text-xs tracking-[0.25em] text-[#BFA36D] uppercase font-semibold">
            Handcrafted Masterpieces
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#421C2D] mt-2 font-normal tracking-tight">
            FEATURED COLLECTION
          </h2>
          <div className="w-12 h-[2px] bg-[#BFA36D] mx-auto mt-4" />
          <p className="font-sans text-sm sm:text-base text-[#5A4B54] mt-3.5 leading-relaxed">
            Our most sought-after festive ensembles and leather silhouettes, celebrated for their exceptional craftsmanship and timeless Pakistani elegance.
          </p>
        </div>

        {/* 4-Item Showcase Grid or Clean Empty Catalog Notice */}
        {featuredList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
            {featuredList.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={onViewProduct}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-6 rounded-3xl glass-card bg-white/70 border border-white/80 max-w-lg mx-auto shadow-xs">
            <Sparkles className="w-8 h-8 text-[#BFA36D] mx-auto mb-3" />
            <h3 className="font-serif text-xl text-[#421C2D] font-normal">
              New Curated Pieces Coming Soon
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#5A4B54] mt-2 leading-relaxed">
              Our latest featured catalog is being updated. Contact our consultants on WhatsApp for direct availability and custom stitching requests.
            </p>
          </div>
        )}

        {/* Bottom Banner with WhatsApp Direct Inquiry & Frosted Glass / Plum Background */}
        <div className="mt-12 sm:mt-16 rounded-3xl glass-panel-plum p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-white/20">
          <div className="text-center sm:text-left">
            <span className="text-xs font-sans tracking-widest text-[#BFA36D] uppercase font-semibold">
              Bespoke Custom Stitching &amp; Bulk Inquiries
            </span>
            <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl text-white mt-1">
              Looking for a custom size or unstitched piece?
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#F0E6DA] mt-1.5 max-w-xl">
              Message our Maryam Trade Center consultants directly on WhatsApp for tailored sizing, fabric consultations, or bulk export orders.
            </p>
          </div>

          <button
            id="featured-whatsapp-consult-btn"
            onClick={() => openWhatsApp(getGeneralWhatsAppInquiryUrl('Hello Maryam Trade Center! I would like to ask about custom sizing and special collection pieces.'))}
            className="shrink-0 px-6 py-3.5 rounded-full bg-[#BFA36D] hover:bg-[#A88D56] text-[#24101A] font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase flex items-center gap-2 shadow-md transition-all focus:outline-hidden hover:scale-102"
          >
            <MessageCircle className="w-4 h-4 fill-current text-[#24101A]" />
            <span>CONSULT ON WHATSAPP</span>
          </button>
        </div>
      </div>
    </section>
  );
};
