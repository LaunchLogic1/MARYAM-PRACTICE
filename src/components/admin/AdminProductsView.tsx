import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Copy, 
  Trash2, 
  Eye, 
  Sparkles, 
  Check, 
  X, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Layers
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, Category, AdminRoute } from '../../types';

interface AdminProductsViewProps {
  onNavigate: (route: AdminRoute, editProductId?: string) => void;
  onPreviewProduct: (product: Product) => void;
}

export function AdminProductsView({ onNavigate, onPreviewProduct }: AdminProductsViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedStock, setSelectedStock] = useState('all');
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');
  const [actionErrorMessage, setActionErrorMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        api.getProducts({ all: true }),
        api.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err: any) {
      setActionErrorMessage(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showSuccess = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(''), 4000);
  };

  const showError = (msg: string) => {
    setActionErrorMessage(msg);
    setTimeout(() => setActionErrorMessage(''), 5000);
  };

  const handleToggleStatus = async (product: Product) => {
    const isNowPub = product.status !== 'published' && !product.isPublished;
    try {
      const updated = await api.updateProduct(product.id, {
        status: isNowPub ? 'published' : 'draft',
        isPublished: isNowPub,
      });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      showSuccess(`Product "${product.name}" is now ${isNowPub ? 'Published' : 'Draft'}.`);
    } catch (err: any) {
      showError(err.message || 'Failed to update status');
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    const nextVal = !(product.isFeatured ?? product.featured);
    try {
      const updated = await api.updateProduct(product.id, {
        isFeatured: nextVal,
        featured: nextVal,
      });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      showSuccess(`Updated featured state for "${product.name}".`);
    } catch (err: any) {
      showError(err.message || 'Failed to update');
    }
  };

  const handleToggleNewArrival = async (product: Product) => {
    const nextVal = !(product.isNewArrival ?? product.newArrival);
    try {
      const updated = await api.updateProduct(product.id, {
        isNewArrival: nextVal,
        newArrival: nextVal,
      });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      showSuccess(`Updated new arrival state for "${product.name}".`);
    } catch (err: any) {
      showError(err.message || 'Failed to update');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await api.duplicateProduct(id);
      setProducts((prev) => [duplicated, ...prev]);
      showSuccess(`Product duplicated as draft: "${duplicated.name}".`);
    } catch (err: any) {
      showError(err.message || 'Failed to duplicate product');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.deleteProduct(id, true);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showSuccess(`Product "${name}" deleted.`);
    } catch (err: any) {
      showError(err.message || 'Failed to delete product');
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const newArr = [...products];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    setProducts(newArr);
    try {
      await api.reorderProducts(newArr.map((p) => p.id));
    } catch (err) {
      console.warn('Reorder sync error', err);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (selectedStatus === 'published' && p.status !== 'published' && !p.isPublished) return false;
    if (selectedStatus === 'draft' && (p.status === 'published' || p.isPublished)) return false;
    if (selectedStock === 'in_stock' && !p.inStock) return false;
    if (selectedStock === 'out_of_stock' && p.inStock) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#421C2D] font-normal">
            Products Catalog
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6B74]">
            Manage items, prices, specifications, photo galleries, and stock availability
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('products-new')}
            className="px-4 py-2.5 rounded-xl bg-[#421C2D] hover:bg-[#331523] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#BFA36D]" />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => setIsReorderMode(!isReorderMode)}
            className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              isReorderMode
                ? 'bg-[#BFA36D] text-[#24101A] border-[#BFA36D]'
                : 'bg-white text-[#421C2D] border-[#E5DDD0] hover:bg-[#FAF8F5]'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{isReorderMode ? 'Done Reordering' : 'Reorder'}</span>
          </button>

          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-white border border-[#E5DDD0] text-[#421C2D] hover:bg-[#FAF8F5] cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {actionErrorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionErrorMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl border border-[#EBE3D5] p-4 sm:p-5 space-y-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#A896A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products or SKU..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
            >
              <option value="all">All Stock States</option>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto pt-2">
          {filteredProducts.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-y border-[#EBE3D5] text-[#421C2D] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  {isReorderMode && <th className="py-3 px-3 text-center">Order</th>}
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Stock</th>
                  <th className="py-3 px-3">Flags</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE1]">
                {filteredProducts.map((p, index) => {
                  const isPub = p.status === 'published' || p.isPublished;
                  const isFeat = p.isFeatured ?? p.featured;
                  const isNew = p.isNewArrival ?? p.newArrival;

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      {isReorderMode && (
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => moveOrder(index, 'up')}
                              disabled={index === 0}
                              className="p-1 rounded hover:bg-[#E5DDD0] disabled:opacity-30"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moveOrder(index, 'down')}
                              disabled={index === products.length - 1}
                              className="p-1 rounded hover:bg-[#E5DDD0] disabled:opacity-30"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-[#E5DDD0] shrink-0">
                            {p.mainImage || (p.images && p.images[0]) ? (
                              <img
                                src={p.mainImage || p.images[0]}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#A896A0]">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="font-semibold text-[#421C2D] line-clamp-1">{p.name}</h4>
                            <span className="font-mono text-[11px] text-[#7A6B74]">
                              SKU: {p.sku || p.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E5DDD0] text-[11px] font-medium text-[#421C2D]">
                          {p.categoryLabel || p.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-[#421C2D]">
                        {p.formattedPrice || (p.price ? `Rs. ${p.price.toLocaleString()}` : '-')}
                      </td>

                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                            isPub
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isPub ? 'Published' : 'Draft'}
                        </button>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`text-[11px] font-medium ${
                            p.inStock ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleFeatured(p)}
                            title="Toggle Featured"
                            className={`px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer ${
                              isFeat ? 'bg-[#421C2D] text-[#BFA36D]' : 'bg-[#FAF8F5] text-[#A896A0]'
                            }`}
                          >
                            Feat
                          </button>
                          <button
                            onClick={() => handleToggleNewArrival(p)}
                            title="Toggle New Arrival"
                            className={`px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer ${
                              isNew ? 'bg-[#BFA36D] text-[#24101A]' : 'bg-[#FAF8F5] text-[#A896A0]'
                            }`}
                          >
                            New
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPreviewProduct(p)}
                            className="p-1.5 rounded-lg text-[#7A6B74] hover:text-[#421C2D] hover:bg-[#FAF8F5]"
                            title="Quick Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onNavigate('products-edit', p.id)}
                            className="p-1.5 rounded-lg text-[#7A6B74] hover:text-[#421C2D] hover:bg-[#FAF8F5]"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(p.id)}
                            className="p-1.5 rounded-lg text-[#7A6B74] hover:text-[#421C2D] hover:bg-[#FAF8F5]"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center space-y-3 bg-[#FAF8F5] rounded-2xl">
              <Package className="w-10 h-10 text-[#A896A0] mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-[#421C2D]">No products found</h4>
                <p className="text-xs text-[#7A6B74]">
                  {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                    ? 'Try clearing your filters.'
                    : 'Get started by creating your first product.'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('products-new')}
                className="px-4 py-2 rounded-xl bg-[#421C2D] text-white text-xs font-semibold inline-flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-[#BFA36D]" />
                <span>Add Product</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
