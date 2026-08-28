export const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23F5F5F7'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2386868B'%3EAYEZZ GLOBAL%3C/text%3E%3C/svg%3E";

// DESIGN TEMPLATES
export const DESIGN_TEMPLATES = [
  {
    id: 'tpl_futsal_pro',
    name: 'Template Jersi Pro Match',
    category: 'Olahraga',
    subCategory: 'Futsal',
    icon: '⚽',
    description: 'Reka bentuk jersi sublimasi corak geometri moden.',
    thumbnail: PLACEHOLDER_IMAGE
  },
  {
    id: 'tpl_cycling_aero',
    name: 'Template Jersi Aero Velocity',
    category: 'Olahraga',
    subCategory: 'Bersepeda',
    icon: '🚴',
    description: 'Reka bentuk jersi basikal garisan kelajuan aero.',
    thumbnail: PLACEHOLDER_IMAGE
  },
  {
    id: 'tpl_polo_corporate',
    name: 'Template Polo Minimalis Korporat',
    category: 'Corporate & Instansi',
    subCategory: 'Seragam Kerja / Polo',
    icon: '👕',
    description: 'Reka bentuk polo berkolar kemas elegan.',
    thumbnail: PLACEHOLDER_IMAGE
  },
  {
    id: 'tpl_esports_cyber',
    name: 'Template Jersi Esports Quantum',
    category: 'E-Sport & Gaming',
    subCategory: 'Mobile Legends',
    icon: '🎮',
    description: 'Reka bentuk jersi esports siber gaya profesional.',
    thumbnail: PLACEHOLDER_IMAGE
  },
  {
    id: 'tpl_hoodie_stealth',
    name: 'Template Hoodie Berzip Stealth',
    category: 'Fashion & Kasual',
    subCategory: 'Kaos Streetwear',
    icon: '🧥',
    description: 'Reka bentuk hoodie berzip cetakan penuh.',
    thumbnail: PLACEHOLDER_IMAGE
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
    thumbnail: PLACEHOLDER_IMAGE
  },
  {
    id: 'vneck',
    name: 'V-Neck (Leher V)',
    addOnPrice: 2,
    desc: 'Potongan leher gaya V yang kemas dan memberikan ruang leher lebih luas.',
    thumbnail: PLACEHOLDER_IMAGE
  },
  {
    id: 'raglan_vneck',
    name: 'Raglan V-Neck',
    addOnPrice: 5,
    desc: 'Potongan lengan raglan khas untuk pergerakan bahu maksima semasa bersukan.',
    thumbnail: PLACEHOLDER_IMAGE
  },
  {
    id: 'polo_collar',
    name: 'Polo Berkolar (Polo Collar)',
    addOnPrice: 10,
    desc: 'Kolar kemeja polo dengan plaquet butang untuk penampilan korporat & separa rasmi.',
    thumbnail: PLACEHOLDER_IMAGE
  },
  {
    id: 'full_zip_hoodie',
    name: 'Hoodie Berzip (Full Zip)',
    addOnPrice: 35,
    desc: 'Jaket hoodie bertopi dengan zip penuh cetakan sublimasi bergaya.',
    thumbnail: PLACEHOLDER_IMAGE
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
    thumbnail: PLACEHOLDER_IMAGE
  },
  {
    id: 'honeycomb',
    name: 'Honeycomb Mesh',
    basePrice: 80,
    tier: 'Popular',
    gsm: '170 GSM',
    features: 'Tekstur Sarang Lebah • Sejuk • Tahan Lasak',
    desc: 'Tekstur sarang lebah eksklusif yang sejuk, berstruktur tegap dan tahan lasak.',
    thumbnail: PLACEHOLDER_IMAGE
  },
  {
    id: 'pique_premium',
    name: 'Pique Dry-Fit',
    basePrice: 95,
    tier: 'Premium',
    gsm: '190 GSM',
    features: 'Kemas Korporat • Lembut • Tidak Berbulu',
    desc: 'Bahan kemeja polo bertulang elegan, lembut pada kulit dan terletak kemas.',
    thumbnail: PLACEHOLDER_IMAGE
  },
  {
    id: 'aero_spandex',
    name: 'Aero Spandex Mesh',
    basePrice: 120,
    tier: 'Pro Sukan',
    gsm: '220 GSM',
    features: 'Regangan 4-Arah • Aero-Fit • Pro Athletic',
    desc: 'Kenyal regangan 4-arah berprestasi tinggi untuk jersi basikal & larian profesional.',
    thumbnail: PLACEHOLDER_IMAGE
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
    thumbnail: PLACEHOLDER_IMAGE,
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
    thumbnail: PLACEHOLDER_IMAGE,
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
    thumbnail: PLACEHOLDER_IMAGE,
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
    thumbnail: PLACEHOLDER_IMAGE,
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
    thumbnail: PLACEHOLDER_IMAGE,
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
    thumbnail: PLACEHOLDER_IMAGE,
    subCategories: [
      'Semua', 'Kemeja Printing / Hawaiian', 'Kaos Streetwear', 'Kurta / Pakaian Muslim', 'Kaos Event / Konser'
    ]
  }
];

export const SIZE_CHART = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

export const BRAND_PARTNERS = [
  'PERTAMINA', 'HONDA', 'KAI', 'PAXEL', 'DIKPORA', 'AAU', 'RSUD'
];
