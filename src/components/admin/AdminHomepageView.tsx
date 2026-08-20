import React, { useState, useEffect } from 'react';
import { Sparkles, Save, Upload, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { WebsiteSettings, AdminRoute } from '../../types';

interface AdminHomepageViewProps {
  onNavigate: (route: AdminRoute) => void;
}

export function AdminHomepageView({ onNavigate }: AdminHomepageViewProps) {
  const [settings, setSettings] = useState<WebsiteSettings>({});
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [heroButtonText, setHeroButtonText] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getSettings();
        setSettings(data);
        setHeroTitle(data.heroTitle || 'CARRY THE MOMENT');
        setHeroSubtitle(data.heroSubtitle || data.subtitle || 'GLOBAL COMMERCE | CONNECTING BUSINESSES');
        setHeroDescription(data.heroDescription || 'Elegance that moves with you.');
        setHeroButtonText(data.heroButtonText || 'EXPLORE COLLECTION');
        setHeroImage(data.heroImage || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1400&auto=format&fit=crop');
      } catch (err: any) {
        setError(err.message || 'Failed to load homepage settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      const updated = await api.updateSettings({
        heroTitle,
        heroSubtitle,
        heroDescription,
        heroButtonText,
        heroImage,
      });
      setSettings(updated);
      setSuccess('Homepage Hero settings saved successfully');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#421C2D] font-normal">
          Homepage &amp; Hero Editor
        </h2>
        <p className="text-xs sm:text-sm text-[#7A6B74]">
          Customize the main storefront banner, headline, editorial tagline, and background image
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#EBE3D5] p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D]">
              Hero Top Subtitle / Tagline
            </label>
            <input
              type="text"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="GLOBAL COMMERCE | CONNECTING BUSINESSES"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D]">
              Hero Main Headline (H1)
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder="CARRY THE MOMENT"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D]">
              Hero Secondary Description / Tagline
            </label>
            <input
              type="text"
              value={heroDescription}
              onChange={(e) => setHeroDescription(e.target.value)}
              placeholder="Elegance that moves with you."
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D]">
              CTA Button Text
            </label>
            <input
              type="text"
              value={heroButtonText}
              onChange={(e) => setHeroButtonText(e.target.value)}
              placeholder="EXPLORE COLLECTION"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#421C2D]">
              Hero Background Image URL
            </label>
            <input
              type="text"
              value={heroImage}
              onChange={(e) => setHeroImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DDD0] text-xs text-[#24101A] focus:outline-hidden focus:border-[#421C2D]"
            />
            {heroImage && (
              <div className="relative h-44 rounded-2xl overflow-hidden border border-[#E5DDD0] mt-2">
                <img src={heroImage} alt="Hero Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 text-white">
                  <span className="text-xs font-medium">Hero Banner Preview</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-[#F0EAE1] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#421C2D] hover:bg-[#331523] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#BFA36D]" />
            <span>{saving ? 'Saving...' : 'Save Homepage Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
