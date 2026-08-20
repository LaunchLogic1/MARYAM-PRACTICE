import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Product, ActivePage } from '../types';
import { ProductCard } from './ProductCard';

interface NewArrivalsProps {
  products: Product[];
  onViewProduct: (product: Product) => void;
  setActivePage: (page: ActivePage) => void;
}

export const NewArrivals: React.FC<NewArrivalsProps> = ({
  products,
  onViewProduct,
  setActivePage,
}) => {
  const newArrivalsList = products.filter((p) => p.newArrival).slice(0, 8);

  return (
    <section id="new-arrivals-section" className="py-16 sm:py-24 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-sans tracking-[0.25em] uppercase text-[#BFA36D] font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Season Releases</span>
            </div>
            <h2
              id="new-arrivals-heading"
              className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#421C2D] font-normal tracking-tight"
            >
              NEW ARRIVALS
            </h2>
            <p
              id="new-arrivals-subtext"
              className="font-sans text-sm sm:text-base text-[#5A4B54] mt-2 max-w-xl"
            >
              Discover the latest pieces from Maryam Trade Center.
            </p>
          </div>

          <button
            id="view-all-new-arrivals-btn"
            onClick={() => {
              setActivePage('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-xs sm:text-sm font-sans tracking-widest uppercase font-semibold text-[#421C2D] hover:text-[#BFA36D] transition-colors group"
          >
            <span>VIEW ENTIRE CATALOG</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Responsive Grid or Empty Notification */}
        {newArrivalsList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
            {newArrivalsList.map((product) => (
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
              Fresh Arrivals in Preparation
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#5A4B54] mt-2 leading-relaxed">
              Our new season luxury catalog is currently being uploaded. Check back soon or message our team for early access.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
