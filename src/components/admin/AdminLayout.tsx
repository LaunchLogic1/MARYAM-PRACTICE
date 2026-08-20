import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  MessageCircle, 
  Sparkles, 
  Phone, 
  Settings as SettingsIcon, 
  Image as ImageIcon, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  ShieldCheck, 
  User,
  ChevronRight
} from 'lucide-react';
import { AdminRoute, Product } from '../../types';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminProductsView } from './AdminProductsView';
import { AdminProductEditor } from './AdminProductEditor';
import { AdminCategoriesView } from './AdminCategoriesView';
import { AdminInquiriesView } from './AdminInquiriesView';
import { AdminHomepageView } from './AdminHomepageView';
import { AdminContactView } from './AdminContactView';
import { AdminSettingsView } from './AdminSettingsView';
import { AdminBrandingView } from './AdminBrandingView';
import { AdminMediaLibraryView } from './AdminMediaLibraryView';
import { api } from '../../services/api';

interface AdminLayoutProps {
  currentRoute: AdminRoute;
  editProductId?: string;
  onNavigate: (route: AdminRoute, editProductId?: string) => void;
  onLogout: () => void;
  onViewLiveStore: () => void;
  onPreviewProduct: (product: Product) => void;
}

export function AdminLayout({
  currentRoute,
  editProductId,
  onNavigate,
  onLogout,
  onViewLiveStore,
  onPreviewProduct,
}: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { route: AdminRoute; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { route: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { route: 'products', label: 'Products', icon: Package },
    { route: 'categories', label: 'Categories', icon: Layers },
    { route: 'branding', label: 'Branding & Logo', icon: ShieldCheck },
    { route: 'inquiries', label: 'WhatsApp Inquiries', icon: MessageCircle },
    { route: 'homepage', label: 'Homepage & Hero', icon: Sparkles },
    { route: 'contact', label: 'Contact & WhatsApp', icon: Phone },
    { route: 'settings', label: 'Website Settings', icon: SettingsIcon },
    { route: 'media', label: 'Media Library', icon: ImageIcon },
  ];

  const handleNavClick = (route: AdminRoute) => {
    onNavigate(route);
    setIsMobileMenuOpen(false);
  };

  const handleLogoutClick = async () => {
    await api.logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#24101A] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EBE3D5] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#421C2D] hover:bg-[#FAF8F5] transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Brand & Admin Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#421C2D] text-[#BFA36D] flex items-center justify-center font-serif text-sm font-bold shadow-xs">
              M
            </div>
            <div>
              <h1 className="font-serif text-sm sm:text-base font-semibold text-[#421C2D] tracking-wide leading-tight">
                MARYAM TRADE CENTER
              </h1>
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#BFA36D] font-bold block">
                ADMIN PANEL CMS
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E5DDD0] text-xs font-sans text-[#421C2D]">
            <User className="w-3.5 h-3.5 text-[#BFA36D]" />
            <span className="font-semibold">maryam</span>
          </div>

          {/* View Live Store Button */}
          <button
            onClick={onViewLiveStore}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E5DDD0] text-[#421C2D] text-xs font-sans font-semibold tracking-wide transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#BFA36D]" />
            <span className="hidden sm:inline">View Public Store</span>
            <span className="sm:hidden">Store</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogoutClick}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-sans font-semibold transition-all flex items-center gap-1.5"
            title="Logout of admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-[#EBE3D5] p-5 justify-between shrink-0">
          <div className="space-y-1.5">
            <p className="text-[10px] font-sans uppercase tracking-widest text-[#9A8C94] font-bold px-3 py-1">
              Store Management
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentRoute === item.route ||
                (item.route === 'products' && (currentRoute === 'products-new' || currentRoute === 'products-edit'));

              return (
                <button
                  key={item.route}
                  onClick={() => handleNavClick(item.route)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans font-medium transition-all text-left ${
                    isActive
                      ? 'bg-[#421C2D] text-white font-semibold shadow-xs'
                      : 'text-[#5A4B54] hover:bg-[#FAF8F5] hover:text-[#421C2D]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#BFA36D]' : 'text-[#7A6B74]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#BFA36D]" />}
                </button>
              );
            })}
          </div>

          {/* Quick info in sidebar footer */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5DDD0] text-center space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#BFA36D] block">
              WhatsApp-Only Store
            </span>
            <p className="text-[11px] font-sans text-[#7A6B74]">
              No online checkout • Orders completed directly in WhatsApp
            </p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full p-6 flex flex-col justify-between shadow-2xl animate-fade-in">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-[#EBE3D5]">
                  <div>
                    <h3 className="font-serif text-sm font-bold text-[#421C2D]">ADMIN MENU</h3>
                    <p className="text-[10px] text-[#BFA36D] uppercase tracking-wider font-bold">Maryam Trade Center</p>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-[#7A6B74]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      currentRoute === item.route ||
                      (item.route === 'products' && (currentRoute === 'products-new' || currentRoute === 'products-edit'));

                    return (
                      <button
                        key={item.route}
                        onClick={() => handleNavClick(item.route)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-sans text-left ${
                          isActive
                            ? 'bg-[#421C2D] text-white font-semibold'
                            : 'text-[#5A4B54] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#BFA36D]' : 'text-[#7A6B74]'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#EBE3D5] space-y-2">
                <button
                  onClick={onViewLiveStore}
                  className="w-full py-2.5 rounded-xl bg-[#FAF8F5] text-[#421C2D] border border-[#E5DDD0] text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#BFA36D]" />
                  <span>View Public Store</span>
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {currentRoute === 'dashboard' && <AdminDashboardView onNavigate={onNavigate} />}
          {currentRoute === 'products' && (
            <AdminProductsView onNavigate={onNavigate} onPreviewProduct={onPreviewProduct} />
          )}
          {(currentRoute === 'products-new' || currentRoute === 'products-edit') && (
            <AdminProductEditor
              productId={editProductId}
              onNavigate={onNavigate}
              onPreviewProduct={onPreviewProduct}
            />
          )}
          {currentRoute === 'categories' && <AdminCategoriesView onNavigate={onNavigate} />}
          {currentRoute === 'branding' && <AdminBrandingView />}
          {currentRoute === 'inquiries' && <AdminInquiriesView />}
          {currentRoute === 'homepage' && <AdminHomepageView onNavigate={onNavigate} />}
          {currentRoute === 'contact' && <AdminContactView />}
          {currentRoute === 'settings' && <AdminSettingsView />}
          {currentRoute === 'media' && <AdminMediaLibraryView />}
        </main>
      </div>
    </div>
  );
}
