import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Upload, Trash2, Copy, Check, ExternalLink, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { MediaItem } from '../../types';

export function AdminMediaLibraryView() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await api.getMedia();
      setMedia(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setError('');
      const fileList = Array.from(files) as File[];
      const res = await api.uploadImages(fileList);
      setSuccess(`${res.urls?.length || fileList.length} image(s) uploaded successfully`);
      setTimeout(() => setSuccess(''), 4000);
      loadMedia();
    } catch (err: any) {
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this media item?')) return;
    try {
      await api.deleteMedia(id);
      setMedia((prev) => prev.filter((m) => m.id !== id));
      setSuccess('Image deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete image');
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#421C2D] font-normal">
            Media Library
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6B74]">
            Store and manage product photographs, category covers, and branding images
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 rounded-xl bg-[#421C2D] hover:bg-[#331523] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5 text-[#BFA36D]" />
            <span>{uploading ? 'Uploading...' : 'Upload Images'}</span>
          </button>
          <button
            onClick={loadMedia}
            className="p-2 rounded-xl bg-white border border-[#E5DDD0] text-[#421C2D] hover:bg-[#FAF8F5] cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
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

      <div className="bg-white rounded-3xl border border-[#EBE3D5] p-6 space-y-4 shadow-2xs">
        {media.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden border border-[#EBE3D5] bg-[#FAF8F5] flex flex-col justify-between"
              >
                <div className="aspect-square w-full overflow-hidden bg-stone-100 relative">
                  <img
                    src={item.url}
                    alt={item.originalName || 'Media item'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      onClick={() => copyUrl(item.url, item.id)}
                      className="p-2 rounded-lg bg-white/90 text-[#421C2D] hover:bg-white text-xs font-semibold shadow-xs"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
                      title="Delete Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-2 text-[10px] text-[#7A6B74] truncate bg-white border-t border-[#EBE3D5]">
                  <span className="truncate block font-medium text-[#421C2D]">
                    {item.originalName || item.filename}
                  </span>
                  <span>{item.size ? `${Math.round(item.size / 1024)} KB` : ''}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E5DDD0]">
            <ImageIcon className="w-10 h-10 text-[#A896A0] mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-[#421C2D]">No media items uploaded yet</h4>
              <p className="text-xs text-[#7A6B74]">
                Upload product photos and banner assets to access them easily across the catalog.
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-[#421C2D] text-white text-xs font-semibold inline-flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5 text-[#BFA36D]" />
              <span>Choose Files to Upload</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
