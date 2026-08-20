import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown, 
  Upload, 
  Check, 
  X, 
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../../services/api';
import { Category, AdminRoute } from '../../types';

interface AdminCategoriesViewProps {
  onNavigate: (route: AdminRoute) => void;
}

export function AdminCategoriesView({ onNavigate }: AdminCategoriesViewProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formImage, setFormImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [mediaList, setMediaList] = useState<{ id: string; url: string; originalName?: string }[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadMedia = async () => {
    try {
      const media = await api.getMedia();
      setMediaList(media || []);
    } catch {
      // media fetch optional
    }
  };

  useEffect(() => {
    loadCategories();
    loadMedia();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleStartCreate = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormTagline('');
    setFormImage('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop');
    setIsCreatingNew(true);
    setShowMediaPicker(false);
  };

  const handleStartEdit = (cat: Category) => {
    setIsCreatingNew(false);
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormTagline(cat.tagline || cat.description || '');
    setFormImage(cat.image || '');
    setShowMediaPicker(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const res = await api.uploadImages([files[0]]);
      if (res.urls && res.urls[0]) {
        const uploadedUrl = res.urls[0];
        setFormImage(uploadedUrl);
        showSuccess('Category cover image uploaded successfully');
        loadMedia();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload category image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMessage('Category name is required');
      return;
    }

    try {
      const finalImage = formImage.trim() || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop';
      const payload: Partial<Category> = {
        name: formName.trim(),
        slug: formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tagline: formTagline.trim(),
        description: formTagline.trim(),
        image: finalImage,
      };

      let savedCategory: Category | null = null;
      if (isCreatingNew) {
        savedCategory = await api.createCategory(payload);
        showSuccess(`Category "${formName}" created successfully.`);
      } else if (editingCategory) {
        savedCategory = await api.updateCategory(editingCategory.id, payload);
        showSuccess(`Category "${formName}" updated successfully with new cover image.`);
      }

      if (savedCategory) {
        setCategories((prev) => {
          const index = prev.findIndex((c) => c.id === savedCategory!.id || c.slug === savedCategory!.slug);
          if (index !== -1) {
            const next = [...prev];
            next[index] = { ...next[index], ...savedCategory };
            return next;
          }
          return [...prev, savedCategory!];
        });
      }

      setIsCreatingNew(false);
      setEditingCategory(null);
      setShowMediaPicker(false);
      await loadCategories();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (cat.itemCount && cat.itemCount > 0) {
      alert(`Cannot delete category "${cat.name}" because it currently contains ${cat.itemCount} products. Please reassign or delete the products first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    try {
      await api.deleteCategory(cat.id);
      showSuccess(`Category "${cat.name}" deleted.`);
      loadCategories();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete category');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const newCats = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCats.length) return;

    const temp = newCats[index];
    newCats[index] = newCats[targetIndex];
    newCats[targetIndex] = temp;

    setCategories(newCats);
    try {
      await api.reorderCategories(newCats.map((c) => c.id));
    } catch (err) {
      console.error('Failed to update category order', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#421C2D] font-normal">
            Category Collections
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#7A6B74]">
            Organize suits, unstitched fabrics, and formal couture collections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsReordering(!isReordering)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-sans font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
              isReordering
                ? 'bg-[#421C2D] text-white border-[#421C2D]'
                : 'bg-white text-[#421C2D] border-[#E5DDD0] hover:bg-[#FAF8F5]'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>{isReordering ? 'DONE REORDERING' : 'REORDER CATEGORIES'}</span>
          </button>

          <button
            onClick={handleStartCreate}
            className="px-5 py-2.5 rounded-xl bg-[#421C2D] hover:bg-[#301420] text-white text-xs font-sans font-bold tracking-wider uppercase transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#BFA36D]" />
            <span>ADD CATEGORY</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-sans flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#421C2D]/30 border-t-[#421C2D] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-[#EBE3D5] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Category Image Header */}
              <div className="h-44 w-full relative overflow-hidden bg-[#F0EAE1]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-3.5 left-4 right-4 text-white">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#BFA36D] block">
                    {cat.itemCount || 0} Products
                  </span>
                  <h3 className="font-serif text-lg font-normal leading-tight text-white">
                    {cat.name}
                  </h3>
                </div>

                {isReordering && (
                  <div className="absolute top-3 right-3 flex flex-col gap-1 z-10 bg-white/90 backdrop-blur-xs p-1 rounded-xl shadow-md">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveOrder(idx, 'up')}
                      className="p-1 rounded-lg hover:bg-[#F0EAE1] disabled:opacity-30 text-[#421C2D]"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === categories.length - 1}
                      onClick={() => handleMoveOrder(idx, 'down')}
                      className="p-1 rounded-lg hover:bg-[#F0EAE1] disabled:opacity-30 text-[#421C2D]"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <p className="font-sans text-xs text-[#7A6B74] line-clamp-2">
                  {cat.tagline || cat.description || 'Curated luxury Pakistani fashion ensembles.'}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-[#F0EAE1]">
                  <span className="text-[11px] font-mono text-[#9A8C94]">
                    Slug: /{cat.slug}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 rounded-lg bg-white border border-[#E5DDD0] text-[#421C2D] hover:bg-[#FAF8F5]"
                      title="Edit Category"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 rounded-lg bg-white border border-[#E5DDD0] text-rose-600 hover:bg-rose-50"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Edit / Create Modal */}
      {(isCreatingNew || editingCategory) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EBE3D5] space-y-5">
            <div className="flex justify-between items-center border-b border-[#F0EAE1] pb-3">
              <h3 className="font-serif text-xl text-[#421C2D]">
                {isCreatingNew ? 'Add New Category' : `Edit Category: ${editingCategory?.name}`}
              </h3>
              <button
                onClick={() => {
                  setIsCreatingNew(false);
                  setEditingCategory(null);
                }}
                className="p-1.5 rounded-lg text-[#7A6B74] hover:bg-[#FAF8F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#421C2D]">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (isCreatingNew) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Lawn & Chiffon Suits"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs font-sans text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#421C2D]">
                  Slug / URL Identifier
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. lawn-suits"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs font-sans text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#421C2D]">
                  Tagline / Description
                </label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="e.g. Pure breathable fabrics with intricate embroidery"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs font-sans text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
                />
              </div>

              {/* Image Uploader */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#421C2D]">
                    Category Cover Image <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {mediaList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowMediaPicker(!showMediaPicker)}
                        className="text-[11px] font-sans font-semibold text-[#421C2D] hover:text-[#BFA36D] flex items-center gap-1"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#BFA36D]" />
                        <span>{showMediaPicker ? 'Hide Library' : 'Choose from Media'}</span>
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="text-[11px] font-sans font-semibold text-[#BFA36D] hover:underline flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                    </button>
                  </div>
                </div>

                {/* Media Picker Grid if toggled */}
                {showMediaPicker && mediaList.length > 0 && (
                  <div className="p-3 bg-[#F7F2EA] rounded-2xl border border-[#E5DDD0] space-y-2 max-h-40 overflow-y-auto">
                    <span className="text-[10px] font-sans uppercase font-bold text-[#7A6B74] block">
                      Select an image from Media Library:
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {mediaList.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setFormImage(item.url);
                            setShowMediaPicker(false);
                          }}
                          className={`relative rounded-xl overflow-hidden h-14 border-2 transition-all ${
                            formImage === item.url ? 'border-[#421C2D] scale-95 shadow-xs' : 'border-transparent hover:opacity-80'
                          }`}
                        >
                          <img src={item.url} alt="Media" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="Paste direct Image URL (https://...) or upload an image above"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs font-sans text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
                />

                {formImage ? (
                  <div className="relative h-32 rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E5DDD0] mt-2 group shadow-xs">
                    <img 
                      src={formImage} 
                      alt="Cover Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-end p-3 pointer-events-none">
                      <span className="text-[11px] font-sans text-white font-medium bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md">
                        Cover Preview
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-20 rounded-xl border border-dashed border-[#D8CABE] flex items-center justify-center text-xs text-[#9A8C94] font-sans bg-[#FAF8F5]">
                    No cover image specified
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#F0EAE1]">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white border border-[#E5DDD0] text-xs font-sans font-semibold text-[#7A6B74]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#421C2D] text-white text-xs font-sans font-bold uppercase tracking-wider"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
