import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Star, 
  Sparkles, 
  Check, 
  Plus, 
  X, 
  Eye, 
  HelpCircle, 
  MoveLeft, 
  MoveRight, 
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, Category, ProductColor, ProductAvailability, ProductStatus, AdminRoute } from '../../types';

interface AdminProductEditorProps {
  productId?: string; // If provided, edit mode. Otherwise, create mode.
  onNavigate: (route: AdminRoute) => void;
  onPreviewProduct: (product: Product) => void;
}

export function AdminProductEditor({ productId, onNavigate, onPreviewProduct }: AdminProductEditorProps) {
  const isEditMode = Boolean(productId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('suits');
  const [price, setPrice] = useState<string>('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [fabricDetails, setFabricDetails] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [availability, setAvailability] = useState<ProductAvailability>('in_stock');
  const [status, setStatus] = useState<ProductStatus>('published');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);

  // Quick category creation state
  const [categories, setCategories] = useState<Category[]>([]);
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Sizing & Color custom adders
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#421C2D');

  // Loading & Feedback
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Available common quick tags
  const COMMON_SIZES = ['XS', 'Small', 'Medium', 'Large', 'XL', 'XXL', 'Unstitched 3-Piece', 'Standard One Size'];
  const COMMON_COLORS = [
    { name: 'Deep Plum', hex: '#421C2D' },
    { name: 'Champagne Gold', hex: '#BFA36D' },
    { name: 'Ivory Cream', hex: '#FAF7F0' },
    { name: 'Onyx Black', hex: '#1A1A1A' },
    { name: 'Emerald Green', hex: '#164E3D' },
    { name: 'Imperial Maroon', hex: '#581825' },
    { name: 'Dusty Rose', hex: '#D2A2A2' },
  ];

  // Load initial product data & categories
  useEffect(() => {
    const init = async () => {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
        if (cats.length > 0 && !category) {
          setCategory(cats[0].slug);
        }

        if (productId) {
          setIsLoadingProduct(true);
          const prod = await api.getProduct(productId);
          if (prod) {
            setName(prod.name || '');
            setSku(prod.sku || '');
            setCategory(prod.category || 'suits');
            setPrice(prod.price ? prod.price.toString() : '');
            setShortDescription(prod.shortDescription || '');
            setDescription(prod.description || '');
            setFabricDetails(prod.fabricDetails || '');
            setMainImage(prod.mainImage || '');
            setGalleryImages(prod.galleryImages || (prod.mainImage ? [prod.mainImage] : []));
            setSizes(prod.sizes || []);
            setColors(prod.colors || []);
            setAvailability(prod.availability || (prod.inStock ? 'in_stock' : 'out_of_stock'));
            setStatus(prod.status || (prod.isPublished ? 'published' : 'draft'));
            setIsFeatured(prod.isFeatured ?? prod.featured ?? false);
            setIsNewArrival(prod.isNewArrival ?? prod.newArrival ?? false);
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to load editor data');
      } finally {
        setIsLoadingProduct(false);
      }
    };
    init();
  }, [productId]);

  // Handle Quick Category Create
  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const created = await api.createCategory({
        name: newCatName.trim(),
        tagline: `${newCatName.trim()} collection`,
      });
      setCategories((prev) => [...prev, created]);
      setCategory(created.slug);
      setNewCatName('');
      setShowNewCatInput(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create category');
    }
  };

  // Handle Image Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgressText(`Uploading ${files.length} original image(s)...`);
    setErrorMessage('');

    try {
      const fileArray: File[] = Array.from(files) as File[];
      const res = await api.uploadImages(fileArray);

      if (res.urls && res.urls.length > 0) {
        const newImages = [...galleryImages, ...res.urls];
        setGalleryImages(newImages);

        // If no main image is set yet, set the first uploaded one as main
        if (!mainImage) {
          setMainImage(res.urls[0]);
        }
        setSuccessMessage(`Successfully uploaded ${res.urls.length} original image(s).`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Image upload failed. Please ensure files are valid JPG, PNG, or WebP.');
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetMainImage = (url: string) => {
    setMainImage(url);
    // Ensure main image is in gallery
    if (!galleryImages.includes(url)) {
      setGalleryImages([url, ...galleryImages]);
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    const updated = galleryImages.filter((img) => img !== urlToRemove);
    setGalleryImages(updated);
    if (mainImage === urlToRemove) {
      setMainImage(updated[0] || '');
    }
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= galleryImages.length) return;

    const updated = [...galleryImages];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setGalleryImages(updated);
  };

  // Size helper
  const handleToggleSize = (sz: string) => {
    if (sizes.includes(sz)) {
      setSizes(sizes.filter((s) => s !== sz));
    } else {
      setSizes([...sizes, sz]);
    }
  };

  const handleAddCustomSize = () => {
    if (!customSizeInput.trim()) return;
    if (!sizes.includes(customSizeInput.trim())) {
      setSizes([...sizes, customSizeInput.trim()]);
    }
    setCustomSizeInput('');
  };

  // Color helper
  const handleToggleColor = (col: ProductColor) => {
    const exists = colors.some((c) => c.name.toLowerCase() === col.name.toLowerCase());
    if (exists) {
      setColors(colors.filter((c) => c.name.toLowerCase() !== col.name.toLowerCase()));
    } else {
      setColors([...colors, col]);
    }
  };

  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return;
    const exists = colors.some((c) => c.name.toLowerCase() === customColorName.trim().toLowerCase());
    if (!exists) {
      setColors([...colors, { name: customColorName.trim(), hex: customColorHex }]);
    }
    setCustomColorName('');
  };

  // Build current product payload
  const buildProductData = (overrideStatus?: ProductStatus): Partial<Product> => {
    const catObj = categories.find((c) => c.slug === category);
    const numPrice = price.trim() ? parseFloat(price.replace(/[^0-9.]/g, '')) : undefined;

    const finalStatus = overrideStatus || status;
    const isPub = finalStatus === 'published';
    const inStock = availability === 'in_stock';

    // Gallery images: ensure main image is at the very beginning
    let finalGallery = [...galleryImages];
    if (mainImage && !finalGallery.includes(mainImage)) {
      finalGallery.unshift(mainImage);
    }

    return {
      name: name.trim(),
      sku: sku.trim() || `MTC-${Date.now().toString().slice(-4)}`,
      category,
      categoryLabel: catObj ? catObj.name : 'Suits',
      price: numPrice,
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      fabricDetails: fabricDetails.trim(),
      mainImage: mainImage || finalGallery[0] || '',
      galleryImages: finalGallery,
      sizes,
      colors,
      availability,
      inStock,
      status: finalStatus,
      isPublished: isPub,
      featured: isFeatured,
      isFeatured,
      newArrival: isNewArrival,
      isNewArrival,
    };
  };

  // Form Validation
  const validateForm = (forPublishing: boolean): boolean => {
    if (!name.trim()) {
      setErrorMessage('Product Name is required.');
      return false;
    }
    if (!category) {
      setErrorMessage('Please select a Category.');
      return false;
    }
    if (forPublishing && !mainImage && galleryImages.length === 0) {
      setErrorMessage('Please upload at least one original product image before publishing.');
      return false;
    }
    return true;
  };

  // Save product handler
  const handleSave = async (targetStatus: ProductStatus) => {
    const forPublish = targetStatus === 'published';
    if (!validateForm(forPublish)) return;

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = buildProductData(targetStatus);
      let savedProduct: Product;
      if (isEditMode && productId) {
        savedProduct = await api.updateProduct(productId, payload);
        setSuccessMessage(forPublish ? 'Product published successfully.' : 'Product updated successfully.');
      } else {
        savedProduct = await api.createProduct(payload);
        setSuccessMessage(forPublish ? 'Product published successfully.' : 'Product saved as draft.');
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mtc-catalog-updated', { detail: { productId: savedProduct.id } }));
      }

      setTimeout(() => {
        onNavigate('products');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(
        forPublish
          ? `Product could not be published: ${err.message || 'Database error occurred'}`
          : `Failed to save product: ${err.message || 'Database error occurred'}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Live Preview Trigger
  const handleTriggerPreview = () => {
    if (!name.trim()) {
      setErrorMessage('Please enter a Product Name first to preview.');
      return;
    }
    const previewData = buildProductData() as Product;
    previewData.id = productId || 'preview-temp-id';
    previewData.formattedPrice = previewData.price ? `Rs. ${previewData.price.toLocaleString()}` : 'Price on Inquiry';
    onPreviewProduct(previewData);
  };

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-[#421C2D]/30 border-t-[#421C2D] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#EBE3D5]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('products')}
            className="p-2 rounded-xl bg-white border border-[#E5DDD0] text-[#7A6B74] hover:text-[#421C2D] hover:bg-[#FAF8F5] transition-colors"
            title="Back to products list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-serif text-2xl text-[#421C2D] font-normal">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="font-sans text-xs text-[#7A6B74]">
              {isEditMode ? `Updating SKU: ${sku || 'Custom'}` : 'Upload authentic original photos and publish to catalog'}
            </p>
          </div>
        </div>

        {/* Action Buttons Top */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleTriggerPreview}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#421C2D] border border-[#E5DDD0] text-xs font-sans font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-[#BFA36D]" />
            <span>PREVIEW</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('draft')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#7A6B74] hover:text-[#421C2D] border border-[#E5DDD0] text-xs font-sans font-semibold tracking-wider uppercase transition-all"
          >
            SAVE DRAFT
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('published')}
            className="px-5 py-2.5 rounded-xl bg-[#421C2D] hover:bg-[#301420] text-white text-xs font-sans font-bold tracking-wider uppercase transition-all shadow-md flex items-center gap-2"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#BFA36D]" />
                <span>{isEditMode ? 'SAVE & PUBLISH' : 'PUBLISH PRODUCT'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-sans flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans flex items-start gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Main Details & Images (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION 1: Basic Information */}
          <div className="p-6 rounded-2xl bg-white border border-[#EBE3D5] shadow-xs space-y-4">
            <h3 className="font-serif text-lg text-[#421C2D] font-semibold border-b border-[#F0EAE1] pb-3">
              1. General Information
            </h3>

            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#421C2D]">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Noor-e-Zarin Embroidered Chiffon 3-Piece Suit"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-sm font-sans text-[#24101A] placeholder-[#9A8C94] focus:outline-hidden focus:border-[#421C2D]"
              />
            </div>

            {/* Category & SKU Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Category */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#421C2D]">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewCatInput(!showNewCatInput)}
                    className="text-[11px] font-sans font-semibold text-[#BFA36D] hover:text-[#A88D56]"
                  >
                    + Add New Category
                  </button>
                </div>

                {showNewCatInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="New category name"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF8F5] border border-[#E5DDD0]"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="px-3 py-2 rounded-xl bg-[#421C2D] text-white text-xs font-semibold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewCatInput(false)}
                      className="p-2 text-[#7A6B74]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs font-sans text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* SKU */}
              <div className="space-y-1.5">
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#421C2D]">
                  Product Code / SKU <span className="text-[10px] font-normal text-[#7A6B74]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. MTC-ST-101"
                  className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs font-sans text-[#24101A] placeholder-[#9A8C94] focus:outline-hidden focus:border-[#421C2D]"
                />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#421C2D]">
                Price (PKR) <span className="text-[10px] font-normal text-[#7A6B74]">(Leave empty for "Price on Inquiry")</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif text-xs font-bold text-[#7A6B74]">
                  Rs.
                </span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 18500"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-sm font-sans text-[#24101A] placeholder-[#9A8C94] focus:outline-hidden focus:border-[#421C2D]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Original Product Images (ABSOLUTE PRIORITY) */}
          <div className="p-6 rounded-2xl bg-white border border-[#EBE3D5] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#F0EAE1] pb-3">
              <div>
                <h3 className="font-serif text-lg text-[#421C2D] font-semibold flex items-center gap-2">
                  <span>2. Product Images</span>
                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-[#BFA36D]/20 text-[#421C2D]">
                    Original Photos
                  </span>
                </h3>
                <p className="font-sans text-xs text-[#7A6B74]">
                  Upload genuine product photos. The exact image uploaded is safely preserved and displayed.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-[#421C2D] hover:bg-[#301420] text-white text-xs font-sans font-bold tracking-wider uppercase transition-all flex items-center gap-2 shadow-xs"
              >
                <Upload className="w-4 h-4 text-[#BFA36D]" />
                <span>{isUploading ? 'Uploading...' : 'Upload Images'}</span>
              </button>
            </div>

            {/* Upload Progress feedback */}
            {uploadProgressText && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-sans flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                <span>{uploadProgressText}</span>
              </div>
            )}

            {/* Gallery Images Strip */}
            {galleryImages.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {galleryImages.map((imgUrl, idx) => {
                    const isMain = imgUrl === mainImage || (!mainImage && idx === 0);
                    return (
                      <div
                        key={idx}
                        className={`relative rounded-2xl overflow-hidden bg-[#FAF8F5] border-2 transition-all group ${
                          isMain ? 'border-[#421C2D] shadow-md ring-2 ring-[#BFA36D]/40' : 'border-[#E5DDD0]'
                        }`}
                      >
                        <div className="aspect-3/4 w-full overflow-hidden bg-[#F0EAE1]">
                          <img
                            src={imgUrl}
                            alt={`Gallery ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Badges / Main Indicator */}
                        {isMain && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#421C2D] text-white text-[9px] font-sans font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-[#BFA36D] text-[#BFA36D]" />
                            <span>MAIN IMAGE</span>
                          </span>
                        )}

                        {/* Hover Overlay Controls */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(imgUrl)}
                              className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                              title="Delete photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            {!isMain && (
                              <button
                                type="button"
                                onClick={() => handleSetMainImage(imgUrl)}
                                className="w-full py-1.5 px-2 rounded-lg bg-[#BFA36D] hover:bg-[#A88D56] text-[#24101A] text-[10px] font-sans font-bold uppercase tracking-wider transition-colors shadow-xs"
                              >
                                Set as Main
                              </button>
                            )}

                            <div className="flex justify-between gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveImage(idx, 'left')}
                                className="p-1 rounded-md bg-white/80 text-[#24101A] hover:bg-white disabled:opacity-30"
                                title="Move Left"
                              >
                                <MoveLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === galleryImages.length - 1}
                                onClick={() => handleMoveImage(idx, 'right')}
                                className="p-1 rounded-md bg-white/80 text-[#24101A] hover:bg-white disabled:opacity-30"
                                title="Move Right"
                              >
                                <MoveRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] font-sans text-[#7A6B74] pt-1">
                  Tip: The Main Image will be showcased on product cards, category catalogs, and header previews.
                </p>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-[#DDD5C8] hover:border-[#421C2D] bg-[#FAF8F5] cursor-pointer transition-colors space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5DDD0] text-[#BFA36D] flex items-center justify-center mx-auto shadow-xs">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-serif text-base text-[#421C2D] font-medium">
                    Upload Authentic Product Images
                  </p>
                  <p className="font-sans text-xs text-[#7A6B74] mt-1">
                    Drag and drop or click to upload JPG, PNG, or WebP files.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Descriptions & Technical Fabric */}
          <div className="p-6 rounded-2xl bg-white border border-[#EBE3D5] shadow-xs space-y-4">
            <h3 className="font-serif text-lg text-[#421C2D] font-semibold border-b border-[#F0EAE1] pb-3">
              3. Description &amp; Craftsmanship
            </h3>

            {/* Short Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#421C2D]">
                Short Description <span className="text-[10px] font-normal text-[#7A6B74]">(Used in search and card summaries)</span>
              </label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief summary of the garment or accessory..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs font-sans text-[#24101A] placeholder-[#9A8C94] focus:outline-hidden focus:border-[#421C2D]"
              />
            </div>

            {/* Full Rich Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#421C2D]">
                  Full Description
                </label>
                <div className="flex gap-1.5 text-[10px] font-sans text-[#7A6B74]">
                  <span>Supports paragraphs &amp; bullet points</span>
                </div>
              </div>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter detailed description of the silhouette, motifs, cut, and occasion styling..."
                className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs font-sans text-[#24101A] placeholder-[#9A8C94] focus:outline-hidden focus:border-[#421C2D] leading-relaxed"
              />
            </div>

            {/* Fabric & Technical Details */}
            <div className="space-y-1.5">
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#421C2D]">
                Fabric &amp; Ensemble Details
              </label>
              <input
                type="text"
                value={fabricDetails}
                onChange={(e) => setFabricDetails(e.target.value)}
                placeholder="e.g. Pure Chiffon Shirt with Resham Work, Organza Dupatta, Raw Silk Trouser"
                className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs font-sans text-[#24101A] placeholder-[#9A8C94] focus:outline-hidden focus:border-[#421C2D]"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Options, Visibility, Sizing & Colors (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status & Visibility */}
          <div className="p-6 rounded-2xl bg-white border border-[#EBE3D5] shadow-xs space-y-4">
            <h3 className="font-serif text-base text-[#421C2D] font-semibold border-b border-[#F0EAE1] pb-2.5">
              Product Status &amp; Visibility
            </h3>

            {/* Publication Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#421C2D]">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs font-sans text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
              >
                <option value="published">Published (Visible on store)</option>
                <option value="draft">Draft (Saved privately)</option>
                <option value="archived">Archived (Hidden from catalog)</option>
              </select>
            </div>

            {/* Stock Availability */}
            <div className="space-y-1.5">
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#421C2D]">
                Availability
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as ProductAvailability)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs font-sans text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
              >
                <option value="in_stock">In Stock (Ordering enabled)</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="coming_soon">Coming Soon</option>
              </select>
            </div>

            {/* Toggles: New Arrival & Featured */}
            <div className="space-y-3 pt-2 border-t border-[#F0EAE1]">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="font-sans text-xs font-bold text-[#421C2D] block">
                    Mark as New Arrival
                  </span>
                  <span className="text-[11px] text-[#7A6B74]">
                    Displays "NEW" badge &amp; in New Arrivals
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="w-4 h-4 accent-[#421C2D] rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="font-sans text-xs font-bold text-[#421C2D] block">
                    Mark as Featured
                  </span>
                  <span className="text-[11px] text-[#7A6B74]">
                    Showcases on homepage carousel
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[#421C2D] rounded"
                />
              </label>
            </div>
          </div>

          {/* SIZES / VARIANTS */}
          <div className="p-6 rounded-2xl bg-white border border-[#EBE3D5] shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-[#F0EAE1] pb-2.5">
              <h3 className="font-serif text-base text-[#421C2D] font-semibold">
                Available Sizes
              </h3>
              <span className="text-[10px] text-[#7A6B74]">
                {sizes.length > 0 ? `${sizes.length} selected` : 'Auto-hidden if empty'}
              </span>
            </div>

            {/* Preset chips */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SIZES.map((sz) => {
                const isSel = sizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleToggleSize(sz)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-sans transition-all ${
                      isSel
                        ? 'bg-[#421C2D] text-white font-semibold shadow-xs'
                        : 'bg-[#FAF8F5] text-[#5A4B54] border border-[#E5DDD0] hover:bg-[#F0EAE1]'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>

            {/* Custom size input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                placeholder="Custom size (e.g. 38 Bust)"
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#FAF8F5] border border-[#E5DDD0]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSize();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomSize}
                className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs font-semibold text-[#421C2D] hover:bg-[#EAE3D9]"
              >
                + Add
              </button>
            </div>
          </div>

          {/* COLORS / VARIANTS */}
          <div className="p-6 rounded-2xl bg-white border border-[#EBE3D5] shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-[#F0EAE1] pb-2.5">
              <h3 className="font-serif text-base text-[#421C2D] font-semibold">
                Available Colors
              </h3>
              <span className="text-[10px] text-[#7A6B74]">
                {colors.length > 0 ? `${colors.length} selected` : 'Auto-hidden if empty'}
              </span>
            </div>

            {/* Preset Color Badges */}
            <div className="flex flex-wrap gap-2">
              {COMMON_COLORS.map((col) => {
                const isSel = colors.some((c) => c.name.toLowerCase() === col.name.toLowerCase());
                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => handleToggleColor(col)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-sans border transition-all ${
                      isSel
                        ? 'border-[#421C2D] bg-[#421C2D]/5 font-semibold text-[#421C2D]'
                        : 'border-[#E5DDD0] bg-[#FAF8F5] text-[#5A4B54] hover:bg-[#F0EAE1]'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span>{col.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Creator */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="color"
                value={customColorHex}
                onChange={(e) => setCustomColorHex(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-[#E5DDD0] p-0 shrink-0"
                title="Choose color hex"
              />
              <input
                type="text"
                value={customColorName}
                onChange={(e) => setCustomColorName(e.target.value)}
                placeholder="Color name (e.g. Midnight Blue)"
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#FAF8F5] border border-[#E5DDD0]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomColor();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomColor}
                className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs font-semibold text-[#421C2D] hover:bg-[#EAE3D9] shrink-0"
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
