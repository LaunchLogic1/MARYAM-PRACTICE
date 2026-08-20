import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Eye, 
  Trash2, 
  History, 
  RotateCcw,
  Sparkles,
  Layers,
  Smartphone,
  Monitor
} from 'lucide-react';
import { WebsiteSettings, LogoHistoryItem } from '../../types';
import { api } from '../../services/api';
import { OfficialLogo } from '../OfficialLogo';

interface AdminBrandingViewProps {
  onLogoUpdated?: (newLogoUrl: string) => void;
}

export function AdminBrandingView({ onLogoUpdated }: AdminBrandingViewProps) {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Replace Confirmation Modal
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activePreviewBg, setActivePreviewBg] = useState<'light' | 'dark' | 'cream'>('light');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await api.getSettings();
      setSettings(data);
    } catch (err: any) {
      setErrorMessage('Failed to load branding settings: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (file.type && !allowed.includes(file.type) && !file.name.match(/\.(png|jpe?g|webp|svg)$/i)) {
      setErrorMessage('Invalid file type. Please upload a PNG, JPG, WebP, or SVG file.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds 15MB limit. Please upload a smaller high-resolution image.');
      return;
    }

    setErrorMessage('');
    const objectUrl = URL.createObjectURL(file);
    setPendingFile(file);
    setPendingPreviewUrl(objectUrl);

    // If an existing logo is already set, show replace confirmation modal
    if (settings?.logo || settings?.logoUrl) {
      setShowConfirmModal(true);
    } else {
      // Direct upload
      executeLogoUpload(file);
    }
  };

  const executeLogoUpload = async (file: File) => {
    setIsUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // 1. Upload to persistent cloud storage
      const res = await api.uploadImages([file]);
      if (!res.urls || res.urls.length === 0) {
        throw new Error('Image upload failed to return a valid URL');
      }
      const newLogoUrl = res.urls[0];

      // 2. Prepare logo history
      const currentHistory: LogoHistoryItem[] = settings?.logoHistory || [];
      const newHistoryItem: LogoHistoryItem = {
        id: `logo_${Date.now()}`,
        url: newLogoUrl,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        size: file.size,
      };

      const updatedHistory = [newHistoryItem, ...currentHistory];

      // 3. Save to database
      const updatedSettings = await api.updateSettings({
        logo: newLogoUrl,
        logoUrl: newLogoUrl,
        logoHistory: updatedHistory,
      });

      setSettings(updatedSettings);
      setSuccessMessage('Official Website Logo updated successfully! Changes are live worldwide.');
      
      if (onLogoUpdated) {
        onLogoUpdated(newLogoUrl);
      }

      // Update favicon where technically appropriate
      updateFavicon(newLogoUrl);

      setShowConfirmModal(false);
      setPendingFile(null);
      setPendingPreviewUrl(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload official logo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const updateFavicon = (url: string) => {
    try {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = url;
    } catch (e) {
      console.warn('Could not set favicon', e);
    }
  };

  const handleRollbackLogo = async (historyItem: LogoHistoryItem) => {
    if (!window.confirm(`Restore logo uploaded on ${new Date(historyItem.uploadedAt).toLocaleDateString()} as the active official logo?`)) {
      return;
    }

    try {
      setIsUploading(true);
      const updated = await api.updateSettings({
        logo: historyItem.url,
        logoUrl: historyItem.url,
      });
      setSettings(updated);
      setSuccessMessage('Logo version restored successfully!');
      if (onLogoUpdated) {
        onLogoUpdated(historyItem.url);
      }
      updateFavicon(historyItem.url);
    } catch (err: any) {
      setErrorMessage('Failed to restore logo: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteHistoryItem = async (historyId: string) => {
    if (!window.confirm('Delete this historical logo record?')) return;
    if (!settings) return;

    try {
      const updatedHistory = (settings.logoHistory || []).filter((h) => h.id !== historyId);
      const updated = await api.updateSettings({
        logoHistory: updatedHistory,
      });
      setSettings(updated);
      setSuccessMessage('Historical logo removed from archive.');
    } catch (err: any) {
      setErrorMessage('Failed to delete history item: ' + err.message);
    }
  };

  const currentLogo = settings?.logo || settings?.logoUrl;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#421C2D]/30 border-t-[#421C2D] rounded-full animate-spin" />
          <span className="text-xs text-[#6B5E65] font-medium">Loading branding settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto font-sans" id="admin-branding-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#EBE3D5]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#BFA36D]">
              Brand Identity &amp; Assets
            </span>
            <span className="text-[10px] bg-[#EAE2D5] text-[#421C2D] px-2 py-0.5 rounded-full font-semibold">
              Live Global Sync
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#421C2D]">
            Official Website Logo
          </h1>
          <p className="text-sm text-[#6B5E65] mt-1 max-w-2xl">
            Upload and manage the official Maryam Trade Center brand logo. The uploaded logo is the exact source of truth across desktop header, mobile header, footer, mobile drawer, and browser tab.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            id="admin-upload-logo-top-button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#421C2D] text-white hover:bg-[#321422] font-medium text-xs tracking-wider uppercase transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#BFA36D]" />
            <span>{currentLogo ? 'Replace Logo' : 'Upload Logo'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1">
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-700 hover:text-rose-900 text-xs font-bold px-2 py-1">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Current Logo & Multi-Context Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Current Official Logo & Upload Card (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-[#EBE3D5] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-bold text-[#421C2D] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#BFA36D]" />
                Current Official Logo
              </h2>
              <span className="text-[11px] font-sans font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Active on Live Website
              </span>
            </div>

            {/* Logo Preview Canvas with background toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#6B5E65]">
                <span>Preview canvas background:</span>
                <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-lg border border-[#EBE3D5]">
                  <button
                    onClick={() => setActivePreviewBg('light')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      activePreviewBg === 'light' ? 'bg-white shadow-2xs text-[#421C2D]' : 'text-[#6B5E65]'
                    }`}
                  >
                    White
                  </button>
                  <button
                    onClick={() => setActivePreviewBg('cream')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      activePreviewBg === 'cream' ? 'bg-[#FAF8F5] shadow-2xs text-[#421C2D]' : 'text-[#6B5E65]'
                    }`}
                  >
                    Warm Sand
                  </button>
                  <button
                    onClick={() => setActivePreviewBg('dark')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      activePreviewBg === 'dark' ? 'bg-[#24101A] text-[#D8C2A0] shadow-2xs' : 'text-[#6B5E65]'
                    }`}
                  >
                    Dark Wine
                  </button>
                </div>
              </div>

              {/* The Visual Stage */}
              <div 
                className={`w-full min-h-[220px] rounded-xl border border-dashed border-[#D4C8B8] flex items-center justify-center p-8 transition-colors ${
                  activePreviewBg === 'light' 
                    ? 'bg-white' 
                    : activePreviewBg === 'cream' 
                    ? 'bg-[#FDFBF7]' 
                    : 'bg-[#24101A]'
                }`}
              >
                {currentLogo ? (
                  <div className="flex flex-col items-center gap-3">
                    <img
                      src={currentLogo}
                      alt="Current Official Logo"
                      referrerPolicy="no-referrer"
                      className="max-h-24 max-w-full object-contain drop-shadow-xs"
                    />
                    <span className={`text-[10.5px] font-sans tracking-wider uppercase ${
                      activePreviewBg === 'dark' ? 'text-white/60' : 'text-[#8A7B84]'
                    }`}>
                      Official Source Asset
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-4">
                    <OfficialLogo size="lg" variant={activePreviewBg === 'dark' ? 'light' : 'full'} />
                    <span className="text-xs text-[#8A7B84] mt-3 font-medium">
                      Built-in official architectural emblem active. Upload your custom logo file above.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-6 pt-5 border-t border-[#F0EAE1] flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#6B5E65]">
                {currentLogo ? (
                  <span className="font-medium text-[#421C2D]">Status: Custom official asset active</span>
                ) : (
                  <span>Using default brand vector emblem</span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  id="admin-replace-logo-button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#D4C8B8] hover:bg-[#F3EFEA] text-[#421C2D] text-xs font-semibold tracking-wider uppercase transition-all shadow-2xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                  <span>Replace Logo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Version Safety & Archive */}
          <div className="bg-white rounded-2xl border border-[#EBE3D5] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-base font-bold text-[#421C2D] flex items-center gap-2">
                <History className="w-4 h-4 text-[#BFA36D]" />
                Logo Version Safety &amp; History
              </h2>
              <span className="text-xs text-[#8A7B84]">
                {(settings?.logoHistory || []).length} version(s) saved
              </span>
            </div>
            <p className="text-xs text-[#6B5E65] mb-4">
              Previous logos are preserved safely so you can restore them instantly without accidental file loss.
            </p>

            {(!settings?.logoHistory || settings.logoHistory.length === 0) ? (
              <div className="p-6 text-center border border-[#F0EAE1] rounded-xl bg-[#FAF8F5] text-xs text-[#8A7B84]">
                No historical versions yet. When you upload new logos, older versions will appear here safely.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {settings.logoHistory.map((item, idx) => {
                  const isCurrent = (settings.logo === item.url || settings.logoUrl === item.url);
                  return (
                    <div
                      key={item.id || idx}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        isCurrent
                          ? 'bg-[#FDFBF7] border-[#BFA36D]/60 ring-1 ring-[#BFA36D]/30'
                          : 'bg-white border-[#EBE3D5] hover:border-[#D4C8B8]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 bg-[#FAF8F5] border border-[#EBE3D5] rounded-lg p-1 flex items-center justify-center shrink-0">
                          <img
                            src={item.url}
                            alt="Logo version"
                            referrerPolicy="no-referrer"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#421C2D]">
                              {item.originalName || `Logo Version #${settings.logoHistory!.length - idx}`}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#8A7B84]">
                            Uploaded {new Date(item.uploadedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!isCurrent && (
                          <button
                            onClick={() => handleRollbackLogo(item)}
                            title="Restore this logo as active"
                            className="p-1.5 text-xs text-[#421C2D] hover:bg-[#FAF8F5] rounded-lg border border-[#EBE3D5] flex items-center gap-1 font-medium transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[#BFA36D]" />
                            <span className="hidden sm:inline">Restore</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteHistoryItem(item.id)}
                          title="Remove from history"
                          className="p-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Multi-Context Live Previews (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#EBE3D5] p-6 shadow-xs">
            <h2 className="font-serif text-base font-bold text-[#421C2D] flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-[#BFA36D]" />
              Live Context Previews
            </h2>
            <p className="text-xs text-[#6B5E65] mb-5">
              Verify how the official logo renders across the public website components in real time.
            </p>

            {/* Context 1: Desktop Sticky Header */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#421C2D]">
                <span className="flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-[#BFA36D]" />
                  1. Desktop Header (Light Glass)
                </span>
                <span className="text-[10px] text-[#8A7B84] uppercase">Sticky Top</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#EBE3D5] shadow-2xs flex items-center justify-between">
                <OfficialLogo customLogoUrl={currentLogo} size="sm" />
                <div className="flex items-center gap-2 opacity-50 text-[10px] font-sans uppercase">
                  <span>Shop</span>
                  <span>Categories</span>
                  <span>Contact</span>
                </div>
              </div>
            </div>

            {/* Context 2: Mobile Header */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#421C2D]">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#BFA36D]" />
                  2. Mobile Header &amp; Drawer
                </span>
                <span className="text-[10px] text-[#8A7B84] uppercase">Mobile View</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#EBE3D5] flex items-center justify-between">
                <OfficialLogo customLogoUrl={currentLogo} size="sm" showSubtitle={false} />
                <div className="w-6 h-6 rounded-md bg-[#421C2D]/10 flex items-center justify-center text-[10px]">
                  ☰
                </div>
              </div>
            </div>

            {/* Context 3: Dark Luxury Footer */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#421C2D]">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#BFA36D]" />
                  3. Luxury Brand Footer
                </span>
                <span className="text-[10px] text-[#8A7B84] uppercase">Dark Canvas</span>
              </div>
              <div className="p-4 rounded-xl bg-[#24101A] border border-[#3E1C2D] flex items-center justify-between">
                <OfficialLogo customLogoUrl={currentLogo} size="sm" variant="light" />
                <span className="text-[10px] text-[#BFA36D] uppercase tracking-widest font-sans">
                  Official
                </span>
              </div>
            </div>

            {/* Context 4: Favicon & Tab Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#421C2D]">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#BFA36D]" />
                  4. Browser Tab &amp; Favicon
                </span>
                <span className="text-[10px] text-[#8A7B84] uppercase">Meta</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EBE3D5] flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-white border border-[#EBE3D5] p-0.5 flex items-center justify-center">
                  {currentLogo ? (
                    <img src={currentLogo} alt="Favicon" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] font-bold text-[#421C2D]">M</span>
                  )}
                </div>
                <div className="text-xs truncate">
                  <span className="font-semibold text-[#421C2D] block truncate">
                    {settings?.businessName || 'Maryam Trade Center'}
                  </span>
                  <span className="text-[10.5px] text-[#8A7B84] block truncate">
                    {settings?.tagline || 'CARRY THE MOMENT'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Exact Fidelity Guideline Card */}
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E0D2] p-5 text-xs text-[#5A4B54] space-y-2">
            <h3 className="font-serif font-bold text-[#421C2D] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#BFA36D]" />
              Official Asset Guarantee
            </h3>
            <p>
              When you upload a logo, Maryam Trade Center renders the exact uploaded asset without altering colors, typography, or proportions.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[#6B5E65] pt-1">
              <li>Supported: High-res PNG, SVG, JPG, WebP.</li>
              <li>Transparent background PNG or SVG recommended for best aesthetics across all backgrounds.</li>
            </ul>
          </div>

        </div>

      </div>

      {/* Replace Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EBE3D5] text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#BFA36D]/20 text-[#BFA36D] flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#421C2D]">
                  Replace Official Logo?
                </h3>
                <p className="text-xs text-[#8A7B84]">
                  Confirm official website asset update
                </p>
              </div>
            </div>

            <p className="text-sm text-[#5A4B54] mb-4">
              Are you sure you want to replace the current official logo? The new logo will immediately become active across all public website pages worldwide.
            </p>

            {pendingPreviewUrl && (
              <div className="mb-5 p-4 rounded-xl bg-[#FAF8F5] border border-[#EBE3D5] flex flex-col items-center justify-center">
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#8A7B84] mb-2">
                  New Logo Preview
                </span>
                <img
                  src={pendingPreviewUrl}
                  alt="New logo candidate"
                  className="max-h-16 max-w-full object-contain"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingFile(null);
                  setPendingPreviewUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5A4B54] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => pendingFile && executeLogoUpload(pendingFile)}
                disabled={isUploading || !pendingFile}
                className="px-5 py-2.5 rounded-xl bg-[#421C2D] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#321422] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Replace Logo</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
