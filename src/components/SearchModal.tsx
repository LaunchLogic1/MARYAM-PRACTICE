import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MessageCircle, ArrowRight } from 'lucide-react';
import { Product, BRAND_CONFIG } from '../types';
import { getWhatsAppOrderUrl, openWhatsApp } from '../utils/whatsapp';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = query.trim() === ''
    ? []
    : products.filter((p) => {
        const q = query.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      });

  return (
    <div
      id="site-search-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl glass-panel bg-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/70 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="p-4 sm:p-5 border-b border-white/40 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#BFA36D] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            id="global-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name, code/SKU, category..."
            className="w-full text-sm sm:text-base font-sans text-[#421C2D] placeholder-[#9A8C94] focus:outline-hidden bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-[#7A6B74] hover:bg-white/60"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-white/60 hover:bg-white/80 text-[#421C2D] text-xs font-sans font-medium transition-colors border border-white/60"
          >
            Esc
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5 space-y-3">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-[#7A6B74] text-xs sm:text-sm font-sans space-y-2">
              <p>Type keywords to search Maryam Trade Center catalog</p>
              <div className="flex justify-center gap-2 pt-2">
                {['Chiffon', 'Raw Silk', 'Handbag', 'Velvet', 'Kundan'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 rounded-full bg-white/60 border border-white/70 text-[#5A4B54] text-xs hover:bg-[#421C2D] hover:text-white transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2.5">
              <span className="text-[11px] font-sans uppercase tracking-wider text-[#BFA36D] font-semibold block px-1">
                Found {results.length} results
              </span>
              {results.map((product) => {
                const formattedPrice = product.price 
                  ? `${BRAND_CONFIG.currencySymbol} ${product.price.toLocaleString()}` 
                  : 'Price on Inquiry';

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl glass-card bg-white/70 hover:bg-white/95 border border-white/60 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="w-12 h-14 object-cover rounded-xl shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase tracking-wider text-[#BFA36D] font-sans font-semibold block">
                          {product.categoryLabel} • {product.sku}
                        </span>
                        <h4 className="font-serif text-sm text-[#421C2D] font-medium truncate">
                          {product.name}
                        </h4>
                        <span className="font-sans font-bold text-xs text-[#421C2D]">
                          {formattedPrice}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openWhatsApp(getWhatsAppOrderUrl({ product }));
                        }}
                        className="p-2 rounded-xl bg-[#BFA36D] text-[#24101A] hover:bg-[#A88D56] transition-colors shadow-xs"
                        title="Order on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 fill-current" />
                      </button>
                      <ArrowRight className="w-4 h-4 text-[#8C7A84] group-hover:text-[#421C2D] transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center text-[#7A6B74] text-sm">
              No products found matching "<strong>{query}</strong>".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
