import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';

const app = express();
const PORT = 3000;

// Body parser with generous limits for high-resolution images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure static public asset directories and uploads directories exist
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const PUBLIC_PRODUCTS_DIR = path.join(PUBLIC_DIR, 'products');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

[PUBLIC_DIR, PUBLIC_PRODUCTS_DIR, UPLOADS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use('/products', express.static(PUBLIC_PRODUCTS_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(PUBLIC_DIR));

// Helper: auth middleware
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Authentication token is missing.' });
  }

  const token = authHeader.substring(7);
  const session = db.validateSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }

  (req as any).user = session;
  next();
}

// Optional Auth Helper (extracts user if token exists)
function optionalAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const session = db.validateSession(token);
    if (session) {
      (req as any).user = session;
    }
  }
  next();
}

// ==========================================
// 1. AUTHENTICATION API
// ==========================================

app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const authResult = db.authenticate(username, password);
    if (!authResult) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    return res.json(authResult);
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

app.get('/api/auth/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.substring(7);
    const session = db.validateSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Session expired' });
    }
    return res.json({ id: session.userId, username: session.username });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to verify session' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      db.logout(token);
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Logout failed' });
  }
});

app.post('/api/auth/change-password', requireAuth, (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = (req as any).user;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required' });
    }
    const success = db.changePassword(user.userId, oldPassword, newPassword);
    if (!success) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }
    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

// Admin Team / Authorized Accounts API
app.get('/api/auth/users', requireAuth, (req, res) => {
  try {
    const users = db.getUsers();
    return res.json(users);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to list admin users' });
  }
});

app.post('/api/auth/users', requireAuth, (req, res) => {
  try {
    const { username, password } = req.body;
    const created = db.createUser(username, password);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to create admin user' });
  }
});

app.delete('/api/auth/users/:id', requireAuth, (req, res) => {
  try {
    const currentUser = (req as any).user;
    db.deleteUser(req.params.id, currentUser.userId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to delete admin user' });
  }
});

// ==========================================
// 2. PRODUCTS API (SHARED PRODUCTION DATABASE)
// ==========================================

// Public & Admin Products Query
app.get('/api/products', optionalAuth, (req, res) => {
  try {
    const user = (req as any).user;
    const { all, category, search, featured, newArrival } = req.query;

    // Only authenticated admins can fetch unpublished / draft products
    const includeUnpublished = Boolean(user && all === 'true');
    let products = db.getProducts(includeUnpublished);

    if (category && typeof category === 'string' && category !== 'all') {
      products = products.filter((p) => p.category === category);
    }

    if (featured === 'true') {
      products = products.filter((p) => p.featured || p.isFeatured);
    }

    if (newArrival === 'true') {
      products = products.filter((p) => p.newArrival || p.isNewArrival);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q)
      );
    }

    return res.json(products);
  } catch (err: any) {
    console.error('Error fetching products:', err);
    return res.status(500).json({ error: 'Failed to fetch products from database.' });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    return res.json(product);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch product.' });
  }
});

// Create Product in Production Database
app.post('/api/products', requireAuth, (req, res) => {
  try {
    const data = req.body;
    if (!data.name || data.name.trim() === '') {
      return res.status(400).json({ error: 'Product name is required.' });
    }

    const authUser = (req as any).user;
    const createdBy = authUser?.username || authUser?.email || 'admin';

    const newProduct = db.createProduct({
      ...data,
      createdBy: data.createdBy || createdBy,
    });
    return res.status(201).json(newProduct);
  } catch (err: any) {
    console.error('Error creating product:', err);
    return res.status(500).json({ error: err.message || 'Failed to insert product into database.' });
  }
});

// Update Product in Production Database
app.put('/api/products/:id', requireAuth, (req, res) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found in database.' });
    }
    return res.json(updated);
  } catch (err: any) {
    console.error('Error updating product:', err);
    return res.status(500).json({ error: err.message || 'Failed to update product in database.' });
  }
});

// Delete Product
app.delete('/api/products/:id', requireAuth, (req, res) => {
  try {
    const hardDelete = req.query.hard === 'true';
    const success = db.deleteProduct(req.params.id, hardDelete);
    if (!success) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete product.' });
  }
});

// Duplicate Product
app.post('/api/products/:id/duplicate', requireAuth, (req, res) => {
  try {
    const duplicate = db.duplicateProduct(req.params.id);
    if (!duplicate) {
      return res.status(404).json({ error: 'Product not found to duplicate.' });
    }
    return res.status(201).json(duplicate);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to duplicate product.' });
  }
});

// Reorder Products
app.post('/api/products/reorder', requireAuth, (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds array is required.' });
    }
    db.reorderProducts(orderedIds);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to reorder products.' });
  }
});

// ==========================================
// 3. CATEGORIES API
// ==========================================

app.get('/api/categories', (req, res) => {
  try {
    const categories = db.getCategories();
    return res.json(categories);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

app.post('/api/categories', requireAuth, (req, res) => {
  try {
    const newCat = db.createCategory(req.body);
    return res.status(201).json(newCat);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create category.' });
  }
});

app.put('/api/categories/:id', requireAuth, (req, res) => {
  try {
    const updated = db.updateCategory(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update category.' });
  }
});

app.delete('/api/categories/:id', requireAuth, (req, res) => {
  try {
    const success = db.deleteCategory(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete category.' });
  }
});

app.post('/api/categories/reorder', requireAuth, (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds array required' });
    }
    db.reorderCategories(orderedIds);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to reorder categories' });
  }
});

// ==========================================
// 4. SETTINGS API
// ==========================================

app.get('/api/settings', (req, res) => {
  try {
    const settings = db.getSettings();
    return res.json(settings);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to get settings.' });
  }
});

app.put('/api/settings', requireAuth, (req, res) => {
  try {
    const updated = db.updateSettings(req.body);
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// ==========================================
// 5. MEDIA & IMAGE UPLOAD API
// ==========================================

app.get('/api/media', requireAuth, (req, res) => {
  try {
    const media = db.getMedia();
    return res.json(media);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to get media.' });
  }
});

app.post('/api/media/upload', requireAuth, (req, res) => {
  try {
    const { images, files } = req.body;
    const uploadedUrls: string[] = [];
    const createdItems: any[] = [];

    const incoming = Array.isArray(images) ? images : Array.isArray(files) ? files : [];

    if (incoming.length === 0 && req.body.url) {
      incoming.push({ url: req.body.url, name: req.body.name || 'Uploaded image' });
    }

    if (incoming.length === 0 && req.body.dataUrl) {
      incoming.push({ dataUrl: req.body.dataUrl, name: req.body.name || 'Uploaded image' });
    }

    for (const item of incoming) {
      let rawDataUrl = '';
      const originalName = item.name || item.originalName || `product-image-${Date.now()}.jpg`;

      if (typeof item === 'string') {
        rawDataUrl = item;
      } else if (item.dataUrl && typeof item.dataUrl === 'string') {
        rawDataUrl = item.dataUrl;
      } else if (item.url && typeof item.url === 'string') {
        rawDataUrl = item.url;
      }

      if (!rawDataUrl) continue;

      let publicUrl = rawDataUrl;

      // If it's a base64 Data URL, persist it directly to production storage on disk and public website asset directory
      if (rawDataUrl.startsWith('data:image/')) {
        try {
          const matches = rawDataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
          if (matches) {
            let extension = matches[1].toLowerCase();
            if (extension === 'jpeg') extension = 'jpg';
            if (extension === 'svg+xml') extension = 'svg';
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            
            const sanitizedExt = extension.replace(/[^a-z0-9]/g, '') || 'jpg';
            const diskFileName = `product_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${sanitizedExt}`;

            // Save to public/products (for permanent Vite source asset packaging)
            const publicAssetPath = path.join(PUBLIC_PRODUCTS_DIR, diskFileName);
            fs.writeFileSync(publicAssetPath, buffer);

            // Also save to uploads directory
            const uploadsPath = path.join(UPLOADS_DIR, diskFileName);
            fs.writeFileSync(uploadsPath, buffer);

            // If dist directory exists, copy directly to dist/products for live production deployment
            const distProductsDir = path.join(process.cwd(), 'dist', 'products');
            if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
              if (!fs.existsSync(distProductsDir)) {
                fs.mkdirSync(distProductsDir, { recursive: true });
              }
              fs.writeFileSync(path.join(distProductsDir, diskFileName), buffer);
            }

            publicUrl = `/products/${diskFileName}`;
          }
        } catch (fsErr) {
          console.warn('Could not write image to disk, using data URL fallback:', fsErr);
        }
      }

      const mediaRecord = db.addMedia({
        id: `med_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        filename: originalName,
        originalName,
        url: publicUrl,
        uploadedAt: new Date().toISOString(),
        size: item.size || publicUrl.length,
        mimeType: item.mimeType || 'image/jpeg',
      });

      uploadedUrls.push(publicUrl);
      createdItems.push(mediaRecord);
    }

    if (uploadedUrls.length === 0) {
      return res.status(400).json({ error: 'No valid image data was received for upload.' });
    }

    return res.json({ urls: uploadedUrls, items: createdItems });
  } catch (err: any) {
    console.error('Media upload error:', err);
    return res.status(500).json({ error: err.message || 'Failed to process media upload.' });
  }
});

app.delete('/api/media/:id', requireAuth, (req, res) => {
  try {
    const success = db.deleteMedia(req.params.id);
    return res.json({ success });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete media.' });
  }
});

// ==========================================
// 6. ANALYTICS & INQUIRIES API
// ==========================================

app.post('/api/inquiries/track', (req, res) => {
  try {
    const tracked = db.trackWhatsAppClick(req.body);
    return res.json(tracked);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to track inquiry.' });
  }
});

app.get('/api/inquiries', requireAuth, (req, res) => {
  try {
    const list = db.getInquiryClicks();
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch inquiries.' });
  }
});

app.get('/api/dashboard/stats', requireAuth, (req, res) => {
  try {
    const stats = db.getDashboardStats();
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to get dashboard stats.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ==========================================
// 7. VITE MIDDLEWARE & STATIC SERVING
// ==========================================

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Maryam Trade Center Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
