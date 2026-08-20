import { Product, Category, WebsiteSettings, MediaItem, WhatsAppInquiryClick, BRAND_CONFIG } from '../types';
import { CATEGORIES_DATA, INITIAL_PRODUCTS } from '../data/products';
import { isDeadBlobUrl, getSafeImageUrl, fileToPermanentDataUrl, persistImageToIndexedDB } from '../utils/imageStorage';
import {
  supabase,
  rowToProduct,
  productToRow,
  rowToCategory,
  categoryToRow,
  rowToSettings,
  uploadImageToSupabaseStorage,
  SupabaseProductRow,
  SupabaseCategoryRow,
  SupabaseSettingsRow,
} from '../lib/supabase';

const TOKEN_KEY = 'mtc_admin_auth_token';
const STORAGE_KEY_PRODUCTS = 'mtc_storage_products';
const STORAGE_KEY_CATEGORIES = 'mtc_storage_categories';
const STORAGE_KEY_SETTINGS = 'mtc_storage_settings';
const STORAGE_KEY_MEDIA = 'mtc_storage_media';
const STORAGE_KEY_INQUIRIES = 'mtc_storage_inquiries';

export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Local cache sanitization
function sanitizeProduct(p: Product): Product {
  const safeMain = getSafeImageUrl(p.mainImage, p.category);
  const safeGallery = Array.isArray(p.galleryImages)
    ? p.galleryImages
        .map((img) => (isDeadBlobUrl(img) ? safeMain : img))
        .filter(Boolean)
    : [safeMain];

  return {
    ...p,
    mainImage: safeMain,
    galleryImages: safeGallery.length > 0 ? safeGallery : [safeMain],
  };
}

function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(sanitizeProduct);
      }
    }
  } catch {}
  return INITIAL_PRODUCTS;
}

function saveLocalProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = products.map(sanitizeProduct);
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(sanitized));
  } catch {}
}

function getLocalCategories(): Category[] {
  if (typeof window === 'undefined') return CATEGORIES_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return CATEGORIES_DATA;
}

function saveLocalCategories(categories: Category[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch {}
}

function getLocalSettings(): WebsiteSettings {
  if (typeof window === 'undefined') return BRAND_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const merged = { ...BRAND_CONFIG, ...parsed };
        if (isDeadBlobUrl(merged.logo)) {
          merged.logo = undefined;
          merged.logoUrl = undefined;
        }
        return merged;
      }
    }
  } catch {}
  return BRAND_CONFIG;
}

function saveLocalSettings(settings: WebsiteSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {}
}

function getLocalMedia(): MediaItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEDIA);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((m) => !isDeadBlobUrl(m.url));
      }
    }
  } catch {}
  return [];
}

function saveLocalMedia(media: MediaItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const safeMedia = media.filter((m) => !isDeadBlobUrl(m.url));
    localStorage.setItem(STORAGE_KEY_MEDIA, JSON.stringify(safeMedia));
  } catch {}
}

function getLocalInquiries(): WhatsAppInquiryClick[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INQUIRIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveLocalInquiries(inquiries: WhatsAppInquiryClick[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_INQUIRIES, JSON.stringify(inquiries.slice(0, 500)));
  } catch {}
}

// Low-level helper for server fallback
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.error) {
        errorMsg = errJson.error;
      }
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}

// ==============================================================================
// SEEDING HELPER: Seamlessly Populate Supabase with Curated Initial Catalog
// ==============================================================================
let isSeedingSupabase = false;

async function seedSupabaseIfNeeded(): Promise<void> {
  if (isSeedingSupabase) return;
  try {
    isSeedingSupabase = true;

    // Check categories
    const { data: catData, error: catErr } = await supabase.from('categories').select('id').limit(1);
    if (!catErr && (!catData || catData.length === 0)) {
      const catRows = CATEGORIES_DATA.map(categoryToRow);
      await supabase.from('categories').upsert(catRows);
    }

    // Check products
    const { data: prodData, error: prodErr } = await supabase.from('products').select('id').limit(1);
    if (!prodErr && (!prodData || prodData.length === 0)) {
      const prodRows = INITIAL_PRODUCTS.map(productToRow);
      await supabase.from('products').upsert(prodRows);
    }

    // Check settings
    const { data: settsData, error: settsErr } = await supabase.from('website_settings').select('id').limit(1);
    if (!settsErr && (!settsData || settsData.length === 0)) {
      await supabase.from('website_settings').upsert({
        id: 'primary',
        business_name: BRAND_CONFIG.businessName,
        tagline: BRAND_CONFIG.tagline,
        currency_symbol: BRAND_CONFIG.currencySymbol,
        footer_description: BRAND_CONFIG.footerDescription,
        instagram_url: BRAND_CONFIG.instagramUrl,
        facebook_url: BRAND_CONFIG.facebookUrl,
        whatsapp_number: BRAND_CONFIG.whatsappNumber,
      });
    }
  } catch (seedErr) {
    console.warn('Auto-seed check note:', seedErr);
  } finally {
    isSeedingSupabase = false;
  }
}

// ==============================================================================
// PUBLIC & ADMIN API INTERFACE (SUPABASE SINGLE SOURCE OF TRUTH)
// ==============================================================================

export const api = {
  // --- AUTHENTICATION ---
  async login(username: string, password: string): Promise<{ token: string; user: { id: string; username: string } }> {
    // 1. Try Supabase Auth if email format
    if (username.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: username,
          password,
        });
        if (!error && data.session && data.user) {
          const token = data.session.access_token;
          const userObj = { id: data.user.id, username: data.user.email || username };
          setStoredAuthToken(token);
          return { token, user: userObj };
        }
      } catch (sbAuthErr) {
        console.warn('Supabase Auth attempt note:', sbAuthErr);
      }
    }

    // 2. Server Auth proxy
    const res = await request<{ token: string; user: { id: string; username: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (res.token) {
      setStoredAuthToken(res.token);
    }
    return res;
  },

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch {}
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {}
    setStoredAuthToken(null);
  },

  async getMe(): Promise<{ authenticated: boolean; user?: { id: string; username: string } }> {
    const token = getStoredAuthToken();
    if (!token) return { authenticated: false };

    // Check Supabase session
    try {
      const { data } = await supabase.auth.getSession();
      if (data && data.session && data.session.user) {
        return {
          authenticated: true,
          user: {
            id: data.session.user.id,
            username: data.session.user.email || 'admin',
          },
        };
      }
    } catch {}

    try {
      const res = await request<{ id: string; username: string }>('/api/auth/me');
      return { authenticated: true, user: res };
    } catch {
      setStoredAuthToken(null);
      return { authenticated: false };
    }
  },

  async changePassword(oldPassword: string, newPassword: string) {
    return await request<{ success: boolean; message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },

  async getAdminUsers() {
    try {
      return await request<{ id: string; username: string; createdAt: string }[]>('/api/auth/users');
    } catch {
      return [{ id: 'usr_admin_1', username: 'maryam', createdAt: new Date().toISOString() }];
    }
  },

  async createAdminUser(username: string, password: string) {
    return await request<{ id: string; username: string; createdAt: string }>('/api/auth/users', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async deleteAdminUser(id: string) {
    return await request<{ success: boolean }>(`/api/auth/users/${id}`, {
      method: 'DELETE',
    });
  },

  // ============================================================================
  // PRODUCTS: Supabase Single Source of Truth
  // ============================================================================
  async getProducts(params?: { all?: boolean; category?: string; search?: string }): Promise<Product[]> {
    try {
      let query = supabase.from('products').select('*');

      // Public visitors only see published products
      if (!params?.all) {
        query = query.eq('is_published', true);
      }

      // Filter by category
      if (params?.category && params.category !== 'all') {
        query = query.eq('category_id', params.category);
      }

      // Order by display order & date
      query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false });

      const { data, error } = await query;

      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          let prods = data.map((r: SupabaseProductRow) => rowToProduct(r));

          // In-memory text search if provided
          if (params?.search && params.search.trim()) {
            const q = params.search.toLowerCase();
            prods = prods.filter(
              (p) =>
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.sku.toLowerCase().includes(q) ||
                p.categoryLabel.toLowerCase().includes(q)
            );
          }

          saveLocalProducts(prods);
          return prods;
        } else {
          // If table is newly created and empty, seed initial catalog into Supabase
          await seedSupabaseIfNeeded();
        }
      } else if (error) {
        console.warn('Supabase product query error:', error.message);
      }
    } catch (sbErr) {
      console.warn('Supabase fetch exception:', sbErr);
    }

    // Server fallback proxy
    try {
      const qParams = new URLSearchParams();
      if (params?.all) qParams.set('all', 'true');
      if (params?.category) qParams.set('category', params.category);
      if (params?.search) qParams.set('search', params.search);
      const qs = qParams.toString() ? `?${qParams.toString()}` : '';

      const res = await request<Product[]>(`/api/products${qs}`);
      if (Array.isArray(res) && res.length > 0) {
        saveLocalProducts(res);
        return res;
      }
    } catch (srvErr) {
      console.warn('Server fallback fetch note:', srvErr);
    }

    let localProds = getLocalProducts();
    if (!params?.all) {
      localProds = localProds.filter((p) => p.status === 'published' || p.isPublished === true);
    }
    if (params?.category && params.category !== 'all') {
      localProds = localProds.filter((p) => p.category === params.category);
    }
    return localProds;
  },

  async getProduct(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return rowToProduct(data as SupabaseProductRow);
      }
    } catch (err) {
      console.warn('Supabase getProduct error:', err);
    }

    try {
      return await request<Product>(`/api/products/${id}`);
    } catch {
      const prods = getLocalProducts();
      return prods.find((p) => p.id === id) || null;
    }
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const row = productToRow(data);

    // 1. Insert into Supabase Production Database
    try {
      const { data: insertedRow, error } = await supabase
        .from('products')
        .insert(row)
        .select()
        .single();

      if (error) {
        console.warn('Supabase direct insert warning:', error.message);
      } else if (insertedRow) {
        const prod = rowToProduct(insertedRow as SupabaseProductRow);
        const existing = getLocalProducts();
        saveLocalProducts([prod, ...existing.filter((p) => p.id !== prod.id)]);

        // Sync with server in background
        request('/api/products', {
          method: 'POST',
          body: JSON.stringify(prod),
        }).catch(() => {});

        return prod;
      }
    } catch (sbInsertErr) {
      console.warn('Supabase product insert exception:', sbInsertErr);
    }

    // 2. Server API fallback
    const res = await request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!res || !res.id) {
      throw new Error('Database insertion failed: No valid product record returned.');
    }

    const prods = getLocalProducts();
    saveLocalProducts([res, ...prods.filter((p) => p.id !== res.id)]);
    return res;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const row = productToRow({ ...data, id });

    // 1. Update in Supabase Production Database
    try {
      const { data: updatedRow, error } = await supabase
        .from('products')
        .update(row)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.warn('Supabase direct update warning:', error.message);
      } else if (updatedRow) {
        const prod = rowToProduct(updatedRow as SupabaseProductRow);
        const existing = getLocalProducts();
        saveLocalProducts(existing.map((p) => (p.id === id ? prod : p)));

        // Sync with server in background
        request(`/api/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(prod),
        }).catch(() => {});

        return prod;
      }
    } catch (sbUpdateErr) {
      console.warn('Supabase product update exception:', sbUpdateErr);
    }

    // 2. Server API fallback
    const res = await request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!res || !res.id) {
      throw new Error('Database update failed: No valid product record returned.');
    }

    const prods = getLocalProducts();
    saveLocalProducts(prods.map((p) => (p.id === id ? res : p)));
    return res;
  },

  async deleteProduct(id: string, hardDelete = false) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase product delete exception:', err);
    }

    const res = await request<{ success: boolean }>(`/api/products/${id}${hardDelete ? '?hard=true' : ''}`, {
      method: 'DELETE',
    }).catch(() => ({ success: true }));

    const prods = getLocalProducts().filter((p) => p.id !== id);
    saveLocalProducts(prods);
    return res;
  },

  async duplicateProduct(id: string) {
    const original = await this.getProduct(id);
    if (!original) {
      throw new Error('Product not found to duplicate.');
    }

    const duplicatedPayload: Partial<Product> = {
      ...original,
      id: `mtc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${original.name} (Copy)`,
      sku: `MTC-${Date.now().toString().slice(-4)}`,
      slug: `${original.slug}-copy-${Date.now().toString().slice(-3)}`,
      status: 'draft',
      isPublished: false,
    };

    return await this.createProduct(duplicatedPayload);
  },

  async reorderProducts(orderedIds: string[]) {
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        await supabase
          .from('products')
          .update({ display_order: i + 1 })
          .eq('id', orderedIds[i]);
      }
    } catch (err) {
      console.warn('Supabase reorder exception:', err);
    }

    await request<{ success: boolean }>('/api/products/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds }),
    }).catch(() => ({ success: true }));

    const prods = getLocalProducts();
    orderedIds.forEach((pid, idx) => {
      const found = prods.find((p) => p.id === pid);
      if (found) found.displayOrder = idx + 1;
    });
    saveLocalProducts(prods);
    return { success: true };
  },

  // ============================================================================
  // CATEGORIES: Supabase Single Source of Truth
  // ============================================================================
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const cats = data.map((r: SupabaseCategoryRow) => rowToCategory(r));
        saveLocalCategories(cats);
        return cats;
      }
    } catch (err) {
      console.warn('Supabase categories error:', err);
    }

    try {
      const res = await request<Category[]>('/api/categories');
      if (Array.isArray(res) && res.length > 0) {
        saveLocalCategories(res);
        return res;
      }
    } catch {}

    return getLocalCategories();
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const row = categoryToRow(data);
    try {
      const { data: inserted, error } = await supabase
        .from('categories')
        .insert(row)
        .select()
        .single();

      if (!error && inserted) {
        const cat = rowToCategory(inserted as SupabaseCategoryRow);
        const existing = getLocalCategories();
        saveLocalCategories([...existing, cat]);
        return cat;
      }
    } catch (err) {
      console.warn('Supabase createCategory error:', err);
    }

    try {
      const res = await request<Category>('/api/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res && res.id) {
        const cats = getLocalCategories();
        saveLocalCategories([...cats, res]);
        return res;
      }
    } catch {}

    const cats = getLocalCategories();
    const id = data.id || `cat-${Date.now().toString(36)}`;
    const newCat: Category = {
      id,
      name: data.name || 'New Category',
      slug: data.slug || (data.name || 'category').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: data.tagline || 'Curated boutique collection',
      image: data.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
      itemCount: 0,
      displayOrder: (cats.length || 0) + 1,
      isPublished: true,
    };
    saveLocalCategories([...cats, newCat]);
    return newCat;
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const row = categoryToRow({ ...data, id });
    try {
      const { data: updated, error } = await supabase
        .from('categories')
        .update(row)
        .eq('id', id)
        .select()
        .single();

      if (!error && updated) {
        const cat = rowToCategory(updated as SupabaseCategoryRow);
        const cats = getLocalCategories();
        saveLocalCategories(cats.map((c) => (c.id === id ? cat : c)));
        return cat;
      }
    } catch (err) {
      console.warn('Supabase updateCategory error:', err);
    }

    try {
      const res = await request<Category>(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (res && res.id) {
        const cats = getLocalCategories();
        saveLocalCategories(cats.map((c) => (c.id === id || c.slug === id ? res : c)));
        return res;
      }
    } catch {}

    const cats = getLocalCategories();
    const index = cats.findIndex((c) => c.id === id || c.slug === id);
    if (index !== -1) {
      const updated = { ...cats[index], ...data };
      cats[index] = updated;
      saveLocalCategories(cats);
      return updated;
    }
    throw new Error('Category not found');
  },

  async deleteCategory(id: string) {
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch {}
    try {
      await request<{ success: boolean }>(`/api/categories/${id}`, { method: 'DELETE' });
    } catch {}
    const cats = getLocalCategories().filter((c) => c.id !== id && c.slug !== id);
    saveLocalCategories(cats);
    return { success: true };
  },

  async reorderCategories(orderedIds: string[]) {
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        await supabase.from('categories').update({ display_order: i + 1 }).eq('id', orderedIds[i]);
      }
    } catch {}
    try {
      await request<{ success: boolean }>('/api/categories/reorder', {
        method: 'POST',
        body: JSON.stringify({ orderedIds }),
      });
    } catch {}
    const cats = getLocalCategories();
    orderedIds.forEach((cid, idx) => {
      const found = cats.find((c) => c.id === cid || c.slug === cid);
      if (found) found.displayOrder = idx + 1;
    });
    saveLocalCategories(cats);
    return { success: true };
  },

  // ============================================================================
  // WEBSITE SETTINGS: Supabase Single Source of Truth
  // ============================================================================
  async getSettings(): Promise<WebsiteSettings> {
    try {
      const { data, error } = await supabase
        .from('website_settings')
        .select('*')
        .eq('id', 'primary')
        .maybeSingle();

      if (!error && data) {
        const setts = rowToSettings(data as SupabaseSettingsRow);
        saveLocalSettings(setts);
        return setts;
      }
    } catch (err) {
      console.warn('Supabase settings error:', err);
    }

    try {
      const res = await request<WebsiteSettings>('/api/settings');
      if (res && typeof res === 'object') {
        saveLocalSettings(res);
        return res;
      }
    } catch {}

    return getLocalSettings();
  },

  async updateSettings(data: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    const row: Partial<SupabaseSettingsRow> = {
      id: 'primary',
      business_name: data.businessName,
      tagline: data.tagline,
      currency_symbol: data.currencySymbol,
      footer_description: data.footerDescription,
      instagram_url: data.instagramUrl,
      facebook_url: data.facebookUrl,
      whatsapp_number: data.whatsappNumber,
      updated_at: new Date().toISOString(),
    };

    try {
      const { data: updated, error } = await supabase
        .from('website_settings')
        .upsert(row)
        .select()
        .single();

      if (!error && updated) {
        const setts = rowToSettings(updated as SupabaseSettingsRow);
        saveLocalSettings(setts);
        return setts;
      }
    } catch (err) {
      console.warn('Supabase updateSettings error:', err);
    }

    try {
      const res = await request<WebsiteSettings>('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (res && typeof res === 'object') {
        saveLocalSettings(res);
        return res;
      }
    } catch {}

    const current = getLocalSettings();
    const merged = { ...current, ...data };
    saveLocalSettings(merged);
    return merged;
  },

  // ============================================================================
  // MEDIA: Supabase Storage Bucket ('product-images')
  // ============================================================================
  async getMedia(): Promise<MediaItem[]> {
    try {
      const res = await request<MediaItem[]>('/api/media');
      if (Array.isArray(res)) {
        saveLocalMedia(res);
        return res;
      }
    } catch {}
    return getLocalMedia();
  },

  async uploadImages(files: File[]): Promise<{ urls: string[]; items: MediaItem[] }> {
    if (!files || files.length === 0) {
      return { urls: [], items: [] };
    }

    const uploadedUrls: string[] = [];
    const mediaItems: MediaItem[] = [];

    for (const file of files) {
      // Step A: Generate crisp permanent data URL for instant reliability
      let permanentDataUrl = '';
      try {
        permanentDataUrl = await fileToPermanentDataUrl(file);
      } catch {}

      let chosenUrl = '';

      // Step B: Attempt Supabase Storage Upload
      try {
        const publicUrl = await uploadImageToSupabaseStorage(file);
        if (publicUrl && typeof publicUrl === 'string' && publicUrl.startsWith('http')) {
          chosenUrl = publicUrl;
        }
      } catch (sbStorageErr) {
        console.warn('Supabase storage upload fallback:', sbStorageErr);
      }

      // Step C: If Supabase Storage is not ready or failed, try server disk upload
      if (!chosenUrl && permanentDataUrl) {
        try {
          const res = await request<{ urls: string[]; items: MediaItem[] }>('/api/media/upload', {
            method: 'POST',
            body: JSON.stringify({
              images: [{
                dataUrl: permanentDataUrl,
                name: file.name,
                size: file.size,
                mimeType: file.type || 'image/jpeg',
              }],
            }),
          }).catch(() => null);

          if (res && res.urls && res.urls.length > 0) {
            chosenUrl = res.urls[0];
          }
        } catch (srvErr) {
          console.warn('Server disk upload fallback:', srvErr);
        }
      }

      // Step D: Ultimate fallback to permanent Data URL
      if (!chosenUrl) {
        chosenUrl = permanentDataUrl;
      }

      if (chosenUrl) {
        uploadedUrls.push(chosenUrl);
        const item: MediaItem = {
          id: `med_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          filename: file.name,
          originalName: file.name,
          url: chosenUrl,
          uploadedAt: new Date().toISOString(),
          size: file.size,
          mimeType: file.type || 'image/jpeg',
        };
        mediaItems.push(item);

        if (permanentDataUrl) {
          persistImageToIndexedDB(item.id, permanentDataUrl, { filename: file.name });
        }
      }
    }

    if (uploadedUrls.length === 0) {
      throw new Error('Image upload failed: Please verify file format.');
    }

    const existing = getLocalMedia();
    saveLocalMedia([...mediaItems, ...existing]);
    return { urls: uploadedUrls, items: mediaItems };
  },

  async deleteMedia(id: string) {
    try {
      await request<{ success: boolean }>(`/api/media/${id}`, { method: 'DELETE' });
    } catch {}
    const media = getLocalMedia().filter((m) => m.id !== id);
    saveLocalMedia(media);
    return { success: true };
  },

  // ============================================================================
  // ANALYTICS / INQUIRIES
  // ============================================================================
  async trackInquiry(data: Partial<WhatsAppInquiryClick>): Promise<WhatsAppInquiryClick | null> {
    const item: WhatsAppInquiryClick = {
      id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      productId: data.productId || '',
      productName: data.productName || 'General Inquiry',
      productSku: data.productSku || '',
      price: data.price,
      selectedSize: data.selectedSize,
      selectedColor: data.selectedColor,
      timestamp: new Date().toISOString(),
      sourceUrl: data.sourceUrl || (typeof window !== 'undefined' ? window.location.href : ''),
    };

    // 1. Insert to Supabase inquiries table
    try {
      await supabase.from('inquiries').insert({
        id: item.id,
        product_id: item.productId,
        product_name: item.productName,
        product_sku: item.productSku,
        price: item.price,
        selected_size: item.selectedSize,
        selected_color: item.selectedColor,
        source_url: item.sourceUrl,
        timestamp: item.timestamp,
      });
    } catch (sbInqErr) {
      console.warn('Supabase inquiry insert note:', sbInqErr);
    }

    // 2. Server track
    try {
      await request('/api/inquiries/track', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {}

    const inquiries = getLocalInquiries();
    saveLocalInquiries([item, ...inquiries.slice(0, 499)]);
    return item;
  },

  async trackWhatsAppClick(data: Partial<WhatsAppInquiryClick>) {
    return this.trackInquiry(data);
  },

  async getInquiries(): Promise<WhatsAppInquiryClick[]> {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (!error && Array.isArray(data) && data.length > 0) {
        const inqs: WhatsAppInquiryClick[] = data.map((r) => ({
          id: r.id,
          productId: r.product_id,
          productName: r.product_name,
          productSku: r.product_sku,
          price: r.price,
          selectedSize: r.selected_size,
          selectedColor: r.selected_color,
          sourceUrl: r.source_url,
          timestamp: r.timestamp,
        }));
        saveLocalInquiries(inqs);
        return inqs;
      }
    } catch {}

    try {
      const res = await request<WhatsAppInquiryClick[]>('/api/inquiries');
      if (Array.isArray(res)) {
        saveLocalInquiries(res);
        return res;
      }
    } catch {}

    return getLocalInquiries();
  },

  // --- DASHBOARD STATS ---
  async getDashboardStats() {
    try {
      const [prods, cats, inqs] = await Promise.all([
        this.getProducts({ all: true }).catch(() => getLocalProducts()),
        this.getCategories().catch(() => getLocalCategories()),
        this.getInquiries().catch(() => getLocalInquiries()),
      ]);

      const published = prods.filter((p) => p.status === 'published' || p.isPublished);
      const drafts = prods.filter((p) => p.status === 'draft' || (!p.isPublished && p.status !== 'archived'));

      return {
        totalPublishedProducts: published.length,
        totalDraftProducts: drafts.length,
        totalArchivedProducts: prods.filter((p) => p.status === 'archived').length,
        totalCategories: cats.length,
        newArrivalsCount: published.filter((p) => p.newArrival || p.isNewArrival).length,
        featuredCount: published.filter((p) => p.featured || p.isFeatured).length,
        inStockCount: published.filter((p) => p.inStock).length,
        outOfStockCount: published.filter((p) => !p.inStock).length,
        totalWhatsAppClicks: inqs.length,
        recentInquiries: inqs.slice(0, 10),
        recentProducts: prods.slice(0, 5),
      };
    } catch {
      const prods = getLocalProducts();
      const cats = getLocalCategories();
      const inqs = getLocalInquiries();
      const published = prods.filter((p) => p.status === 'published' || p.isPublished);
      const drafts = prods.filter((p) => p.status === 'draft' || (!p.isPublished && p.status !== 'archived'));

      return {
        totalPublishedProducts: published.length,
        totalDraftProducts: drafts.length,
        totalArchivedProducts: prods.filter((p) => p.status === 'archived').length,
        totalCategories: cats.length,
        newArrivalsCount: published.filter((p) => p.newArrival || p.isNewArrival).length,
        featuredCount: published.filter((p) => p.featured || p.isFeatured).length,
        inStockCount: published.filter((p) => p.inStock).length,
        outOfStockCount: published.filter((p) => !p.inStock).length,
        totalWhatsAppClicks: inqs.length,
        recentInquiries: inqs.slice(0, 10),
        recentProducts: prods.slice(0, 5),
      };
    }
  },
};
