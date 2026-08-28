// DESIGN TEMPLATES
export const DESIGN_TEMPLATES = [
  {
    id: 'tpl_futsal_pro',
    name: 'Template Jersi Pro Match',
    category: 'Olahraga',
    subCategory: 'Futsal',
    icon: '⚽',
    description: 'Reka bentuk jersi sublimasi corak geometri moden.',
    thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tpl_cycling_aero',
    name: 'Template Jersi Aero Velocity',
    category: 'Olahraga',
    subCategory: 'Bersepeda',
    icon: '🚴',
    description: 'Reka bentuk jersi basikal garisan kelajuan aero.',
    thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tpl_polo_corporate',
    name: 'Template Polo Minimalis Korporat',
    category: 'Corporate & Instansi',
    subCategory: 'Seragam Kerja / Polo',
    icon: '👕',
    description: 'Reka bentuk polo berkolar kemas elegan.',
    thumbnail: 'https://images.unsplash.com/photo-1625910513413-5fc2810a9557?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tpl_esports_cyber',
    name: 'Template Jersi Esports Quantum',
    category: 'E-Sport & Gaming',
    subCategory: 'Mobile Legends',
    icon: '🎮',
    description: 'Reka bentuk jersi esports siber gaya profesional.',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tpl_hoodie_stealth',
    name: 'Template Hoodie Berzip Stealth',
    category: 'Fashion & Kasual',
    subCategory: 'Kaos Streetwear',
    icon: '🧥',
    description: 'Reka bentuk hoodie berzip cetakan penuh.',
    thumbnail: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'
  }
];

export const APPAREL_MODELS = DESIGN_TEMPLATES;

// JENIS POTONGAN / KOLAR (Cut / Collar Types with 1:1 Thumbnail Images)
export const CUT_TYPES = [
  {
    id: 'roundneck',
    name: 'Roundneck (Leher Bulat)',
    addOnPrice: 0,
    desc: 'Potongan kolar leher bulat klasik standard untuk keselesaan aktiviti sukan.',
    thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'vneck',
    name: 'V-Neck (Leher V)',
    addOnPrice: 2,
    desc: 'Potongan leher gaya V yang kemas dan memberikan ruang leher lebih luas.',
    thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'raglan_vneck',
    name: 'Raglan V-Neck',
    addOnPrice: 5,
    desc: 'Potongan lengan raglan khas untuk pergerakan bahu maksima semasa bersukan.',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'polo_collar',
    name: 'Polo Berkolar (Polo Collar)',
    addOnPrice: 10,
    desc: 'Kolar kemeja polo dengan plaquet butang untuk penampilan korporat & separa rasmi.',
    thumbnail: 'https://images.unsplash.com/photo-1625910513413-5fc2810a9557?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'full_zip_hoodie',
    name: 'Hoodie Berzip (Full Zip)',
    addOnPrice: 35,
    desc: 'Jaket hoodie bertopi dengan zip penuh cetakan sublimasi bergaya.',
    thumbnail: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'
  }
];

// JENIS KAIN SUBLIMASI (Fabric Materials with GSM, Features, Descriptions & 1:1 Thumbnails)
export const FABRIC_TYPES = [
  {
    id: 'dryfit_micro',
    name: 'Dry-Fit Microdot',
    basePrice: 70,
    tier: 'Piawaian',
    gsm: '150 GSM',
    features: 'Pantas Kering • Ringan • Anti-Bakteria',
    desc: 'Peredaran udara maksimum dengan liang microdot halus untuk keselesaan aktiviti harian.',
    thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'honeycomb',
    name: 'Honeycomb Mesh',
    basePrice: 80,
    tier: 'Popular',
    gsm: '170 GSM',
    features: 'Tekstur Sarang Lebah • Sejuk • Tahan Lasak',
    desc: 'Tekstur sarang lebah eksklusif yang sejuk, berstruktur tegap dan tahan lasak.',
    thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pique_premium',
    name: 'Pique Dry-Fit',
    basePrice: 95,
    tier: 'Premium',
    gsm: '190 GSM',
    features: 'Kemas Korporat • Lembut • Tidak Berbulu',
    desc: 'Bahan kemeja polo bertulang elegan, lembut pada kulit dan terletak kemas.',
    thumbnail: 'https://images.unsplash.com/photo-1625910513413-5fc2810a9557?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'aero_spandex',
    name: 'Aero Spandex Mesh',
    basePrice: 120,
    tier: 'Pro Sukan',
    gsm: '220 GSM',
    features: 'Regangan 4-Arah • Aero-Fit • Pro Athletic',
    desc: 'Kenyal regangan 4-arah berprestasi tinggi untuk jersi basikal & larian profesional.',
    thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80'
  }
];

// MASTER KATEGORI & SUB-KATEGORI (6 Main Categories)
export const MAIN_CATALOGS = [
  {
    id: 'olahraga',
    code: '01',
    title: 'Olahraga',
    itemCount: '11 Jenis',
    iconName: 'Trophy',
    thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    subCategories: [
      'Semua', 'Sepak Bola', 'Futsal', 'Sepak Takraw', 'Badminton', 'Bola Voli', 'Bola Basket', 'Bersepeda', 'Motocross', 'Memancing', 'Lari / Marathon', 'Panahan'
    ]
  },
  {
    id: 'esport_gaming',
    code: '02',
    title: 'E-Sport & Gaming',
    itemCount: '7 Jenis',
    iconName: 'Gamepad2',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    subCategories: [
      'Semua', 'Mobile Legends', 'PUBG Mobile', 'Free Fire', 'Valorant', 'Dota 2', 'EA Sports', 'Sim Racing'
    ]
  },
  {
    id: 'sekolah_kampus',
    code: '03',
    title: 'Sekolah & Kampus',
    itemCount: '5 Jenis',
    iconName: 'GraduationCap',
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    subCategories: [
      'Semua', 'Baju Olahraga', 'Baju Kelas / Angkatan', 'Seragam Ekstrakurikuler', 'Event Sekolah / Classmeet', 'Jaket / Almamater Kampus'
    ]
  },
  {
    id: 'corporate_instansi',
    code: '04',
    title: 'Corporate & Instansi',
    itemCount: '5 Jenis',
    iconName: 'Briefcase',
    thumbnail: 'https://images.unsplash.com/photo-1625910513413-5fc2810a9557?auto=format&fit=crop&w=800&q=80',
    subCategories: [
      'Semua', 'Seragam Kerja / Polo', 'Pakaian Dinas Lapangan (PDL)', 'Family Gathering', 'Event Promosi / Launching', 'Baju Panitia'
    ]
  },
  {
    id: 'komunitas_hobi',
    code: '05',
    title: 'Komunitas & Hobi',
    itemCount: '4 Jenis',
    iconName: 'Users',
    thumbnail: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80',
    subCategories: [
      'Semua', 'Klub Otomotif (Motor & Mobil)', 'Komunitas Kicau Burung', 'Pencinta Alam / Outdoor', 'Klub Senam / Zumba'
    ]
  },
  {
    id: 'fashion_kasual',
    code: '06',
    title: 'Fashion & Kasual',
    itemCount: '4 Jenis',
    iconName: 'Sparkles',
    thumbnail: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
    subCategories: [
      'Semua', 'Kemeja Printing / Hawaiian', 'Kaos Streetwear', 'Kurta / Pakaian Muslim', 'Kaos Event / Konser'
    ]
  }
];

export const SIZE_CHART = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

export const BRAND_PARTNERS = [
  'PERTAMINA', 'HONDA', 'KAI', 'PAXEL', 'DIKPORA', 'AAU', 'RSUD'
];
