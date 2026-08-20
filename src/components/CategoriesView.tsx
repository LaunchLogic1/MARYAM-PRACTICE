import React, { useState } from 'react';
import { Sparkles, ArrowRight, Layers } from 'lucide-react';
import { CATEGORIES_DATA } from '../data/products';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';
import { getSafeImageUrl } from '../utils/imageStorage';

interface CategoriesViewProps {
  products: Product[];
  categories?: Category[];
  onViewProduct: (product: Product) => void;
  selectedCategorySlug?: string;
  onSelectCategory: (slug: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  products,
  categories,
  onViewProduct,
  selectedCategorySlug,
  onSelectCategory,
}) => {
  const [catImgError, setCatImgError] = useState(false);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>(
    selectedCategorySlug || 'all'
  );

  const displayCategories = Array.isArray(categories) && categories.length > 0 ? categories : CATEGORIES_DATA;
  const activeCategoryObj = displayCategories.find((c) => c.slug === activeCategorySlug);

  const displayedProducts = activeCategorySlug === 'all'
    ? products
    : activeCategorySlug === 'new-arrivals'
    ? products.filter((p) => p.newArrival)
    : activeCategorySlug === 'womens-collection'
    ? products.filter((p) => p.category === 'suits' || p.category === 'womens-collection')
    : products.filter((p) => p.category === activeCategorySlug);

  return (
    <div id="categories-page-view" className="py-10 sm:py-16 bg-[#FDFBF7] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-sans tracking-[0.25em] uppercase text-[#BFA36D] font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Curated Taxonomy</span>
          </div>
          <h1
            id="categories-page-title"
            className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#421C2D] font-normal tracking-tight"
          >
            EXPLORE CATEGORIES
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#5A4B54] mt-2">
            Select a curated department to view our collection of authentic Pakistani fashion and accessories.
          </p>
        </div>

        {/* Category Pills Selector */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-10">
          <button
            id="category-pill-all"
            onClick={() => setActiveCategorySlug('all')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-sans tracking-wider uppercase font-medium transition-all ${
              activeCategorySlug === 'all'
                ? 'bg-[#421C2D] text-white shadow-md'
                : 'glass-panel bg-white/60 text-[#5A4B54] hover:bg-white/90 border border-white/60'
            }`}
          >
            All Categories ({products.length})
          </button>
          {displayCategories.map((cat) => {
            const isActive = activeCategorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                id={`category-pill-${cat.slug}`}
                onClick={() => setActiveCategorySlug(cat.slug)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-sans tracking-wider uppercase font-medium transition-all ${
                  isActive
                    ? 'bg-[#421C2D] text-white shadow-md'
                    : 'glass-panel bg-white/60 text-[#5A4B54] hover:bg-white/90 border border-white/60'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Active Category Banner if single selected */}
        {activeCategoryObj && activeCategorySlug !== 'all' && (
          <div className="relative rounded-3xl overflow-hidden mb-12 h-64 sm:h-80 shadow-lg border border-white/50">
            <img
              src={catImgError ? getSafeImageUrl(undefined, activeCategoryObj.slug) : getSafeImageUrl(activeCategoryObj.image, activeCategoryObj.slug)}
              alt={activeCategoryObj.name}
              onError={() => setCatImgError(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#421C2D]/95 via-[#421C2D]/60 to-transparent flex items-center p-8 sm:p-12">
              <div className="max-w-xl text-white">
                <span className="text-xs font-sans tracking-[0.2em] uppercase text-[#BFA36D] font-semibold block mb-1">
                  Department Spotlight
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white">
                  {activeCategoryObj.name}
                </h2>
                <p className="font-sans text-sm sm:text-base text-[#F0E6DA] mt-2">
                  {activeCategoryObj.tagline}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid for this category or Empty Notification */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={onViewProduct}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 rounded-3xl glass-card bg-white/70 border border-white/80 max-w-lg mx-auto shadow-xs">
            <Layers className="w-8 h-8 text-[#BFA36D] mx-auto mb-3" />
            <h3 className="font-serif text-xl text-[#421C2D] font-normal">
              No Products in this Category Yet
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#5A4B54] mt-2 leading-relaxed">
              Products for this department will be listed here as soon as they are published. Contact us on WhatsApp for direct bespoke orders.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
