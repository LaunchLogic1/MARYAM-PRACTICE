import { createClient } from '@supabase/supabase-js';
import { Product, Category, WebsiteSettings, BRAND_CONFIG } from '../types';

export const SUPABASE_PROJECT_ID = 'nrdbencwwogpcsqwbcle';
export const DEFAULT_SUPABASE_URL = 'https://nrdbencwwogpcsqwbcle.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_oyrpFhCzspFonf0O-RXo0w_ru_1vErG';

function resolveValidUrl(): string {
  const envUrl = 
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) 
    || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL);

  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        new URL(trimmed);
        return trimmed;
      } catch {}
    }
  }
  return DEFAULT_SUPABASE_URL;
}

function resolveValidKey(): string {
  const envKey = 
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY) 
    || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_PUBLISHABLE_KEY);

  if (typeof envKey === 'string' && envKey.trim().length > 15 && !envKey.includes('MY_')) {
    return envKey.trim();
  }
  return DEFAULT_SUPABASE_ANON_KEY;
}

export const SUPABASE_URL = resolveValidUrl();
export const SUPABASE_ANON_KEY = resolveValidKey();

export const STORAGE_BUCKET_NAME = 'product-images';

function createSafeSupabaseClient() {
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn('Fallback to default Supabase client configuration due to:', err);
    return createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
}

export const supabase = createSafeSupabaseClient();


// Database Row Types (PostgreSQL snake_case)
export interface SupabaseProductRow {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category_label?: string;
  price?: number;
  sale_price?: number;
  formatted_price?: string;
  description: string;
  short_description?: string;
  fabric_details?: string;
  image_url: string;
  additional_images?: string[];
  stock?: number;
  availability?: string;
  in_stock?: boolean;
  sku: string;
  sizes?: string[];
  colors?: any;
  is_published: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  display_order?: number;
  whatsapp_number?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseCategoryRow {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  image_url: string;
  item_count?: number;
  display_order?: number;
  is_published?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseSettingsRow {
  id: string;
  business_name: string;
  tagline?: string;
  currency_symbol?: string;
  footer_description?: string;
  instagram_url?: string;
  facebook_url?: string;
  whatsapp_number?: string;
  created_at?: string;
  updated_at?: string;
}

// Convert Supabase DB row to Frontend Product model
export function rowToProduct(row: SupabaseProductRow): Product {
  const isPub = row.is_published ?? true;
  const inStock = row.in_stock ?? (row.availability ? row.availability === 'in_stock' : true);
  const mainImg = row.image_url || '';
  const additional = Array.isArray(row.additional_images) ? row.additional_images : [];
  const gallery = additional.length > 0 ? additional : (mainImg ? [mainImg] : []);

  let parsedColors = [];
  if (Array.isArray(row.colors)) {
    parsedColors = row.colors;
  } else if (typeof row.colors === 'string') {
    try {
      parsedColors = JSON.parse(row.colors);
    } catch {}
  }

  let parsedSizes = [];
  if (Array.isArray(row.sizes)) {
    parsedSizes = row.sizes;
  } else if (typeof row.sizes === 'string') {
    try {
      parsedSizes = JSON.parse(row.sizes);
    } catch {}
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category_id,
    categoryLabel: row.category_label || row.category_id,
    price: row.price,
    formattedPrice: row.formatted_price || (row.price ? `Rs. ${row.price.toLocaleString()}` : ''),
    description: row.description || '',
    shortDescription: row.short_description || '',
    fabricDetails: row.fabric_details || '',
    mainImage: mainImg,
    galleryImages: gallery,
    sizes: parsedSizes,
    colors: parsedColors,
    sku: row.sku || `MTC-${row.id.slice(-4)}`,
    featured: row.is_featured ?? false,
    newArrival: row.is_new_arrival ?? false,
    isFeatured: row.is_featured ?? false,
    isNewArrival: row.is_new_arrival ?? false,
    inStock,
    availability: (row.availability as any) || (inStock ? 'in_stock' : 'out_of_stock'),
    status: isPub ? 'published' : 'draft',
    isPublished: isPub,
    displayOrder: row.display_order || 0,
    whatsappNumber: row.whatsapp_number,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert Frontend Product model to Supabase DB row
export function productToRow(prod: Partial<Product>): SupabaseProductRow {
  const isPub = prod.status ? prod.status === 'published' : (prod.isPublished ?? true);
  const inStock = prod.availability ? prod.availability === 'in_stock' : (prod.inStock ?? true);
  const mainImg = prod.mainImage || (prod.galleryImages && prod.galleryImages[0]) || '';
  const gallery = prod.galleryImages || (mainImg ? [mainImg] : []);

  return {
    id: prod.id || `mtc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    name: prod.name || 'Untitled Product',
    slug: prod.slug || (prod.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category_id: prod.category || 'suits',
    category_label: prod.categoryLabel || 'Suits',
    price: prod.price,
    formatted_price: prod.formattedPrice || (prod.price ? `Rs. ${prod.price.toLocaleString()}` : ''),
    description: prod.description || '',
    short_description: prod.shortDescription || '',
    fabric_details: prod.fabricDetails || '',
    image_url: mainImg,
    additional_images: gallery,
    stock: inStock ? 10 : 0,
    availability: prod.availability || (inStock ? 'in_stock' : 'out_of_stock'),
    in_stock: inStock,
    sku: prod.sku || `MTC-${Date.now().toString().slice(-4)}`,
    sizes: prod.sizes || [],
    colors: prod.colors || [],
    is_published: isPub,
    is_featured: prod.isFeatured ?? prod.featured ?? false,
    is_new_arrival: prod.isNewArrival ?? prod.newArrival ?? false,
    display_order: prod.displayOrder || 0,
    whatsapp_number: prod.whatsappNumber,
    created_by: prod.createdBy || 'admin',
    updated_at: new Date().toISOString(),
  };
}

// Convert Supabase Category Row to Category model
export function rowToCategory(row: SupabaseCategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline || '',
    description: row.description || '',
    image: row.image_url,
    itemCount: row.item_count || 0,
    displayOrder: row.display_order || 0,
    isPublished: row.is_published ?? row.is_active ?? true,
  };
}

// Convert Category model to Supabase Category row
export function categoryToRow(cat: Partial<Category>): SupabaseCategoryRow {
  return {
    id: cat.id || `cat-${Date.now().toString(36)}`,
    name: cat.name || 'Category',
    slug: cat.slug || (cat.name || 'cat').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    tagline: cat.tagline || '',
    description: cat.description || '',
    image_url: cat.image || '',
    item_count: cat.itemCount || 0,
    display_order: cat.displayOrder || 0,
    is_published: cat.isPublished ?? true,
    is_active: cat.isPublished ?? true,
    updated_at: new Date().toISOString(),
  };
}

// Convert Supabase Settings Row to WebsiteSettings
export function rowToSettings(row: SupabaseSettingsRow): WebsiteSettings {
  return {
    businessName: row.business_name || BRAND_CONFIG.businessName,
    tagline: row.tagline || BRAND_CONFIG.tagline,
    currencySymbol: row.currency_symbol || BRAND_CONFIG.currencySymbol,
    footerDescription: row.footer_description || BRAND_CONFIG.footerDescription,
    instagramUrl: row.instagram_url || BRAND_CONFIG.instagramUrl,
    facebookUrl: row.facebook_url || BRAND_CONFIG.facebookUrl,
    whatsappNumber: row.whatsapp_number || BRAND_CONFIG.whatsappNumber,
  };
}

// Upload a File directly to Supabase Storage bucket 'product-images'
export async function uploadImageToSupabaseStorage(file: File | Blob, fileName?: string): Promise<string | null> {
  const ext = (file.type && file.type.split('/')[1]) || 'jpg';
  const cleanExt = ext === 'jpeg' ? 'jpg' : ext.replace(/[^a-z0-9]/g, '') || 'jpg';
  const finalFileName = fileName || `product_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${cleanExt}`;
  const filePath = `products/${finalFileName}`;

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg',
      });

    if (error) {
      console.warn('Direct Supabase storage upload warning:', error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET_NAME)
      .getPublicUrl(filePath);

    if (publicUrlData && publicUrlData.publicUrl) {
      return publicUrlData.publicUrl;
    }
  } catch (err) {
    console.warn('Supabase storage exception:', err);
    return null;
  }

  return null;
}

