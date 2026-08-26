-- SQL SCHEMA & DATA MIGRATION SCRIPT FOR AYEZZ GLOBAL
-- SUPABASE POSTGRESQL (RELATIONAL MASTER-DETAIL CATEGORIES & SUB-CATEGORIES)

-- 1. DROP EXISTING TABLES IF ANY
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.design_templates CASCADE;
DROP TABLE IF EXISTS public.fabric_types CASCADE;
DROP TABLE IF EXISTS public.cut_types CASCADE;
DROP TABLE IF EXISTS public.sub_categories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.store_settings CASCADE;

-- 2. CREATE MASTER CATEGORIES TABLE (6 MASTER CATEGORIES)
CREATE TABLE public.categories (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    item_count TEXT DEFAULT '0 Jenis',
    thumbnail TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE DEDICATED SUB-CATEGORIES TABLE (RELATIONAL CHILD TABLE)
CREATE TABLE public.sub_categories (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE CUT TYPES TABLE (WITH 1:1 THUMBNAIL COVER IMAGE)
CREATE TABLE public.cut_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    add_on_price NUMERIC(10, 2) DEFAULT 0.00,
    description TEXT,
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE FABRIC TYPES TABLE (WITH 1:1 THUMBNAIL, GSM, FEATURES & DESCRIPTION)
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

-- 6. CREATE DESIGN TEMPLATES TABLE (WITH MULTI-PHOTO GALLERY JSONB)
-- NOTE: Jika jadual design_templates sudah wujud tetapi tiada lajur 'images', jalankan SQL ini:
-- ALTER TABLE public.design_templates ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
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

-- 7. CREATE ORDERS TABLE
CREATE TABLE public.orders (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    template_name TEXT NOT NULL,
    cut_type TEXT NOT NULL,
    fabric_material TEXT NOT NULL,
    size_breakdown JSONB DEFAULT '{}'::jsonb,
    total_qty INTEGER DEFAULT 1,
    unit_price NUMERIC(10, 2) DEFAULT 70.00,
    total_price NUMERIC(10, 2) DEFAULT 70.00,
    status TEXT DEFAULT 'Menunggu WhatsApp',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CREATE STORE SETTINGS TABLE
CREATE TABLE public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    store_name TEXT DEFAULT 'AYEZZ GLOBAL',
    whatsapp_number TEXT DEFAULT '6287818310416',
    currencySymbol TEXT DEFAULT 'RM',
    min_order_qty INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. DISABLE ROW LEVEL SECURITY (RLS) FOR FULL ANONYMOUS ACCESS
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cut_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fabric_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings DISABLE ROW LEVEL SECURITY;

-- 10. GRANT FULL PERMISSIONS TO ALL ROLES
GRANT ALL ON TABLE public.categories TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.sub_categories TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.cut_types TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.fabric_types TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.design_templates TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.orders TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.store_settings TO anon, authenticated, postgres, service_role;

-- 11. SEED MASTER CATEGORIES
INSERT INTO public.categories (id, code, title, thumbnail) VALUES
('olahraga', '01', 'Olahraga', '/images/catalog/jersey-olahraga.jfif'),
('esport_gaming', '02', 'E-Sport & Gaming', '/images/catalog/esport.jfif'),
('sekolah_kampus', '03', 'Sekolah & Kampus', '/images/catalog/scholl.jfif'),
('corporate_instansi', '04', 'Corporate & Instansi', 'https://images.unsplash.com/photo-1625910513413-5fc2810a9557?auto=format&fit=crop&w=800&q=80'),
('komunitas_hobi', '05', 'Komunitas & Hobi', 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80'),
('fashion_kasual', '06', 'Fashion & Kasual', 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80');

-- 12. SEED RELATIONAL SUB-CATEGORIES
INSERT INTO public.sub_categories (id, category_id, code, title, thumbnail) VALUES
('sub_sepak_bola', 'olahraga', '01', 'Sepak Bola', '/images/catalog/jersey-olahraga.jfif'),
('sub_futsal', 'olahraga', '02', 'Futsal', '/images/catalog/jersey-olahraga.jfif'),
('sub_sepak_takraw', 'olahraga', '03', 'Sepak Takraw', '/images/catalog/jersey-olahraga.jfif'),
('sub_badminton', 'olahraga', '04', 'Badminton', '/images/catalog/jersey-olahraga.jfif'),
('sub_bola_voli', 'olahraga', '05', 'Bola Voli', '/images/catalog/jersey-olahraga.jfif'),
('sub_bola_basket', 'olahraga', '06', 'Bola Basket', '/images/catalog/jersey-olahraga.jfif'),
('sub_bersepeda', 'olahraga', '07', 'Bersepeda', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80'),
('sub_motocross', 'olahraga', '08', 'Motocross', '/images/catalog/jersey-olahraga.jfif'),
('sub_memancing', 'olahraga', '09', 'Memancing', '/images/catalog/jersey-olahraga.jfif'),
('sub_marathon', 'olahraga', '10', 'Lari / Marathon', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80'),
('sub_panahan', 'olahraga', '11', 'Panahan', '/images/catalog/jersey-olahraga.jfif'),

('sub_mlbb', 'esport_gaming', '01', 'Mobile Legends', '/images/catalog/esport.jfif'),
('sub_pubg', 'esport_gaming', '02', 'PUBG Mobile', '/images/catalog/esport.jfif'),
('sub_free_fire', 'esport_gaming', '03', 'Free Fire', '/images/catalog/esport.jfif'),
('sub_valorant', 'esport_gaming', '04', 'Valorant', '/images/catalog/esport.jfif'),
('sub_dota2', 'esport_gaming', '05', 'Dota 2', '/images/catalog/esport.jfif'),
('sub_ea_sports', 'esport_gaming', '06', 'EA Sports', '/images/catalog/esport.jfif'),
('sub_sim_racing', 'esport_gaming', '07', 'Sim Racing', '/images/catalog/esport.jfif'),

('sub_baju_olahraga', 'sekolah_kampus', '01', 'Baju Olahraga', '/images/catalog/scholl.jfif'),
('sub_baju_kelas', 'sekolah_kampus', '02', 'Baju Kelas / Angkatan', '/images/catalog/scholl.jfif'),
('sub_seragam_ekskul', 'sekolah_kampus', '03', 'Seragam Ekstrakurikuler', '/images/catalog/scholl.jfif'),
('sub_classmeet', 'sekolah_kampus', '04', 'Event Sekolah / Classmeet', '/images/catalog/scholl.jfif'),
('sub_almamater', 'sekolah_kampus', '05', 'Jaket / Almamater Kampus', '/images/catalog/scholl.jfif'),

('sub_seragam_kerja', 'corporate_instansi', '01', 'Seragam Kerja / Polo', 'https://images.unsplash.com/photo-1625910513413-5fc2810a9557?auto=format&fit=crop&w=800&q=80'),
('sub_pdl', 'corporate_instansi', '02', 'Pakaian Dinas Lapangan (PDL)', 'https://images.unsplash.com/photo-1625910513413-5fc2810a9557?auto=format&fit=crop&w=800&q=80'),
('sub_family_gathering', 'corporate_instansi', '03', 'Family Gathering', 'https://images.unsplash.com/photo-1625910513413-5fc2810a9557?auto=format&fit=crop&w=800&q=80'),
('sub_event_promosi', 'corporate_instansi', '04', 'Event Promosi / Launching', 'https://images.unsplash.com/photo-1625910513413-5fc2810a9557?auto=format&fit=crop&w=800&q=80'),
('sub_baju_panitia', 'corporate_instansi', '05', 'Baju Panitia', 'https://images.unsplash.com/photo-1625910513413-5fc2810a9557?auto=format&fit=crop&w=800&q=80'),

('sub_otomotif', 'komunitas_hobi', '01', 'Klub Otomotif (Motor & Mobil)', 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80'),
('sub_kicau_burung', 'komunitas_hobi', '02', 'Komunitas Kicau Burung', 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80'),
('sub_outdoor', 'komunitas_hobi', '03', 'Pencinta Alam / Outdoor', 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80'),
('sub_zumba', 'komunitas_hobi', '04', 'Klub Senam / Zumba', 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80'),

('sub_hawaiian', 'fashion_kasual', '01', 'Kemeja Printing / Hawaiian', 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'),
('sub_streetwear', 'fashion_kasual', '02', 'Kaos Streetwear', 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'),
('sub_kurta', 'fashion_kasual', '03', 'Kurta / Pakaian Muslim', 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'),
('sub_kaos_konser', 'fashion_kasual', '04', 'Kaos Event / Konser', 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80');

-- 13. SEED CUT TYPES
INSERT INTO public.cut_types (id, name, add_on_price, description, thumbnail) VALUES
('roundneck', 'Roundneck (Leher Bulat)', 0.00, 'Potongan kolar leher bulat klasik standard untuk keselesaan aktiviti sukan.', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'),
('vneck', 'V-Neck (Leher V)', 2.00, 'Potongan leher gaya V yang kemas dan memberikan ruang leher lebih luas.', '/images/catalog/jersey-olahraga.jfif'),
('raglan_vneck', 'Raglan V-Neck', 5.00, 'Potongan lengan raglan khas untuk pergerakan bahu maksima semasa bersukan.', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80'),
('polo_collar', 'Polo Berkolar (Polo Collar)', 10.00, 'Kolar kemeja polo dengan plaquet butang untuk penampilan korporat & separa rasmi.', 'https://images.unsplash.com/photo-1625910513413-5fc2810a9557?auto=format&fit=crop&w=800&q=80'),
('full_zip_hoodie', 'Hoodie Berzip (Full Zip)', 35.00, 'Jaket hoodie bertopi dengan zip penuh cetakan sublimasi bergaya.', 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80');

-- 14. SEED FABRIC TYPES
INSERT INTO public.fabric_types (id, name, base_price, tier, gsm, features, description, thumbnail) VALUES
('dryfit_micro', 'Dry-Fit Microdot', 70.00, 'Piawaian', '150 GSM', 'Pantas Kering • Ringan • Anti-Bakteria', 'Peredaran udara maksimum dengan liang microdot halus untuk keselesaan aktiviti harian.', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'),
('honeycomb', 'Honeycomb Mesh', 80.00, 'Popular', '170 GSM', 'Tekstur Sarang Lebah • Sejuk • Tahan Lasak', 'Tekstur sarang lebah eksklusif yang sejuk, berstruktur tegap dan tahan lasak.', '/images/catalog/jersey-olahraga.jfif'),
('pique_premium', 'Pique Dry-Fit', 95.00, 'Premium', '190 GSM', 'Kemas Korporat • Lembut • Tidak Berbulu', 'Bahan kemeja polo bertulang elegan, lembut pada kulit dan terletak kemas.', 'https://images.unsplash.com/photo-1625910513413-5fc2810a9557?auto=format&fit=crop&w=800&q=80'),
('aero_spandex', 'Aero Spandex Mesh', 120.00, 'Pro Sukan', '220 GSM', 'Regangan 4-Arah • Aero-Fit • Pro Athletic', 'Kenyal regangan 4-arah berprestasi tinggi untuk jersi basikal & larian profesional.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80');

-- 15. SEED DESIGN TEMPLATES WITH MULTI-PHOTO GALLERY IMAGES
INSERT INTO public.design_templates (id, name, category, sub_category, description, thumbnail, images) VALUES
('tpl_futsal_pro', 'Template Jersi Pro Match', 'Olahraga', 'Futsal', 'Reka bentuk jersi sublimasi corak geometri moden.', '/images/catalog/jersey-olahraga.jfif', '["/images/catalog/jersey-olahraga.jfif"]'::jsonb),
('tpl_cycling_aero', 'Template Jersi Aero Velocity', 'Olahraga', 'Bersepeda', 'Reka bentuk jersi basikal garisan kelajuan aero.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80"]'::jsonb),
('tpl_polo_corporate', 'Template Polo Minimalis Korporat', 'Corporate & Instansi', 'Seragam Kerja / Polo', 'Reka bentuk polo berkolar kemas elegan.', 'https://images.unsplash.com/photo-1625910513413-5fc2810a9557?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1625910513413-5fc2810a9557?auto=format&fit=crop&w=800&q=80"]'::jsonb),
('tpl_esports_cyber', 'Template Jersi Esports Quantum', 'E-Sport & Gaming', 'Mobile Legends', 'Reka bentuk jersi esports siber gaya profesional.', '/images/catalog/esport.jfif', '["/images/catalog/esport.jfif"]'::jsonb),
('tpl_hoodie_stealth', 'Template Hoodie Berzip Stealth', 'Fashion & Kasual', 'Kaos Streetwear', 'Reka bentuk hoodie berzip cetakan penuh.', 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80"]'::jsonb);

INSERT INTO public.store_settings (id, store_name, whatsapp_number, currencySymbol, min_order_qty) VALUES
('default', 'AYEZZ GLOBAL', '6287818310416', 'RM', 1);
