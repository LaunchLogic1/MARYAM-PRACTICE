import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Layers, 
  MessageCircle, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  Phone,
  RefreshCw,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminRoute } from '../../types';

interface AdminDashboardViewProps {
  onNavigate: (route: AdminRoute, editProductId?: string) => void;
}

export function AdminDashboardView({ onNavigate }: AdminDashboardViewProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-[#421C2D] to-[#24101A] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md border border-[#58263D]">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-sans tracking-widest uppercase font-bold text-[#BFA36D]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Storefront Control Center</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-white font-normal">
            Welcome to Maryam Trade Center Admin
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#E2D5CC] leading-relaxed">
            Manage your live catalog, update categories and cover images, modify brand assets, and track direct WhatsApp ordering inquiries in real-time.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('products-new')}
            className="px-4 py-2.5 rounded-xl bg-[#BFA36D] hover:bg-[#A88D56] text-[#24101A] text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
          <button
            onClick={loadStats}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div 
          onClick={() => onNavigate('products')}
          className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EBE3D5] shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#7A6B74] mb-3">
            <span className="text-xs font-sans font-bold uppercase tracking-wider">Total Products</span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] text-[#421C2D] group-hover:bg-[#421C2D] group-hover:text-white transition-all flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#421C2D]">
            {stats?.totalPublishedProducts ?? '...'}
          </div>
          <div className="text-[11px] font-sans text-[#7A6B74] mt-1 flex items-center gap-1">
            <span>{stats?.totalDraftProducts || 0} drafts</span>
            <span>•</span>
            <span>{stats?.inStockCount || 0} in stock</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('categories')}
          className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EBE3D5] shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#7A6B74] mb-3">
            <span className="text-xs font-sans font-bold uppercase tracking-wider">Categories</span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] text-[#421C2D] group-hover:bg-[#421C2D] group-hover:text-white transition-all flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#421C2D]">
            {stats?.totalCategories ?? '...'}
          </div>
          <div className="text-[11px] font-sans text-[#7A6B74] mt-1">
            Handbags, Suits, Accessories, etc.
          </div>
        </div>

        <div 
          onClick={() => onNavigate('inquiries')}
          className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EBE3D5] shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#7A6B74] mb-3">
            <span className="text-xs font-sans font-bold uppercase tracking-wider">WhatsApp Clicks</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-all flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#421C2D]">
            {stats?.totalWhatsAppClicks ?? '...'}
          </div>
          <div className="text-[11px] font-sans text-emerald-700 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Direct buying intents</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('products')}
          className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EBE3D5] shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#7A6B74] mb-3">
            <span className="text-xs font-sans font-bold uppercase tracking-wider">Featured / New</span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] text-[#BFA36D] group-hover:bg-[#BFA36D] group-hover:text-[#24101A] transition-all flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#421C2D]">
            {stats?.featuredCount ?? 0} <span className="text-sm font-sans font-normal text-[#7A6B74]">feat.</span>
          </div>
          <div className="text-[11px] font-sans text-[#7A6B74] mt-1">
            {stats?.newArrivalsCount ?? 0} marked as New Arrivals
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div 
          onClick={() => onNavigate('branding')}
          className="p-5 rounded-2xl bg-white border border-[#EBE3D5] hover:border-[#BFA36D] transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex justify-between items-center">
            <h4 className="font-serif text-base text-[#421C2D] font-semibold">Branding &amp; Official Logo</h4>
            <ArrowUpRight className="w-4 h-4 text-[#BFA36D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <p className="text-xs font-sans text-[#7A6B74] leading-relaxed">
            Update store logo with custom uploads or choose refined typography branding presets.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('contact')}
          className="p-5 rounded-2xl bg-white border border-[#EBE3D5] hover:border-[#BFA36D] transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex justify-between items-center">
            <h4 className="font-serif text-base text-[#421C2D] font-semibold">WhatsApp &amp; Contact</h4>
            <ArrowUpRight className="w-4 h-4 text-[#BFA36D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <p className="text-xs font-sans text-[#7A6B74] leading-relaxed">
            Manage your official WhatsApp ordering number, direct business email, and operating hours.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('media')}
          className="p-5 rounded-2xl bg-white border border-[#EBE3D5] hover:border-[#BFA36D] transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex justify-between items-center">
            <h4 className="font-serif text-base text-[#421C2D] font-semibold">Media Library</h4>
            <ArrowUpRight className="w-4 h-4 text-[#BFA36D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <p className="text-xs font-sans text-[#7A6B74] leading-relaxed">
            Upload and organize product photos, luxury banner images, and category cover assets.
          </p>
        </div>
      </div>

      {/* Recent WhatsApp Inquiries Table */}
      <div className="bg-white rounded-3xl border border-[#EBE3D5] p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg text-[#421C2D] font-semibold">Recent WhatsApp Inquiries</h3>
            <p className="text-xs font-sans text-[#7A6B74]">Direct inquiries initiated from product and contact pages</p>
          </div>
          <button
            onClick={() => onNavigate('inquiries')}
            className="text-xs font-sans font-bold text-[#BFA36D] hover:underline uppercase tracking-wider"
          >
            View All Inquiries
          </button>
        </div>

        {stats?.recentInquiries && stats.recentInquiries.length > 0 ? (
          <div className="divide-y divide-[#F0EAE1] overflow-hidden">
            {stats.recentInquiries.map((inq: any) => (
              <div key={inq.id} className="py-3 flex items-center justify-between text-xs font-sans">
                <div className="space-y-0.5">
                  <span className="font-semibold text-[#421C2D]">{inq.productName}</span>
                  <div className="text-[11px] text-[#7A6B74] flex items-center gap-2">
                    <span>SKU: {inq.productSku || 'General'}</span>
                    {inq.selectedSize && <span>• Size: {inq.selectedSize}</span>}
                    {inq.selectedColor && <span>• Color: {inq.selectedColor}</span>}
                  </div>
                </div>
                <div className="text-right">
                  {inq.price && (
                    <span className="font-mono font-bold text-[#421C2D] block">
                      Rs. {inq.price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-[10px] text-[#A896A0]">
                    {new Date(inq.timestamp).toLocaleDateString()} {new Date(inq.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs font-sans text-[#7A6B74] bg-[#FAF8F5] rounded-2xl">
            No WhatsApp inquiries tracked yet. Clicks from visitors will appear here automatically.
          </div>
        )}
      </div>
    </div>
  );
}
