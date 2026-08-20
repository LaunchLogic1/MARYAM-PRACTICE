import React, { useState, useEffect } from 'react';
import { ActivePage, Product, Category, AdminRoute, WebsiteSettings, BRAND_CONFIG } from './types';
import { CATEGORIES_DATA, INITIAL_PRODUCTS } from './data/products';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeaturedCategories } from './components/FeaturedCategories';
import { NewArrivals } from './components/NewArrivals';
import { FeaturedCollection } from './components/FeaturedCollection';
import { HomeStoryAndValues } from './components/HomeStoryAndValues';
import { ShopView } from './components/ShopView';
import { CategoriesView } from './components/CategoriesView';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SearchModal } from './components/SearchModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { api, getStoredAuthToken } from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES_DATA);
  const [settings, setSettings] = useState<WebsiteSettings>(BRAND_CONFIG);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');

  // Admin Portal State
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash.startsWith('#admin');
    }
    return false;
  });
  const [adminUser, setAdminUser] = useState<{ id: string; username: string } | null>(null);
  const [adminRoute, setAdminRoute] = useState<AdminRoute>('dashboard');
  const [adminEditProductId, setAdminEditProductId] = useState<string | undefined>(undefined);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  // Fetch public catalog, categories, and settings from backend
  const loadPublicData = async () => {
    try {
      const [prods, sets, cats] = await Promise.all([
        api.getProducts().catch(() => []),
        api.getSettings().catch(() => BRAND_CONFIG),
        api.getCategories().catch(() => CATEGORIES_DATA),
      ]);
      if (Array.isArray(prods)) {
        setProducts(prods);
      }
      if (sets && typeof sets === 'object' && !Array.isArray(sets)) {
        setSettings((prev) => ({ ...prev, ...sets }));
      }
      if (Array.isArray(cats) && cats.length > 0) {
        setCategories(cats);
      }
    } catch (err) {
      console.warn('Backend loading fallback:', err);
    }
  };

  // Check auth session on startup
  useEffect(() => {
    const checkAuth = async () => {
      const token = getStoredAuthToken();
      if (token) {
        try {
          const res = await api.getMe();
          if (res.authenticated && res.user) {
            setAdminUser(res.user);
          }
        } catch {
          // Token expired or invalid
          setAdminUser(null);
        }
      }
      setIsLoadingAuth(false);
    };

    checkAuth();
    loadPublicData();

    // Listen for hash changes (e.g. #admin)
    const handleHashChange = () => {
      if (window.location.hash.startsWith('#admin')) {
        setIsAdminMode(true);
      } else {
        setIsAdminMode(false);
        loadPublicData();
      }
    };

    // Listen for global catalog updates (e.g. from admin actions)
    const handleCatalogUpdate = () => {
      loadPublicData();
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('mtc-catalog-updated', handleCatalogUpdate);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('mtc-catalog-updated', handleCatalogUpdate);
    };
  }, []);

  // Refresh public catalog on activePage change to ensure zero stale state
  useEffect(() => {
    if (!isAdminMode) {
      loadPublicData();
    }
  }, [activePage, isAdminMode]);

  // Admin routing helper
  const handleAdminNavigate = (route: AdminRoute, editId?: string) => {
    setAdminRoute(route);
    setAdminEditProductId(editId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    setIsAdminMode(true);
    window.location.hash = '#admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseAdmin = () => {
    setIsAdminMode(false);
    window.location.hash = '';
    loadPublicData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelectFromHome = (slug: string) => {
    setSelectedCategorySlug(slug);
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToCategories = () => {
    const el = document.getElementById('shop-by-category-section');
    if (el && activePage === 'home') {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActivePage('categories');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // If Admin Mode is active:
  if (isAdminMode) {
    if (isLoadingAuth) {
      return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#421C2D]/30 border-t-[#421C2D] rounded-full animate-spin" />
        </div>
      );
    }

    if (!adminUser) {
      return (
        <AdminLogin
          onLoginSuccess={(user) => {
            setAdminUser(user);
            setAdminRoute('dashboard');
          }}
          onBackToStore={handleCloseAdmin}
        />
      );
    }

    return (
      <>
        <AdminLayout
          currentRoute={adminRoute}
          editProductId={adminEditProductId}
          onNavigate={handleAdminNavigate}
          onLogout={() => {
            setAdminUser(null);
            handleCloseAdmin();
          }}
          onViewLiveStore={handleCloseAdmin}
          onPreviewProduct={(product) => setSelectedProduct(product)}
        />

        {/* Product Preview Modal inside Admin */}
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </>
    );
  }

  // Otherwise, render the Public Storefront
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1E232A]">
      {/* Top Banner */}
      <div className="bg-[#24101A] text-[#D8C2A0] py-1.5 px-4 text-center text-[10.5px] sm:text-xs font-sans tracking-[0.16em] uppercase flex items-center justify-center gap-2 border-b border-white/5">
        <span>Direct WhatsApp Ordering Available</span>
        <span className="hidden sm:inline opacity-60">•</span>
        <span className="hidden sm:inline">Pakistani Couture &amp; Luxury Accessories</span>
      </div>

      {/* Sticky Header */}
      <Header
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenSearch={() => setIsSearchOpen(true)}
        settings={settings}
      />

      {/* Primary Page Router */}
      <main className="flex-grow">
        {activePage === 'home' && (
          <>
            {/* 1. HERO */}
            <Hero
              setActivePage={setActivePage}
              onExploreCategories={scrollToCategories}
              settings={settings}
            />

            {/* 2. SHOP BY CATEGORY */}
            <FeaturedCategories
              categories={categories}
              onSelectCategory={handleCategorySelectFromHome}
            />

            {/* 3. NEW ARRIVALS */}
            <NewArrivals
              products={products}
              onViewProduct={(p) => setSelectedProduct(p)}
              setActivePage={setActivePage}
            />

            {/* 5. FEATURED COLLECTION */}
            <FeaturedCollection
              products={products}
              onViewProduct={(p) => setSelectedProduct(p)}
              setActivePage={setActivePage}
            />

            {/* 6. BRAND STORY / ABOUT + WHY MARYAM TRADE CENTER + CTA */}
            <HomeStoryAndValues setActivePage={setActivePage} />
          </>
        )}

        {activePage === 'shop' && (
          <ShopView
            products={products}
            categories={categories}
            onViewProduct={(p) => setSelectedProduct(p)}
            initialCategory={selectedCategorySlug}
          />
        )}

        {activePage === 'categories' && (
          <CategoriesView
            products={products}
            categories={categories}
            onViewProduct={(p) => setSelectedProduct(p)}
            selectedCategorySlug={selectedCategorySlug}
            onSelectCategory={(slug) => setSelectedCategorySlug(slug)}
          />
        )}

        {activePage === 'about' && <AboutView setActivePage={setActivePage} />}

        {activePage === 'contact' && <ContactView settings={settings} />}
      </main>

      {/* Footer with small discreet ADMIN link */}
      <Footer
        setActivePage={setActivePage}
        onSelectCategory={handleCategorySelectFromHome}
        onOpenAdmin={handleOpenAdmin}
        settings={settings}
      />

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp settings={settings} />

      {/* Product Detail Modal with Full WhatsApp Ordering flow */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />
    </div>
  );
}
