-- MASTER SQL SCHEMA FOR AYEZZ GLOBAL (SINGAPORE REGION - AP-SOUTHEAST-1 🇸🇬)
-- SUPABASE POSTGRESQL (FULL RELATIONAL SCHEMA & STORAGE BUCKET)

-- 1. DROP EXISTING TABLES IF RE-INITIALIZING
DROP TABLE IF EXISTS public.showcase_feature CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.design_templates CASCADE;
DROP TABLE IF EXISTS public.fabric_types CASCADE;
DROP TABLE IF EXISTS public.sleeve_types CASCADE;
DROP TABLE IF EXISTS public.cut_types CASCADE;
DROP TABLE IF EXISTS public.sub_categories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.store_settings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. MASTER CATEGORIES TABLE
CREATE TABLE public.categories (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    item_count TEXT DEFAULT '0 Jenis',
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RELATIONAL SUB-CATEGORIES TABLE
CREATE TABLE public.sub_categories (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CUT TYPES TABLE
CREATE TABLE public.cut_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    add_on_price NUMERIC(10, 2) DEFAULT 0.00,
    description TEXT,
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SLEEVE TYPES TABLE
CREATE TABLE public.sleeve_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    add_on_price NUMERIC(10, 2) DEFAULT 0.00,
    description TEXT,
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. FABRIC TYPES TABLE
CREATE TABLE public.fabric_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    base_price NUMERIC(10, 2) DEFAULT 70.00,
    tier TEXT DEFAULT 'Standard',
    gsm TEXT DEFAULT '150 GSM',
    features TEXT,
    description TEXT,
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. DESIGN TEMPLATES TABLE (WITH MULTI-PHOTO GALLERY)
CREATE TABLE public.design_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    sub_category TEXT,
    description TEXT,
    thumbnail TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ORDERS TABLE
CREATE TABLE public.orders (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    user_email TEXT,
    user_id TEXT,
    client_name TEXT NOT NULL,
    customer_phone TEXT,
    team_name TEXT,
    template_name TEXT NOT NULL,
    cut_type TEXT NOT NULL,
    fabric_material TEXT NOT NULL,
    cut_groups JSONB DEFAULT '[]'::jsonb,
    player_rows JSONB DEFAULT '[]'::jsonb,
    custom_logo_url TEXT,
    sponsor_logo_url TEXT,
    player_list_file_url TEXT,
    custom_design_ref_url TEXT,
    notes TEXT,
    size_breakdown JSONB DEFAULT '{}'::jsonb,
    total_qty INTEGER DEFAULT 1,
    unit_price NUMERIC(10, 2) DEFAULT 70.00,
    total_price NUMERIC(10, 2) DEFAULT 70.00,
    payment_status TEXT DEFAULT 'pending',
    payment_id TEXT,
    status TEXT DEFAULT 'Pesanan Diterima',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. USERS TABLE
CREATE TABLE public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. STORE SETTINGS TABLE
CREATE TABLE public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    store_name TEXT DEFAULT 'AYEZZ GLOBAL',
    whatsapp_number TEXT DEFAULT '6287818310416',
    currency_symbol TEXT DEFAULT 'RM',
    min_order_qty INTEGER DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.store_settings (id, store_name, whatsapp_number, currency_symbol, min_order_qty)
VALUES ('default', 'AYEZZ GLOBAL', '6287818310416', 'RM', 1)
ON CONFLICT (id) DO NOTHING;

-- 11. SHOWCASE FEATURE TABLE
CREATE TABLE public.showcase_feature (
    id TEXT PRIMARY KEY DEFAULT 'showcase_default',
    section_title TEXT DEFAULT 'Koleksi Produk Utama',
    headline TEXT DEFAULT 'Pengeluaran Cetakan Sublimasi AYEZZ GLOBAL',
    sub_headline TEXT DEFAULT 'Pilihan seragam custom berkualiti standard kilang.',
    cover_image TEXT,
    button_text TEXT DEFAULT 'Tonton Video',
    video_url TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. ENABLE RLS + CREATE PUBLIC ACCESS POLICIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cut_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleeve_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fabric_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_feature ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Full Access Categories" ON public.categories;
DROP POLICY IF EXISTS "Public Full Access SubCategories" ON public.sub_categories;
DROP POLICY IF EXISTS "Public Full Access CutTypes" ON public.cut_types;
DROP POLICY IF EXISTS "Public Full Access SleeveTypes" ON public.sleeve_types;
DROP POLICY IF EXISTS "Public Full Access FabricTypes" ON public.fabric_types;
DROP POLICY IF EXISTS "Public Full Access Templates" ON public.design_templates;
DROP POLICY IF EXISTS "Public Full Access Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Full Access Users" ON public.users;
DROP POLICY IF EXISTS "Public Full Access StoreSettings" ON public.store_settings;
DROP POLICY IF EXISTS "Public Full Access Showcase" ON public.showcase_feature;

CREATE POLICY "Public Full Access Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access SubCategories" ON public.sub_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access CutTypes" ON public.cut_types FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access SleeveTypes" ON public.sleeve_types FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access FabricTypes" ON public.fabric_types FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access Templates" ON public.design_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access Users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access StoreSettings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access Showcase" ON public.showcase_feature FOR ALL USING (true) WITH CHECK (true);

-- 13. STORAGE BUCKET POLICIES FOR 'ayezz-assets' (FULL PUBLIC ACCESS)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ayezz-assets', 'ayezz-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Storage Select Policy" ON storage.objects;
DROP POLICY IF EXISTS "Public Storage Insert Policy" ON storage.objects;
DROP POLICY IF EXISTS "Public Storage Update Policy" ON storage.objects;
DROP POLICY IF EXISTS "Public Storage Delete Policy" ON storage.objects;

CREATE POLICY "Public Storage Select Policy" ON storage.objects FOR SELECT USING (bucket_id = 'ayezz-assets');
CREATE POLICY "Public Storage Insert Policy" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ayezz-assets');
CREATE POLICY "Public Storage Update Policy" ON storage.objects FOR UPDATE USING (bucket_id = 'ayezz-assets');
CREATE POLICY "Public Storage Delete Policy" ON storage.objects FOR DELETE USING (bucket_id = 'ayezz-assets');
