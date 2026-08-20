export type ProductAvailability = 'in_stock' | 'out_of_stock' | 'coming_soon';
export type ProductStatus = 'published' | 'draft' | 'archived';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryLabel: string;
  price?: number;
  formattedPrice?: string;
  description: string;
  shortDescription?: string;
  fabricDetails?: string;
  mainImage: string;
  galleryImages: string[];
  sizes: string[];
  colors: ProductColor[];
  sku: string;
  featured: boolean;
  newArrival: boolean;
  inStock: boolean;
  availability?: ProductAvailability;
  status?: ProductStatus;
  isPublished?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  displayOrder?: number;
  whatsappNumber?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description?: string;
  image: string;
  itemCount: number;
  displayOrder?: number;
  isPublished?: boolean;
}

export interface LogoHistoryItem {
  id: string;
  url: string;
  originalName?: string;
  uploadedAt: string;
  size?: number;
}

export interface WebsiteSettings {
  businessName?: string;
  brandName?: string;
  tagline?: string;
  subtagline?: string;
  subtitle?: string;
  whatsappNumber?: string;
  whatsappRaw?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  businessAddress?: string;
  operatingHours?: string;
  currencySymbol?: string;
  currencyCode?: string;
  logo?: string;
  logoUrl?: string;
  logoHistory?: LogoHistoryItem[];
  favicon?: string;
  websiteTitle?: string;
  seoTitle?: string;
  metaDescription?: string;
  seoDescription?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  heroButtonText?: string;
  heroImage?: string;
  footerDescription?: string;
  footerAbout?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  copyrightText?: string;
  newArrivalsLimit?: number;
  featuredProductIds?: string[];
}

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface WhatsAppInquiryClick {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  price?: number;
  selectedSize?: string;
  selectedColor?: string;
  timestamp: string;
  sourceUrl?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivePage = 'home' | 'shop' | 'categories' | 'about' | 'contact';

export type AdminRoute = 
  | 'dashboard'
  | 'products'
  | 'products-new'
  | 'products-edit'
  | 'categories'
  | 'branding'
  | 'inquiries'
  | 'homepage'
  | 'contact'
  | 'settings'
  | 'media';

export interface FilterState {
  category: string;
  searchQuery: string;
  priceRange: [number, number];
  isNewArrival: boolean;
  isFeatured: boolean;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'featured';
}

export const BRAND_CONFIG: WebsiteSettings = {
  businessName: 'Maryam Trade Center',
  tagline: 'CARRY THE MOMENT',
  subtagline: 'Elegance that moves with you.',
  subtitle: 'GLOBAL COMMERCE | CONNECTING BUSINESSES',
  whatsappNumber: '+92 330 5859348',
  whatsappRaw: '923305859348',
  email: 'mirstiger28@gmail.com',
  phone: '+92 330 5859348',
  currencySymbol: 'Rs.',
  currencyCode: 'PKR',
  logo: '',
  websiteTitle: 'Maryam Trade Center | Pakistani Fashion & Accessories',
  metaDescription: 'Discover exquisite handcrafted suits, structured leather handbags, and festive ensembles with effortless direct ordering via WhatsApp.',
  heroTitle: 'CARRY THE MOMENT',
  heroDescription: 'Elegance that moves with you.',
  heroButtonText: 'EXPLORE COLLECTION',
  heroImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1400&auto=format&fit=crop',
  footerDescription: 'Maryam Trade Center is a premier Pakistani fashion and accessories catalog. Discover exquisite handcrafted suits, structured leather handbags, and festive ensembles with effortless direct ordering via WhatsApp.',
  instagramUrl: 'https://www.instagram.com/maryam12345688901?utm_source=qr&igsh=bzM1czV1d3Y5dTRo',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61593629782975',
  copyrightText: '© 2026 Maryam Trade Center. All rights reserved.',
  newArrivalsLimit: 8,
  featuredProductIds: [],
};
