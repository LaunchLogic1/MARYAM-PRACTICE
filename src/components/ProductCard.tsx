import React, { useState } from 'react';
import { MessageCircle, Eye, Tag, Image as ImageIcon } from 'lucide-react';
import { Product, BRAND_CONFIG } from '../types';
import { getWhatsAppOrderUrl, openWhatsApp } from '../utils/whatsapp';
import { getSafeImageUrl } from '../utils/imageStorage';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
}) => {
  const [imageError, setImageError] = useState(false);
  const safeImage = getSafeImageUrl(product.mainImage, product.category);

  const handleQuickWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = product.sizes.length > 0 ? product.sizes[0] : undefined;
    const defaultColor = product.colors.length > 0 ? product.colors[0].name : undefined;
    
    const whatsappUrl = getWhatsAppOrderUrl({
      product,
      selectedSize: defaultSize,
      selectedColor: defaultColor,
    });
    openWhatsApp(whatsappUrl);
  };

  const formattedPriceDisplay = product.price 
    ? `${BRAND_CONFIG.currencySymbol} ${product.price.toLocaleString()}` 
    : 'Price on Inquiry';

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onViewDetails(product)}
      className="group relative flex flex-col justify-between glass-card rounded-2xl p-3 sm:p-4 border border-white/60 hover:border-[#BFA36D]/60 shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      {/* Product Image Frame */}
      <div className="relative w-full aspect-3/4 sm:aspect-4/5 rounded-xl overflow-hidden bg-[#F3EFE9] mb-3 sm:mb-4 border border-white/40">
        <img
          src={imageError ? getSafeImageUrl(undefined, product.category) : safeImage}
          alt={product.name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-106"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.newArrival && (
            <span className="px-2 py-0.5 rounded-md bg-[#421C2D] text-white text-[10px] sm:text-[11px] font-sans font-medium tracking-wider uppercase shadow-xs">
              NEW
            </span>
          )}
          {product.featured && !product.newArrival && (
            <span className="px-2 py-0.5 rounded-md bg-[#BFA36D] text-[#331523] text-[10px] sm:text-[11px] font-sans font-semibold tracking-wider uppercase shadow-xs">
              FEATURED
            </span>
          )}
        </div>

        {/* SKU code tag top right */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="px-2 py-0.5 rounded-md glass-panel-subtle bg-white/80 backdrop-blur-xs text-[#526070] text-[9px] sm:text-[10px] font-mono tracking-tight border border-white/50">
            {product.sku}
          </span>
        </div>

        {/* Quick View Hover Overlay Button */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <button
            id={`quick-view-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="px-4 py-2 rounded-full glass-panel bg-white/95 text-[#421C2D] font-sans text-xs font-semibold tracking-wider uppercase shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 hover:bg-white"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>VIEW PRODUCT</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-grow justify-between">
        <div>
          {/* Category */}
          <span className="text-[10px] sm:text-[11px] font-sans tracking-[0.16em] uppercase text-[#BFA36D] font-semibold block mb-1">
            {product.categoryLabel}
          </span>

          {/* Title */}
          <h3 className="font-serif text-sm sm:text-base md:text-lg text-[#421C2D] font-normal leading-snug line-clamp-2 group-hover:text-[#2A111E] transition-colors">
            {product.name}
          </h3>

          {/* Available Colors Indicator */}
          {product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {product.colors.slice(0, 4).map((c, i) => (
                <span
                  key={i}
                  title={c.name}
                  className="w-2.5 h-2.5 rounded-full border border-black/15 shadow-2xs"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[10px] text-[#7A6B74]">+{product.colors.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {/* Price & Primary WhatsApp Order Button */}
        <div className="mt-3 pt-3 border-t border-[#EAE3D9]/70 flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="font-serif font-bold text-sm sm:text-base md:text-lg text-[#421C2D]">
              {formattedPriceDisplay}
            </span>
            {product.sizes.length > 0 && (
              <span className="text-[10px] text-[#7A6B74] font-sans">
                {product.sizes[0]}
              </span>
            )}
          </div>

          {/* Prominent ORDER ON WHATSAPP button */}
          <button
            id={`whatsapp-order-card-btn-${product.id}`}
            onClick={handleQuickWhatsApp}
            className="w-full py-2 sm:py-2.5 px-3 rounded-xl bg-[#BFA36D] hover:bg-[#A88D56] text-white text-[11px] sm:text-xs font-sans font-medium tracking-wide uppercase flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs transition-all focus:outline-hidden"
            title="Order directly on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current shrink-0" />
            <span className="truncate">ORDER ON WHATSAPP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
