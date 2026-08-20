import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Share2, Check, ShieldCheck, Sparkles, AlertCircle, Copy, Info } from 'lucide-react';
import { Product, BRAND_CONFIG } from '../types';
import { generateWhatsAppMessage, getWhatsAppOrderUrl, openWhatsApp } from '../utils/whatsapp';
import { api } from '../services/api';
import { getSafeImageUrl } from '../utils/imageStorage';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const defaultImage = product ? getSafeImageUrl(product.mainImage, product.category) : '';
  const [selectedImage, setSelectedImage] = useState<string>(defaultImage);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [showMessagePreview, setShowMessagePreview] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(getSafeImageUrl(product.mainImage, product.category));
      setSelectedSize(product.sizes.length > 0 ? product.sizes[0] : '');
      setSelectedColor(product.colors.length > 0 ? product.colors[0].name : '');
    }
  }, [product]);

  if (!product) return null;


  const rawImages = Array.from(new Set([product.mainImage, ...product.galleryImages]));
  const allImages = rawImages.map((img) => getSafeImageUrl(img, product.category)).filter(Boolean);

  const currentFormattedPrice = product.price 
    ? `${BRAND_CONFIG.currencySymbol} ${product.price.toLocaleString()}` 
    : 'Price on Inquiry';

  const orderParams = {
    product,
    selectedSize: selectedSize || undefined,
    selectedColor: selectedColor || undefined,
    customNote: customNote || undefined,
  };

  const whatsappMessage = generateWhatsAppMessage(orderParams);
  const whatsappUrl = getWhatsAppOrderUrl(orderParams);

  const handleOrderClick = () => {
    api.trackWhatsAppClick({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      price: product.price,
      selectedSize: selectedSize || undefined,
      selectedColor: selectedColor || undefined,
    });
    openWhatsApp(whatsappUrl);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div
      id="product-detail-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 lg:p-8 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="product-detail-modal-container"
        className="relative w-full max-w-5xl glass-panel bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/70 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          id="close-product-modal-button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-white/80 hover:bg-white text-[#421C2D] shadow-md border border-white/60 transition-all hover:scale-105 focus:outline-hidden"
          aria-label="Close product details"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] overflow-y-auto">
          {/* LEFT: Product Gallery */}
          <div className="lg:col-span-6 p-6 sm:p-8 bg-[#F5EFE6]/60 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/60">
            <div>
              {/* Main Image Stage */}
              <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-white shadow-sm border border-white/80">
                <img
                  src={imageErrorMap[selectedImage] ? getSafeImageUrl(undefined, product.category) : selectedImage}
                  alt={product.name}
                  onError={() => setImageErrorMap((prev) => ({ ...prev, [selectedImage]: true }))}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />
                {/* SKU pill */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-xs text-white text-[11px] font-mono">
                  {product.sku}
                </div>
              </div>

              {/* Thumbnail Selector */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2 scrollbar-none">
                  {allImages.map((imgUrl, idx) => {
                    const isSelected = selectedImage === imgUrl;
                    return (
                      <button
                        key={idx}
                        id={`gallery-thumb-${idx}`}
                        onClick={() => setSelectedImage(imgUrl)}
                        className={`relative w-16 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                          isSelected
                            ? 'border-[#421C2D] shadow-md scale-102'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={imageErrorMap[imgUrl] ? getSafeImageUrl(undefined, product.category) : imgUrl}
                          alt={`${product.name} angle ${idx + 1}`}
                          onError={() => setImageErrorMap((prev) => ({ ...prev, [imgUrl]: true }))}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Direct Assistance Badge */}
            <div className="mt-6 pt-4 border-t border-white/60 flex items-center justify-between text-xs text-[#7A6B74]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#BFA36D]" />
                <span>100% Authentic Pakistani Couture</span>
              </div>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 text-[#421C2D] hover:text-[#BFA36D] font-medium"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-[#BFA36D]" /> : <Share2 className="w-3.5 h-3.5 text-[#BFA36D]" />}
                <span>{isCopied ? 'Link Copied' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Product Information & WhatsApp Ordering System */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans tracking-[0.2em] uppercase text-[#BFA36D] font-semibold">
                  {product.categoryLabel}
                </span>
                <span className="text-[11px] font-sans font-semibold px-3 py-1 rounded-full bg-[#BFA36D]/15 text-[#421C2D] border border-[#BFA36D]/30">
                  ● Order on WhatsApp
                </span>
              </div>

              {/* Product Title */}
              <h2
                id="modal-product-title"
                className="font-serif text-2xl sm:text-3xl text-[#421C2D] font-normal mt-2 leading-snug"
              >
                {product.name}
              </h2>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-3">
                <span
                  id="modal-product-price"
                  className="font-serif text-2xl sm:text-3xl font-bold text-[#421C2D]"
                >
                  {currentFormattedPrice}
                </span>
                {product.price && (
                  <span className="text-xs text-[#7A6B74] font-sans">
                    (Direct Order via WhatsApp)
                  </span>
                )}
              </div>

              {/* Description */}
              <p
                id="modal-product-description"
                className="font-sans text-sm text-[#5A4B54] mt-4 leading-relaxed"
              >
                {product.description}
              </p>

              {/* Fabric & Technical Craftsmanship */}
              {product.fabricDetails && (
                <div className="mt-4 p-4 rounded-2xl glass-card bg-white/70 border border-white/70 text-xs font-sans text-[#5A4B54] shadow-xs">
                  <span className="font-semibold text-[#421C2D] block mb-1">
                    Fabric &amp; Ensemble Details:
                  </span>
                  <p>{product.fabricDetails}</p>
                </div>
              )}

              {/* Available Sizes Selection */}
              {product.sizes.length > 0 && (
                <div className="mt-6">
                  <label className="block text-xs font-sans font-semibold tracking-wider uppercase text-[#421C2D] mb-2.5">
                    Select Size / Option:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz) => {
                      const isSelected = selectedSize === sz;
                      return (
                        <button
                          key={sz}
                          id={`size-option-${sz}`}
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-sans tracking-wide transition-all ${
                            isSelected
                              ? 'bg-[#421C2D] text-white font-semibold shadow-xs'
                              : 'bg-white/70 text-[#5A4B54] border border-white/60 hover:bg-white'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available Colors Selection */}
              {product.colors.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-sans font-semibold tracking-wider uppercase text-[#421C2D]">
                      Selected Color: <span className="font-normal text-[#7A6B74]">{selectedColor}</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((c) => {
                      const isSelected = selectedColor === c.name;
                      return (
                        <button
                          key={c.name}
                          id={`color-option-${c.name}`}
                          onClick={() => setSelectedColor(c.name)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-sans border transition-all ${
                            isSelected
                              ? 'border-[#421C2D] bg-white shadow-xs font-semibold text-[#421C2D]'
                              : 'border-white/60 bg-white/70 text-[#5A4B54] hover:bg-white'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Optional Custom Note / Sizing Request */}
              <div className="mt-5">
                <label className="block text-xs font-sans text-[#7A6B74] mb-1.5">
                  Special Request or Question (Optional):
                </label>
                <input
                  type="text"
                  id="custom-order-note-input"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Need urgent delivery, unstitched fabric query, etc."
                  className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl bg-white/70 border border-[#DDD5C8] text-[#2A2A2A] placeholder-[#A0AEC0] focus:outline-hidden focus:border-[#BFA36D] focus:ring-1 focus:ring-[#BFA36D]"
                />
              </div>
            </div>

            {/* ORDER ON WHATSAPP - PRIMARY ORDERING SECTION */}
            <div className="pt-5 border-t border-white/60 space-y-3">
              {/* Main Prominent WhatsApp Order Button */}
              <button
                id="modal-order-on-whatsapp-cta"
                onClick={handleOrderClick}
                className="w-full py-4 px-6 rounded-2xl bg-[#BFA36D] hover:bg-[#A88D56] text-[#24101A] font-sans text-sm sm:text-base font-bold tracking-wider uppercase flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.01] focus:outline-hidden group"
              >
                <MessageCircle className="w-5 h-5 fill-current shrink-0" />
                <span>ORDER ON WHATSAPP</span>
              </button>

              {/* Live WhatsApp Message Preview Toggle */}
              <div className="pt-1">
                <button
                  id="toggle-whatsapp-preview-button"
                  onClick={() => setShowMessagePreview(!showMessagePreview)}
                  className="w-full flex items-center justify-between text-[11px] font-sans text-[#7A6B74] hover:text-[#421C2D] transition-colors py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>{showMessagePreview ? 'Hide Pre-filled WhatsApp Message' : 'Preview Pre-filled WhatsApp Message'}</span>
                  </span>
                  <span>{showMessagePreview ? '▲' : '▼'}</span>
                </button>

                {showMessagePreview && (
                  <div className="mt-2 p-3 rounded-xl bg-white/80 border border-white/70 font-mono text-[11px] text-[#421C2D] whitespace-pre-wrap select-all">
                    {whatsappMessage}
                  </div>
                )}
              </div>

              {/* Direct Support & Fallback */}
              <div className="text-center text-[11px] text-[#7A6B74] font-sans pt-1">
                <span>Official Contact: </span>
                <span className="font-semibold text-[#421C2D]">{BRAND_CONFIG.whatsappNumber}</span>
                <span className="mx-1.5">•</span>
                <span>{BRAND_CONFIG.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
