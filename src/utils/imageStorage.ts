/**
 * Robust Image Processing & Permanent Persistence Utility
 * Converts uploaded images to permanent, optimized Base64 Data URLs and stores in IndexedDB + LocalStorage.
 * Never uses ephemeral `blob:` URLs for persistent state.
 */

const DB_NAME = 'mtc_permanent_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_files';

// Default elegant high-resolution curated backups for broken URLs or placeholder fallbacks
export const FALLBACK_PRODUCT_IMAGES: Record<string, string> = {
  suits: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
  'womens-collection': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
  handbags: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop',
  accessories: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop',
  'new-arrivals': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
};

// Initialize IndexedDB
function getDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Compress and convert a File or Blob into a permanent Base64 Data URL
 */
export async function fileToPermanentDataUrl(file: File, maxDimension = 1400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const result = readerEvent.target?.result;
      if (typeof result !== 'string') {
        return reject(new Error('Failed to read file as data URL'));
      }

      // If SVG or small file, return original base64 directly
      if (file.type === 'image/svg+xml' || file.size < 150 * 1024) {
        return resolve(result);
      }

      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            return resolve(result);
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export as JPEG or PNG
          const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const compressedDataUrl = canvas.toDataURL(mimeType, quality);
          resolve(compressedDataUrl);
        } catch {
          resolve(result);
        }
      };

      img.onerror = () => {
        resolve(result);
      };

      img.src = result;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Save image to IndexedDB for ultra-resilient permanent local caching
 */
export async function persistImageToIndexedDB(id: string, dataUrl: string, metadata: Record<string, any> = {}): Promise<void> {
  const db = await getDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({
        id,
        dataUrl,
        ...metadata,
        updatedAt: new Date().toISOString(),
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Verify if a URL is an invalid/dead blob URL
 */
export function isDeadBlobUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim();
  if (trimmed === '') return true;
  if (trimmed.startsWith('blob:')) return true; // Blob URLs are transient and break on refresh
  return false;
}

/**
 * Sanitize an image URL to ensure it never renders as broken
 */
export function getSafeImageUrl(url?: string, categorySlug = 'suits'): string {
  if (!url || isDeadBlobUrl(url)) {
    return FALLBACK_PRODUCT_IMAGES[categorySlug] || FALLBACK_PRODUCT_IMAGES.default;
  }
  return url;
}
