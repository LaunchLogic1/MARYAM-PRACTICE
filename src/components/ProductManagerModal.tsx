import React, { useState } from 'react';
import { X, Plus, Trash2, Edit3, Check, Sparkles, RefreshCw } from 'lucide-react';
import { Product } from '../types';

interface ProductManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onResetToDefault: () => void;
}

export const ProductManagerModal: React.FC<ProductManagerModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onResetToDefault,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Product['category']>('suits');
  const [price, setPrice] = useState<string>('18500');
  const [hasPrice, setHasPrice] = useState(true);
  const [description, setDescription] = useState('');
  const [fabricDetails, setFabricDetails] = useState('');
  const [mainImage, setMainImage] = useState('https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop');
  const [galleryImages, setGalleryImages] = useState('');
  const [sizes, setSizes] = useState('Small, Medium, Large, Unstitched');
  const [colors, setColors] = useState('Plum (#3B182E), Gold (#CDB180), Ivory (#FAF6EE)');
  const [sku, setSku] = useState(`MTC-${Date.now().toString().slice(-4)}`);
  const [featured, setFeatured] = useState(true);
  const [newArrival, setNewArrival] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedSizes = sizes.split(',').map((s) => s.trim()).filter(Boolean);
    const parsedColors = colors.split(',').map((c) => {
      const match = c.match(/(.*?)\((.*?)\)/);
      if (match) {
        return { name: match[1].trim(), hex: match[2].trim() };
      }
      return { name: c.trim(), hex: '#142C44' };
    });

    const parsedGallery = galleryImages
      .split('\n')
      .map((url) => url.trim())
      .filter(Boolean);

    const categoryLabels: Record<Product['category'], string> = {
      'suits': 'Luxury Suits',
      'handbags': 'Luxury Handbags',
      'accessories': 'Accessories',
      'new-arrivals': 'New Arrivals',
      'womens-collection': "Women's Collection",
    };

    const newProd: Product = {
      id: `mtc-custom-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      categoryLabel: categoryLabels[category],
      price: hasPrice && price ? Number(price) : undefined,
      description,
      fabricDetails: fabricDetails || undefined,
      mainImage,
      galleryImages: parsedGallery.length > 0 ? parsedGallery : [mainImage],
      sizes: parsedSizes,
      colors: parsedColors,
      sku,
      featured,
      newArrival,
      inStock: true,
      whatsappNumber: whatsappNumber || undefined,
    };

    onAddProduct(newProd);
    onClose();
  };

  return (
    <div
      id="product-manager-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E8E1D5] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E8E1D5] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#A68860] font-semibold">
              Catalog Administration
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-[#142C44]">
              Add New Product to Catalog
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#4A5568] hover:bg-[#EAE3D9]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto font-sans text-xs">
          <div>
            <label className="block font-semibold uppercase text-[#142C44] mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Royal Embroidered Organza Gown"
              className="w-full p-2.5 rounded-xl border border-[#D5CABE] focus:outline-hidden focus:border-[#C5A880]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-[#142C44] mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Product['category'])}
                className="w-full p-2.5 rounded-xl border border-[#D5CABE] focus:outline-hidden"
              >
                <option value="suits">Suits (Luxury Formals)</option>
                <option value="handbags">Handbags</option>
                <option value="accessories">Accessories</option>
                <option value="womens-collection">Women's Collection</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase text-[#142C44] mb-1">
                Product Code / SKU *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#D5CABE]"
              />
            </div>
          </div>

          {/* Price & Toggle */}
          <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E1D5] space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold uppercase text-[#142C44]">Price Settings</label>
              <label className="flex items-center gap-2 cursor-pointer text-[#4A5568]">
                <input
                  type="checkbox"
                  checked={hasPrice}
                  onChange={(e) => setHasPrice(e.target.checked)}
                  className="rounded-sm text-[#142C44]"
                />
                <span>Show Price (Uncheck for Price on Inquiry)</span>
              </label>
            </div>
            {hasPrice && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#142C44]">Rs.</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price in PKR"
                  className="w-full p-2 rounded-lg border border-[#D5CABE]"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold uppercase text-[#142C44] mb-1">
              Description *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe embroidery, cut, silhouette, and festive details..."
              className="w-full p-2.5 rounded-xl border border-[#D5CABE]"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-[#142C44] mb-1">
              Fabric / Ensemble Details
            </label>
            <input
              type="text"
              value={fabricDetails}
              onChange={(e) => setFabricDetails(e.target.value)}
              placeholder="e.g. Pure Chiffon Shirt with Resham Work, Raw Silk Trouser"
              className="w-full p-2.5 rounded-xl border border-[#D5CABE]"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-[#142C44] mb-1">
              Main Image URL *
            </label>
            <input
              type="url"
              required
              value={mainImage}
              onChange={(e) => setMainImage(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#D5CABE]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-[#142C44] mb-1">
                Available Sizes (comma separated)
              </label>
              <input
                type="text"
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#D5CABE]"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-[#142C44] mb-1">
                Colors (Name (#Hex))
              </label>
              <input
                type="text"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#D5CABE]"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newArrival}
                onChange={(e) => setNewArrival(e.target.checked)}
                className="rounded-sm text-[#142C44]"
              />
              <span>Mark as New Arrival</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded-sm text-[#142C44]"
              />
              <span>Mark as Featured</span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-[#E8E1D5] flex items-center justify-between">
            <button
              type="button"
              onClick={onResetToDefault}
              className="px-4 py-2.5 rounded-xl text-[#8C2C2C] hover:bg-[#FBEAEA] flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Default Catalog</span>
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#142C44] hover:bg-[#0E2033] text-white font-semibold uppercase tracking-wider"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
