import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Product, Category, WebsiteSettings, MediaItem, WhatsAppInquiryClick, BRAND_CONFIG } from '../src/types';
import { INITIAL_PRODUCTS, CATEGORIES_DATA } from '../src/data/products';

export interface AdminUserRecord {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  username: string;
  expiresAt: number;
}

export interface DatabaseSchema {
  users: AdminUserRecord[];
  sessions: SessionRecord[];
  products: Product[];
  categories: Category[];
  settings: WebsiteSettings;
  media: MediaItem[];
  inquiryClicks: WhatsAppInquiryClick[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const finalSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, finalSalt, 64).toString('hex');
  return { hash, salt: finalSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculatedHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(calculatedHash, 'hex'), Buffer.from(hash, 'hex'));
}

function getInitialDatabase(): DatabaseSchema {
  const defaultAdmin = hashPassword('maryam123');
  
  const initialProducts: Product[] = INITIAL_PRODUCTS.map((p, idx) => ({
    ...p,
    shortDescription: p.description.slice(0, 120) + '...',
    availability: p.inStock ? 'in_stock' : 'out_of_stock',
    status: 'published',
    isPublished: true,
    isFeatured: p.featured,
    isNewArrival: p.newArrival,
    displayOrder: idx + 1,
    createdAt: new Date(Date.now() - (INITIAL_PRODUCTS.length - idx) * 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const initialCategories: Category[] = CATEGORIES_DATA.map((c, idx) => ({
    ...c,
    description: c.tagline,
    displayOrder: idx + 1,
    isPublished: true,
  }));

  return {
    users: [
      {
        id: 'usr_admin_1',
        username: 'maryam',
        passwordHash: defaultAdmin.hash,
        salt: defaultAdmin.salt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    sessions: [],
    products: initialProducts,
    categories: initialCategories,
    settings: {
      ...BRAND_CONFIG,
      featuredProductIds: initialProducts.filter((p) => p.featured).map((p) => p.id),
    },
    media: [],
    inquiryClicks: [],
  };
}

class Store {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.products && parsed.categories && parsed.settings) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading database file, re-initializing...', err);
    }
    const initial = getInitialDatabase();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      this.syncToSourceCode();
    } catch (err) {
      console.error('Error writing database file', err);
    }
  }

  public syncToSourceCode() {
    try {
      const sourceFilePath = path.join(process.cwd(), 'src', 'data', 'products.ts');
      const categoriesTs = JSON.stringify(this.data.categories, null, 2);
      const productsTs = JSON.stringify(this.data.products, null, 2);

      const content = `import { Product, Category } from '../types';

export const CATEGORIES_DATA: Category[] = ${categoriesTs};

export const INITIAL_PRODUCTS: Product[] = ${productsTs};
`;
      fs.writeFileSync(sourceFilePath, content, 'utf-8');
    } catch (err) {
      console.warn('Could not sync to src/data/products.ts:', err);
    }
  }

  public save() {
    this.saveDirect(this.data);
  }

  // --- AUTH METHODS ---
  public authenticate(username: string, password: string): { token: string; user: { id: string; username: string } } | null {
    const user = this.data.users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) return null;

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) return null;

    // Create session token valid for 7 days
    const token = crypto.randomBytes(32).toString('hex');
    const session: SessionRecord = {
      token,
      userId: user.id,
      username: user.username,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    // Clean old expired sessions
    this.data.sessions = this.data.sessions.filter((s) => s.expiresAt > Date.now());
    this.data.sessions.push(session);
    this.save();

    return {
      token,
      user: { id: user.id, username: user.username },
    };
  }

  public validateSession(token?: string): SessionRecord | null {
    if (!token) return null;
    const session = this.data.sessions.find((s) => s.token === token && s.expiresAt > Date.now());
    return session || null;
  }

  public logout(token?: string): boolean {
    if (!token) return false;
    const initialLen = this.data.sessions.length;
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    if (this.data.sessions.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public changePassword(userId: string, oldPassword: string, newPassword: string): boolean {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return false;

    const isValid = verifyPassword(oldPassword, user.passwordHash, user.salt);
    if (!isValid) return false;

    const { hash, salt } = hashPassword(newPassword);
    user.passwordHash = hash;
    user.salt = salt;
    user.updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  public getUsers(): { id: string; username: string; createdAt: string }[] {
    return this.data.users.map((u) => ({
      id: u.id,
      username: u.username,
      createdAt: u.createdAt,
    }));
  }

  public createUser(username: string, password: string): { id: string; username: string; createdAt: string } {
    const trimmed = username.trim();
    if (!trimmed) {
      throw new Error('Username cannot be empty.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const existing = this.data.users.find((u) => u.username.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      throw new Error(`Admin account "${trimmed}" already exists.`);
    }

    const { hash, salt } = hashPassword(password);
    const newUser: AdminUserRecord = {
      id: `usr_admin_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      username: trimmed,
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.save();
    return {
      id: newUser.id,
      username: newUser.username,
      createdAt: newUser.createdAt,
    };
  }

  public deleteUser(id: string, currentUserId: string): boolean {
    if (id === currentUserId) {
      throw new Error('You cannot delete your own active admin account.');
    }
    if (this.data.users.length <= 1) {
      throw new Error('Cannot delete the only admin account.');
    }

    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter((u) => u.id !== id);
    if (this.data.users.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- PRODUCT METHODS ---
  public getProducts(includeUnpublished = false): Product[] {
    let prods = [...this.data.products];
    if (!includeUnpublished) {
      prods = prods.filter((p) => p.status === 'published' || p.isPublished === true);
    }
    return prods.sort((a, b) => (a.displayOrder || 9999) - (b.displayOrder || 9999));
  }

  public getProductById(id: string): Product | null {
    return this.data.products.find((p) => p.id === id) || null;
  }

  public createProduct(productData: Partial<Product>): Product {
    const now = new Date().toISOString();
    const id = productData.id || `mtc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Auto-generate slug
    const baseSlug = (productData.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${id.slice(-4)}`;

    const maxOrder = this.data.products.reduce((max, p) => Math.max(max, p.displayOrder || 0), 0);

    const isPub = productData.status ? productData.status === 'published' : (productData.isPublished ?? true);
    const inStock = productData.availability ? productData.availability === 'in_stock' : (productData.inStock ?? true);

    const newProduct: Product = {
      id,
      name: productData.name || 'Untitled Product',
      slug: productData.slug || slug,
      category: productData.category || 'suits',
      categoryLabel: productData.categoryLabel || 'Suits',
      price: productData.price,
      formattedPrice: productData.price ? `${this.data.settings.currencySymbol} ${productData.price.toLocaleString()}` : (productData.formattedPrice || ''),
      description: productData.description || '',
      shortDescription: productData.shortDescription || '',
      fabricDetails: productData.fabricDetails || '',
      mainImage: productData.mainImage || '',
      galleryImages: productData.galleryImages && productData.galleryImages.length > 0 ? productData.galleryImages : (productData.mainImage ? [productData.mainImage] : []),
      sizes: productData.sizes || [],
      colors: productData.colors || [],
      sku: productData.sku || `MTC-${Date.now().toString().slice(-4)}`,
      featured: productData.isFeatured ?? productData.featured ?? false,
      newArrival: productData.isNewArrival ?? productData.newArrival ?? false,
      isFeatured: productData.isFeatured ?? productData.featured ?? false,
      isNewArrival: productData.isNewArrival ?? productData.newArrival ?? false,
      inStock,
      availability: productData.availability || (inStock ? 'in_stock' : 'out_of_stock'),
      status: productData.status || (isPub ? 'published' : 'draft'),
      isPublished: isPub,
      displayOrder: productData.displayOrder || maxOrder + 1,
      whatsappNumber: productData.whatsappNumber || this.data.settings.whatsappNumber,
      createdBy: productData.createdBy || 'admin',
      createdAt: now,
      updatedAt: now,
    };

    this.data.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const current = this.data.products[index];
    const isPub = updates.status !== undefined 
      ? updates.status === 'published' 
      : (updates.isPublished !== undefined ? updates.isPublished : current.isPublished);
    
    const inStock = updates.availability !== undefined
      ? updates.availability === 'in_stock'
      : (updates.inStock !== undefined ? updates.inStock : current.inStock);

    const price = updates.price !== undefined ? updates.price : current.price;
    const formattedPrice = price 
      ? `${this.data.settings.currencySymbol} ${price.toLocaleString()}` 
      : (updates.formattedPrice || current.formattedPrice || '');

    const updatedProduct: Product = {
      ...current,
      ...updates,
      price,
      formattedPrice,
      isPublished: isPub,
      status: updates.status || (isPub ? 'published' : 'draft'),
      inStock,
      availability: updates.availability || (inStock ? 'in_stock' : 'out_of_stock'),
      featured: updates.isFeatured ?? updates.featured ?? current.featured,
      isFeatured: updates.isFeatured ?? updates.featured ?? current.isFeatured,
      newArrival: updates.isNewArrival ?? updates.newArrival ?? current.newArrival,
      isNewArrival: updates.isNewArrival ?? updates.newArrival ?? current.isNewArrival,
      galleryImages: updates.galleryImages || current.galleryImages,
      updatedAt: new Date().toISOString(),
    };

    this.data.products[index] = updatedProduct;
    this.save();
    return updatedProduct;
  }

  public deleteProduct(id: string, hardDelete = false): boolean {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) return false;

    if (hardDelete) {
      this.data.products.splice(index, 1);
    } else {
      // Archive product safely
      this.data.products[index].status = 'archived';
      this.data.products[index].isPublished = false;
      this.data.products[index].updatedAt = new Date().toISOString();
    }
    this.save();
    return true;
  }

  public duplicateProduct(id: string): Product | null {
    const original = this.getProductById(id);
    if (!original) return null;

    const dupData: Partial<Product> = {
      ...original,
      id: undefined,
      name: `${original.name} (Copy)`,
      sku: `${original.sku}-COPY`,
      status: 'draft',
      isPublished: false,
    };
    return this.createProduct(dupData);
  }

  public reorderProducts(orderedIds: string[]): boolean {
    orderedIds.forEach((id, index) => {
      const prod = this.data.products.find((p) => p.id === id);
      if (prod) {
        prod.displayOrder = index + 1;
        prod.updatedAt = new Date().toISOString();
      }
    });
    this.save();
    return true;
  }

  // --- CATEGORIES METHODS ---
  public getCategories(): Category[] {
    const counts = this.data.products.reduce((acc, p) => {
      if (p.status === 'published' || p.isPublished) {
        acc[p.category] = (acc[p.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return this.data.categories
      .map((c) => ({
        ...c,
        itemCount: counts[c.slug] || 0,
      }))
      .sort((a, b) => (a.displayOrder || 9999) - (b.displayOrder || 9999));
  }

  public createCategory(categoryData: Partial<Category>): Category {
    const id = categoryData.id || `cat-${Date.now().toString(36)}`;
    const slug = categoryData.slug || (categoryData.name || 'category').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const maxOrder = this.data.categories.reduce((max, c) => Math.max(max, c.displayOrder || 0), 0);

    const newCategory: Category = {
      id,
      name: categoryData.name || 'New Category',
      slug,
      tagline: categoryData.tagline || categoryData.description || 'Curated luxury collection',
      description: categoryData.description || categoryData.tagline || '',
      image: categoryData.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
      itemCount: 0,
      displayOrder: categoryData.displayOrder || maxOrder + 1,
      isPublished: categoryData.isPublished ?? true,
    };

    this.data.categories.push(newCategory);
    this.save();
    return newCategory;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.data.categories.findIndex((c) => c.id === id || c.slug === id);
    if (index === -1) return null;

    const current = this.data.categories[index];
    const updated: Category = {
      ...current,
      ...updates,
      image: updates.image !== undefined ? updates.image : current.image,
      description: updates.description || updates.tagline || current.description,
      tagline: updates.tagline || updates.description || current.tagline,
    };

    this.data.categories[index] = updated;
    this.save();
    return updated;
  }

  public deleteCategory(id: string): boolean {
    const index = this.data.categories.findIndex((c) => c.id === id || c.slug === id);
    if (index === -1) return false;
    this.data.categories.splice(index, 1);
    this.save();
    return true;
  }

  public reorderCategories(orderedIds: string[]): boolean {
    orderedIds.forEach((id, index) => {
      const cat = this.data.categories.find((c) => c.id === id || c.slug === id);
      if (cat) {
        cat.displayOrder = index + 1;
      }
    });
    this.save();
    return true;
  }

  // --- SETTINGS METHODS ---
  public getSettings(): WebsiteSettings {
    return { ...this.data.settings };
  }

  public updateSettings(updates: Partial<WebsiteSettings>): WebsiteSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
      whatsappRaw: updates.whatsappNumber ? updates.whatsappNumber.replace(/[^0-9]/g, '') : this.data.settings.whatsappRaw,
    };
    this.save();
    return this.data.settings;
  }

  // --- MEDIA METHODS ---
  public getMedia(): MediaItem[] {
    return [...this.data.media].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  public addMedia(mediaItem: MediaItem): MediaItem {
    this.data.media.unshift(mediaItem);
    this.save();
    return mediaItem;
  }

  public deleteMedia(id: string): boolean {
    const index = this.data.media.findIndex((m) => m.id === id);
    if (index === -1) return false;
    const item = this.data.media[index];
    
    // Remove local file if exists
    try {
      const filePath = path.join(process.cwd(), 'uploads', item.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.warn('Could not delete physical file', e);
    }

    this.data.media.splice(index, 1);
    this.save();
    return true;
  }

  // --- ANALYTICS / INQUIRIES ---
  public trackWhatsAppClick(data: Partial<WhatsAppInquiryClick>): WhatsAppInquiryClick {
    const click: WhatsAppInquiryClick = {
      id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      productId: data.productId || '',
      productName: data.productName || 'General Inquiry',
      productSku: data.productSku || '',
      price: data.price,
      selectedSize: data.selectedSize,
      selectedColor: data.selectedColor,
      timestamp: new Date().toISOString(),
      sourceUrl: data.sourceUrl,
    };
    this.data.inquiryClicks.unshift(click);
    // Keep max 500 records
    if (this.data.inquiryClicks.length > 500) {
      this.data.inquiryClicks = this.data.inquiryClicks.slice(0, 500);
    }
    this.save();
    return click;
  }

  public getInquiryClicks(): WhatsAppInquiryClick[] {
    return [...this.data.inquiryClicks];
  }

  // --- STATS OVERVIEW ---
  public getDashboardStats() {
    const products = this.data.products;
    const published = products.filter((p) => p.status === 'published' || p.isPublished);
    const drafts = products.filter((p) => p.status === 'draft' || (!p.isPublished && p.status !== 'archived'));
    const archived = products.filter((p) => p.status === 'archived');
    const newArrivals = published.filter((p) => p.newArrival || p.isNewArrival);
    const featured = published.filter((p) => p.featured || p.isFeatured);
    const inStock = published.filter((p) => p.inStock);
    const outOfStock = published.filter((p) => !p.inStock);

    return {
      totalPublishedProducts: published.length,
      totalDraftProducts: drafts.length,
      totalArchivedProducts: archived.length,
      totalCategories: this.data.categories.length,
      newArrivalsCount: newArrivals.length,
      featuredCount: featured.length,
      inStockCount: inStock.length,
      outOfStockCount: outOfStock.length,
      totalWhatsAppClicks: this.data.inquiryClicks.length,
      recentInquiries: this.data.inquiryClicks.slice(0, 10),
      recentProducts: products.slice(0, 5),
    };
  }
}

export const db = new Store();
