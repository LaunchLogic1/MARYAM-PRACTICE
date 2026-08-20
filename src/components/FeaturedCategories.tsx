import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CATEGORIES_DATA } from '../data/products';
import { Category } from '../types';
import { getSafeImageUrl } from '../utils/imageStorage';

interface FeaturedCategoriesProps {
  categories?: Category[];
  onSelectCategory: (categorySlug: string) => void;
}

export const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({
  categories,
  onSelectCategory,
}) => {
  const displayCategories = Array.isArray(categories) && categories.length > 0 ? categories : CATEGORIES_DATA;
  const [errorMap, setErrorMap] = useState<Record<string, boolean>>({});

  return (
    <section id="shop-by-category-section" className="py-14 sm:py-20 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="font-sans text-xs tracking-[0.25em] text-[#BFA36D] uppercase font-semibold">
            Curated Departures
          </span>
          <h2
            id="featured-categories-heading"
            className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#421C2D] mt-2 font-normal tracking-tight"
          >
            SHOP BY CATEGORY
          </h2>
          <div className="w-12 h-[2px] bg-[#BFA36D] mx-auto mt-4" />
          <p className="font-sans text-sm sm:text-base text-[#5A4B54] mt-3.5">
            Discover exquisite handcrafted suits, luxury statement handbags, and artisanal accessories.
          </p>
        </div>

        {/* Categories Grid (Curated Editorial Bento Layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {displayCategories.map((cat: Category, index: number) => {
            const isFeaturedLarge = index === 0;
            const imgSrc = errorMap[cat.id] ? getSafeImageUrl(undefined, cat.slug) : getSafeImageUrl(cat.image, cat.slug);

            return (
              <div
                key={cat.id}
                id={`category-card-${cat.slug}`}
                onClick={() => onSelectCategory(cat.slug)}
                className={`group relative rounded-3xl overflow-hidden cursor-pointer bg-[#F5EFE6] border border-white/60 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-end ${
                  isFeaturedLarge ? 'sm:col-span-2 lg:col-span-2 min-h-[340px] sm:min-h-[380px]' : 'min-h-[320px] sm:min-h-[380px]'
                }`}
              >
                {/* Background Category Image */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={`Maryam Trade Center ${cat.name}`}
                    onError={() => setErrorMap((prev) => ({ ...prev, [cat.id]: true }))}
                    className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-108"
                    loading="lazy"
                  />
                  {/* Subtle Plum/Charcoal Vignette Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#200B15]/90 via-[#2A111E]/45 to-transparent transition-opacity duration-300 group-hover:opacity-95" />
                </div>

                {/* Card Content Overlay with Frosted Glass Badge */}
                <div className="relative z-10 p-6 sm:p-8 text-white flex items-end justify-between">
                  <div className="max-w-md">
                    <span className="text-[11px] font-sans tracking-[0.2em] uppercase text-[#E8D8C4] font-medium block mb-1">
                      {cat.itemCount} Curated Pieces
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal tracking-wide">
                      {cat.name}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-[#F0E6D8] mt-1.5 opacity-90 line-clamp-1">
                      {cat.tagline}
                    </p>
                  </div>

                  {/* Explore Button Indicator */}
                  <div className="shrink-0 ml-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full glass-panel bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/40 flex items-center justify-center text-white transition-all duration-300 group-hover:bg-[#BFA36D] group-hover:text-[#24101A] group-hover:border-[#BFA36D] group-hover:rotate-45 shadow-sm">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
