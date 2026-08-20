import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, Search, RotateCcw, X, MessageCircle } from 'lucide-react';
import { Product, Category, FilterState } from '../types';
import { CATEGORIES_DATA } from '../data/products';
import { ProductCard } from './ProductCard';
import { getGeneralWhatsAppInquiryUrl, openWhatsApp } from '../utils/whatsapp';

interface ShopViewProps {
  products: Product[];
  categories?: Category[];
  onViewProduct: (product: Product) => void;
  initialCategory?: string;
}

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  categories,
  onViewProduct,
  initialCategory = 'all',
}) => {
  const displayCategories = Array.isArray(categories) && categories.length > 0 ? categories : CATEGORIES_DATA;
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<FilterState['sortBy']>('featured');
  const [onlyNewArrivals, setOnlyNewArrivals] = useState<boolean>(false);
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);
  const [priceCap, setPriceCap] = useState<number>(40000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Compute max price from products
  const maxPriceInData = useMemo(() => {
    return Math.max(...products.map((p) => p.price || 0), 35000);
  }, [products]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category filter
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'new-arrivals') {
            if (!product.newArrival) return false;
          } else if (selectedCategory === 'womens-collection') {
            // Include suits and apparel
            if (product.category !== 'suits' && product.category !== 'womens-collection') return false;
          } else if (product.category !== selectedCategory) {
            return false;
          }
        }

        // Search query filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchName = product.name.toLowerCase().includes(query);
          const matchSku = product.sku.toLowerCase().includes(query);
          const matchDesc = product.description.toLowerCase().includes(query);
          const matchCat = product.categoryLabel.toLowerCase().includes(query);
          if (!matchName && !matchSku && !matchDesc && !matchCat) return false;
        }

        // Flags
        if (onlyNewArrivals && !product.newArrival) return false;
        if (onlyFeatured && !product.featured) return false;

        // Price filter
        if (product.price && product.price > priceCap) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
          return (a.price || 0) - (b.price || 0);
        }
        if (sortBy === 'price-desc') {
          return (b.price || 0) - (a.price || 0);
        }
        if (sortBy === 'newest') {
          return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
        }
        // Default featured
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy, onlyNewArrivals, onlyFeatured, priceCap]);

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
    setOnlyNewArrivals(false);
    setOnlyFeatured(false);
    setPriceCap(maxPriceInData);
    setIsMobileFilterOpen(false);
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    onlyNewArrivals ||
    onlyFeatured ||
    priceCap < maxPriceInData;

  return (
    <div id="shop-page-view" className="py-10 sm:py-16 bg-[#FDFBF7] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="border-b border-[#EAE3D9] pb-8 mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#BFA36D] font-semibold">
              The Complete Catalog
            </span>
            <h1
              id="shop-page-title"
              className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#421C2D] mt-1 font-normal tracking-tight"
            >
              SHOP ALL
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#5A4B54] mt-2 max-w-xl">
              Browse our curated collection of luxury Pakistani suits, artisan leather handbags, and handcrafted accessories. Order directly on WhatsApp.
            </p>
          </div>

          {/* Quick Stats & Mobile Filter Button */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-xs font-sans text-[#7A6B74]">
              Showing <strong className="text-[#421C2D]">{filteredProducts.length}</strong> pieces
            </span>

            <button
              id="mobile-filter-open-button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-panel bg-white/70 text-[#421C2D] text-xs font-sans font-medium border border-white/60 shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#BFA36D]" />
              <span>Filters {hasActiveFilters && '●'}</span>
            </button>
          </div>
        </div>

        {/* Main Grid with Filter Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar with Frosted Glass Panel */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-28 space-y-7 glass-panel bg-white/65 backdrop-blur-xl p-6 rounded-3xl border border-white/70 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D9]">
              <span className="font-sans text-xs font-bold tracking-widest uppercase text-[#421C2D] flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#BFA36D]" />
                Filters
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="text-[11px] font-sans text-[#BFA36D] hover:text-[#421C2D] flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Search within shop */}
            <div>
              <label className="block text-xs font-sans font-semibold tracking-wider uppercase text-[#421C2D] mb-2">
                Search Catalog
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="shop-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, SKU, fabric..."
                  className="w-full text-xs font-sans pl-8 pr-3 py-2 rounded-xl bg-white/60 border border-[#E2D9CC] text-[#2A2A2A] focus:outline-hidden focus:border-[#BFA36D]"
                />
                <Search className="w-3.5 h-3.5 text-[#7A6B74] absolute left-2.5 top-3" />
              </div>
            </div>

            {/* Categories Filter */}
            <div>
              <label className="block text-xs font-sans font-semibold tracking-wider uppercase text-[#421C2D] mb-2.5">
                Categories
              </label>
              <div className="space-y-1.5">
                <button
                  id="filter-cat-all"
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-sans flex items-center justify-between transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#421C2D] text-white font-medium shadow-xs'
                      : 'text-[#5A4B54] hover:bg-white/60'
                  }`}
                >
                  <span>All Collections</span>
                  <span>{products.length}</span>
                </button>
                {displayCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      id={`filter-cat-${cat.slug}`}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-sans flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-[#421C2D] text-white font-medium shadow-xs'
                          : 'text-[#5A4B54] hover:bg-white/60'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[11px] opacity-70">{cat.itemCount}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-sans font-semibold tracking-wider uppercase text-[#421C2D]">
                  Max Price
                </label>
                <span className="text-xs font-mono font-bold text-[#421C2D]">
                  Rs. {priceCap.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={40000}
                step={1000}
                value={priceCap}
                onChange={(e) => setPriceCap(Number(e.target.value))}
                className="w-full accent-[#BFA36D] cursor-pointer"
              />
            </div>

            {/* Status Toggles */}
            <div className="space-y-2 pt-2 border-t border-[#EAE3D9]">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-sans text-[#5A4B54]">
                <input
                  type="checkbox"
                  checked={onlyNewArrivals}
                  onChange={(e) => setOnlyNewArrivals(e.target.checked)}
                  className="rounded-md border-[#D5CABE] text-[#421C2D] focus:ring-[#BFA36D]"
                />
                <span>New Arrivals Only</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-sans text-[#5A4B54]">
                <input
                  type="checkbox"
                  checked={onlyFeatured}
                  onChange={(e) => setOnlyFeatured(e.target.checked)}
                  className="rounded-md border-[#D5CABE] text-[#421C2D] focus:ring-[#BFA36D]"
                />
                <span>Featured Pieces Only</span>
              </label>
            </div>
          </aside>

          {/* Main Products Grid & Sort Bar */}
          <main className="lg:col-span-9 space-y-6">
            {/* Top Toolbar: Sorting & Active Filters */}
            <div className="glass-panel bg-white/60 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/60 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel bg-white/80 text-[#421C2D] text-xs font-sans font-medium shrink-0 border border-white/60">
                    <span>Category: {selectedCategory}</span>
                    <button onClick={() => setSelectedCategory('all')}>
                      <X className="w-3 h-3 text-[#BFA36D]" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel bg-white/80 text-[#421C2D] text-xs font-sans font-medium shrink-0 border border-white/60">
                    <span>"{searchQuery}"</span>
                    <button onClick={() => setSearchQuery('')}>
                      <X className="w-3 h-3 text-[#BFA36D]" />
                    </button>
                  </span>
                )}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
                <label className="text-xs font-sans text-[#7A6B74] whitespace-nowrap">Sort by:</label>
                <select
                  id="shop-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as FilterState['sortBy'])}
                  className="text-xs font-sans bg-white/70 border border-[#E2D9CC] rounded-xl px-3 py-1.5 text-[#421C2D] focus:outline-hidden focus:border-[#BFA36D]"
                >
                  <option value="featured">Featured First</option>
                  <option value="newest">Newest Releases</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={onViewProduct}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div
                id="no-products-available-state"
                className="text-center py-16 sm:py-20 glass-panel bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 p-6 sm:p-10 max-w-md mx-auto my-8 space-y-4 shadow-md"
              >
                <div className="w-16 h-16 rounded-full bg-[#BFA36D]/15 text-[#BFA36D] flex items-center justify-center mx-auto">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-2xl text-[#421C2D] font-normal">
                  {products.length === 0 ? 'CATALOG BEING UPDATED' : 'NO PRODUCTS MATCHED'}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#5A4B54] leading-relaxed">
                  {products.length === 0
                    ? 'Our luxury collections are currently being curated. Contact our consultants on WhatsApp for instant catalog inquiries or custom orders.'
                    : 'No items matched your current filter selection. Try adjusting your search query or reset your filters.'}
                </p>
                {products.length === 0 ? (
                  <button
                    id="empty-state-whatsapp-inquire-btn"
                    onClick={() => openWhatsApp('https://wa.me/923305859348?text=Hello%20Maryam%20Trade%20Center!%20I%20would%20like%20to%20inquire%20about%20your%20latest%20product%20catalog.')}
                    className="px-6 py-3 rounded-full bg-[#BFA36D] hover:bg-[#A88D56] text-[#24101A] text-xs font-sans font-bold tracking-wider uppercase transition-all shadow-sm flex items-center gap-2 mx-auto"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>INQUIRE ON WHATSAPP</span>
                  </button>
                ) : (
                  <button
                    id="empty-state-explore-all-btn"
                    onClick={resetAllFilters}
                    className="px-6 py-3 rounded-full bg-[#421C2D] hover:bg-[#331523] text-white text-xs font-sans font-semibold tracking-wider uppercase transition-all shadow-sm"
                  >
                    RESET ALL FILTERS
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer with Frosted Glass Styling */}
      {isMobileFilterOpen && (
        <div
          id="mobile-filter-drawer-backdrop"
          className="fixed inset-0 z-50 lg:hidden bg-black/50 backdrop-blur-sm flex justify-end animate-fade-in"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div
            className="w-4/5 max-w-sm glass-panel bg-[#FDFBF7]/95 backdrop-blur-2xl h-full p-6 overflow-y-auto flex flex-col justify-between border-l border-white/60 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D9]">
                <h3 className="font-serif text-xl text-[#421C2D]">Filters &amp; Refinements</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-full text-[#5A4B54] hover:bg-white/60"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category selector */}
              <div className="py-5 space-y-2">
                <label className="block text-xs font-sans font-semibold uppercase text-[#421C2D] mb-2">
                  Category
                </label>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-sans ${
                    selectedCategory === 'all' ? 'bg-[#421C2D] text-white font-medium' : 'text-[#5A4B54] bg-white/60'
                  }`}
                >
                  All Collections
                </button>
                {displayCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-sans ${
                      selectedCategory === c.slug ? 'bg-[#421C2D] text-white font-medium' : 'text-[#5A4B54] bg-white/60'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Price Cap */}
              <div className="py-4 border-t border-[#EAE3D9]">
                <div className="flex justify-between text-xs font-sans mb-2 text-[#421C2D]">
                  <span>Max Price</span>
                  <span className="font-bold font-mono">Rs. {priceCap.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={40000}
                  step={1000}
                  value={priceCap}
                  onChange={(e) => setPriceCap(Number(e.target.value))}
                  className="w-full accent-[#BFA36D]"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-[#EAE3D9] space-y-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-[#421C2D] text-white font-sans text-xs font-semibold uppercase shadow-md"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              <button
                onClick={resetAllFilters}
                className="w-full py-2.5 rounded-xl glass-panel bg-white/60 text-[#421C2D] font-sans text-xs font-semibold uppercase border border-white/70"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
