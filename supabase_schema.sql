-- SQL SCHEMA FOR AYEZZ GLOBAL (CLEAN DATASET - READY FOR REAL DATA)
-- SUPABASE POSTGRESQL (RELATIONAL MASTER-DETAIL CATEGORIES & SUB-CATEGORIES)

-- 1. DROP EXISTING TABLES IF RE-INITIALIZING
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.design_templates CASCADE;
DROP TABLE IF EXISTS public.fabric_types CASCADE;
DROP TABLE IF EXISTS public.cut_types CASCADE;
DROP TABLE IF EXISTS public.sub_categories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.store_settings CASCADE;

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

-- 3. RELATIONAL SUB-CATEGORIES TABLE (LINKED WITH ON DELETE CASCADE)
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

-- 5. FABRIC TYPES TABLE
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

-- 6. DESIGN TEMPLATES TABLE (WITH MULTI-PHOTO GALLERY)
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

-- 7. ORDERS TABLE
CREATE TABLE public.orders (
    id TEXT PRIMARY KEY,
    user_email TEXT,
    user_id TEXT,
    client_name TEXT NOT NULL,
    template_name TEXT NOT NULL,
    cut_type TEXT NOT NULL,
    fabric_material TEXT NOT NULL,
    size_breakdown JSONB DEFAULT '{}'::jsonb,
    total_qty INTEGER DEFAULT 1,
    unit_price NUMERIC(10, 2) DEFAULT 70.00,
    total_price NUMERIC(10, 2) DEFAULT 70.00,
    status TEXT DEFAULT 'Pesanan Diterima',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. USERS TABLE & AUTH AUTO-SYNC TRIGGER
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'customer'
  )
  ON CONFLICT (email) DO UPDATE
  SET full_name = EXCLUDED.full_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. STORE SETTINGS TABLE
CREATE TABLE public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    store_name TEXT DEFAULT 'AYEZZ GLOBAL',
    whatsapp_number TEXT DEFAULT '6287818310416',
    currencySymbol TEXT DEFAULT 'RM',
    min_order_qty INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DEFAULT STORE SETTINGS RECORD
INSERT INTO public.store_settings (id, store_name, whatsapp_number, currencySymbol, min_order_qty)
VALUES ('default', 'AYEZZ GLOBAL', '6287818310416', 'RM', 1)
ON CONFLICT (id) DO NOTHING;

-- 10. DISABLE ROW LEVEL SECURITY (RLS) FOR FULL ACCESS
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cut_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fabric_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings DISABLE ROW LEVEL SECURITY;

-- 11. GRANT FULL PERMISSIONS TO ALL ROLES
GRANT ALL ON TABLE public.categories TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.sub_categories TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.cut_types TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.fabric_types TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.design_templates TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.orders TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.store_settings TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.users TO anon, authenticated, postgres, service_role;

-- 12. STORAGE BUCKET POLICIES FOR 'ayezz-assets' (FULL PUBLIC UPLOAD/READ/DELETE ACCESS)
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

