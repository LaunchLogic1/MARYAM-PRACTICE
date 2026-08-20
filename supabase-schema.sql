-- ==============================================================================
-- MARYAM TRADE CENTER — COMPLETE SUPABASE PRODUCTION MIGRATION SCRIPT
-- Project ID: nrdbencwwogpcsqwbcle
-- Single Source of Truth for Store Catalog, Categories, Settings & Media
-- Safe to execute directly in the Supabase SQL Editor
-- ==============================================================================

-- 1. Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 3. CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT DEFAULT '',
    description TEXT DEFAULT '',
    image_url TEXT NOT NULL,
    item_count INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categories trigger for updated_at
DROP TRIGGER IF EXISTS trigger_categories_updated_at ON public.categories;
CREATE TRIGGER trigger_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 4. PRODUCTS TABLE (CENTRAL PRODUCTION STORE CATALOG)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_id TEXT NOT NULL,
    category_label TEXT DEFAULT 'Suits',
    price NUMERIC(12, 2),
    sale_price NUMERIC(12, 2),
    formatted_price TEXT,
    description TEXT DEFAULT '',
    short_description TEXT DEFAULT '',
    fabric_details TEXT DEFAULT '',
    image_url TEXT NOT NULL,
    additional_images TEXT[] DEFAULT '{}',
    stock INTEGER DEFAULT 10,
    availability TEXT DEFAULT 'in_stock',
    in_stock BOOLEAN DEFAULT true,
    sku TEXT NOT NULL,
    sizes TEXT[] DEFAULT '{}',
    colors JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    whatsapp_number TEXT,
    created_by TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products trigger for updated_at
DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Optimized indexes for lightning-fast public catalog queries & search
CREATE INDEX IF NOT EXISTS idx_products_is_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_new_arrival ON public.products(is_new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON public.products(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- ==============================================================================
-- 5. WEBSITE SETTINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.website_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    business_name TEXT DEFAULT 'Maryam Trade Center',
    tagline TEXT DEFAULT 'CARRY THE MOMENT',
    currency_symbol TEXT DEFAULT 'Rs.',
    footer_description TEXT DEFAULT 'Maryam Trade Center is a premier Pakistani fashion and accessories catalog.',
    instagram_url TEXT DEFAULT 'https://www.instagram.com/maryam12345688901?utm_source=qr&igsh=bzM1czV1d3Y5dTRo',
    facebook_url TEXT DEFAULT 'https://www.facebook.com/profile.php?id=61593629782975',
    whatsapp_number TEXT DEFAULT '923001234567',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Settings trigger for updated_at
DROP TRIGGER IF EXISTS trigger_website_settings_updated_at ON public.website_settings;
CREATE TRIGGER trigger_website_settings_updated_at
    BEFORE UPDATE ON public.website_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert default website configuration if not already present
INSERT INTO public.website_settings (id, business_name, tagline, currency_symbol, footer_description, instagram_url, facebook_url)
VALUES (
    'primary',
    'Maryam Trade Center',
    'CARRY THE MOMENT',
    'Rs.',
    'Maryam Trade Center is a premier Pakistani fashion and accessories catalog featuring luxury unstitched suits, designer pret, handbags, and heirloom craftsmanship with direct WhatsApp customer assistance.',
    'https://www.instagram.com/maryam12345688901?utm_source=qr&igsh=bzM1czV1d3Y5dTRo',
    'https://www.facebook.com/profile.php?id=61593629782975'
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 6. WHATSAPP INQUIRIES & CLICKS TRACKING TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
    id TEXT PRIMARY KEY,
    product_id TEXT,
    product_name TEXT,
    product_sku TEXT,
    price NUMERIC(12, 2),
    selected_size TEXT,
    selected_color TEXT,
    source_url TEXT,
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inquiries_timestamp ON public.inquiries(timestamp DESC);

-- ==============================================================================
-- 7. ADMIN PROFILES & ROLES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin' NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) ACTIVATION & POLICIES
-- ==============================================================================

-- Enable RLS on all public tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies for idempotency
DROP POLICY IF EXISTS "Public can view published products" ON public.products;
DROP POLICY IF EXISTS "Authenticated admins have full access to products" ON public.products;

DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated admins have full access to categories" ON public.categories;

DROP POLICY IF EXISTS "Public can view website settings" ON public.website_settings;
DROP POLICY IF EXISTS "Authenticated admins have full access to website settings" ON public.website_settings;

DROP POLICY IF EXISTS "Public can insert inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Authenticated admins have full access to inquiries" ON public.inquiries;

DROP POLICY IF EXISTS "Admins can view profiles" ON public.admin_profiles;

-- --- PRODUCTS POLICIES ---
-- 1. Public unauthenticated visitors can only view published products
CREATE POLICY "Public can view published products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- 2. Authenticated administrators have full write/read access to all products
CREATE POLICY "Authenticated admins have full access to products"
ON public.products
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- --- CATEGORIES POLICIES ---
-- 1. Public unauthenticated visitors can view active categories
CREATE POLICY "Public can view active categories"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (is_active = true OR is_published = true);

-- 2. Authenticated administrators have full access to categories
CREATE POLICY "Authenticated admins have full access to categories"
ON public.categories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- --- WEBSITE SETTINGS POLICIES ---
-- 1. Public can read website settings
CREATE POLICY "Public can view website settings"
ON public.website_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- 2. Authenticated administrators can manage website settings
CREATE POLICY "Authenticated admins have full access to website settings"
ON public.website_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- --- INQUIRIES POLICIES ---
-- 1. Anyone can log customer inquiry interactions
CREATE POLICY "Public can insert inquiries"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 2. Authenticated administrators can view and manage inquiries
CREATE POLICY "Authenticated admins have full access to inquiries"
ON public.inquiries
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- --- ADMIN PROFILES POLICIES ---
CREATE POLICY "Admins can view profiles"
ON public.admin_profiles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 9. SUPABASE STORAGE BUCKET: product-images
-- ==============================================================================

-- Create public storage bucket if not existing
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    52428800, -- 50 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 52428800;

-- Clean up storage policies
DROP POLICY IF EXISTS "Public Access product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Admin Upload product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Admin Update product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Admin Delete product-images" ON storage.objects;

-- Public can view and download product images
CREATE POLICY "Public Access product-images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');

-- Authenticated administrators can upload images
CREATE POLICY "Authenticated Admin Upload product-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Authenticated administrators can update images
CREATE POLICY "Authenticated Admin Update product-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- Authenticated administrators can delete images
CREATE POLICY "Authenticated Admin Delete product-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- ==============================================================================
-- 10. GRANT SCHEMA PERMISSIONS
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.website_settings TO anon, authenticated;
GRANT INSERT ON public.inquiries TO anon, authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;
