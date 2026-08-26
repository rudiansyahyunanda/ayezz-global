export const PACKAGING_MODELS = [
  {
    id: 'tuck_box',
    name: 'Straight Tuck Box',
    category: 'Box',
    icon: '📦',
    description: 'Standard retail box with top and bottom folding flaps.',
    defaultDims: { width: 80, height: 120, depth: 50, thickness: 1.5, flap: 20 },
    thumbnail: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
    tags: ['Retail', 'Cosmetics', 'Pharma', 'Gadgets']
  },
  {
    id: 'mailer_box',
    name: 'E-Commerce Mailer Box',
    category: 'Box',
    icon: '📫',
    description: 'Sturdy corrugated box ideal for subscription boxes & shipping.',
    defaultDims: { width: 150, height: 60, depth: 120, thickness: 2.5, flap: 15 },
    thumbnail: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    tags: ['Shipping', 'E-Commerce', 'Apparel']
  },
  {
    id: 'cylinder_can',
    name: 'Cylinder Packaging Tube',
    category: 'Tube',
    icon: '🧃',
    description: 'Round cardboard tube for luxury teas, candles, and wine bottles.',
    defaultDims: { width: 70, height: 160, depth: 70, thickness: 2.0, flap: 0 },
    thumbnail: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
    tags: ['Candles', 'Tea & Coffee', 'Spirits', 'Luxury']
  },
  {
    id: 'standup_pouch',
    name: 'Stand-up Foil Pouch',
    category: 'Pouch',
    icon: '🎒',
    description: 'Flexible pouch with ziplock seal for food, coffee, & powders.',
    defaultDims: { width: 110, height: 170, depth: 40, thickness: 0.8, flap: 0 },
    thumbnail: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80',
    tags: ['Coffee', 'Snacks', 'Supplements']
  },
  {
    id: 'dropper_bottle',
    name: 'Serum Dropper Bottle',
    category: 'Cosmetics',
    icon: '🧪',
    description: 'Glass cosmetic dropper bottle with custom label wrapping.',
    defaultDims: { width: 45, height: 110, depth: 45, thickness: 1.0, flap: 0 },
    thumbnail: 'https://images.unsplash.com/photo-1608248597261-e4d0450cbf1c?auto=format&fit=crop&w=600&q=80',
    tags: ['Skincare', 'Essential Oils', 'Beauty']
  },
  {
    id: 'coffee_cup',
    name: 'Paper Coffee Cup',
    category: 'Beverage',
    icon: '☕',
    description: 'Eco-friendly double wall coffee cup with sleeve.',
    defaultDims: { width: 85, height: 130, depth: 85, thickness: 1.2, flap: 0 },
    thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    tags: ['Café', 'Beverages', 'Takeaway']
  }
];

export const PRESET_DESIGNS = [
  {
    id: 'preset_nordic_serum',
    title: 'Nordic Glow Serum',
    modelId: 'tuck_box',
    modelName: 'Straight Tuck Box',
    category: 'Cosmetics',
    dims: { width: 60, height: 140, depth: 45, thickness: 1.5, flap: 18 },
    material: 'matte',
    finish: 'spot_uv',
    colors: {
      front: '#0F172A',
      back: '#0F172A',
      left: '#1E293B',
      right: '#1E293B',
      top: '#38BDF8',
      bottom: '#0F172A'
    },
    lighting: 'cyberpunk',
    badge: 'Trending',
    thumbnail: 'https://images.unsplash.com/photo-1608248597261-e4d0450cbf1c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'preset_artisan_coffee',
    title: 'Artisan Dark Roast',
    modelId: 'standup_pouch',
    modelName: 'Stand-up Foil Pouch',
    category: 'Beverage',
    dims: { width: 120, height: 180, depth: 50, thickness: 0.8, flap: 0 },
    material: 'kraft',
    finish: 'gold_foil',
    colors: {
      front: '#451A03',
      back: '#451A03',
      left: '#78350F',
      right: '#78350F',
      top: '#D97706',
      bottom: '#451A03'
    },
    lighting: 'warm',
    badge: 'Popular',
    thumbnail: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'preset_cyber_mailer',
    title: 'Aura Tech Unboxing',
    modelId: 'mailer_box',
    modelName: 'E-Commerce Mailer Box',
    category: 'E-Commerce',
    dims: { width: 160, height: 70, depth: 130, thickness: 2.5, flap: 15 },
    material: 'glossy',
    finish: 'holographic',
    colors: {
      front: '#581C87',
      back: '#581C87',
      left: '#3B0764',
      right: '#3B0764',
      top: '#A855F7',
      bottom: '#1E1B4B'
    },
    lighting: 'neon',
    badge: 'New',
    thumbnail: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'preset_luxury_candle',
    title: 'Velvet Noir Tube',
    modelId: 'cylinder_can',
    modelName: 'Cylinder Packaging Tube',
    category: 'Luxury',
    dims: { width: 80, height: 150, depth: 80, thickness: 2.0, flap: 0 },
    material: 'matte',
    finish: 'gold_foil',
    colors: {
      front: '#18181B',
      back: '#18181B',
      left: '#27272A',
      right: '#27272A',
      top: '#EAB308',
      bottom: '#18181B'
    },
    lighting: 'neutral',
    badge: 'Premium',
    thumbnail: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80'
  }
];

export const LIGHTING_PRESETS = [
  { id: 'neutral', name: 'Studio Neutral', icon: '☀️', envColor: '#1E293B', lightIntensity: 1.2 },
  { id: 'warm', name: 'Sunset Warmth', icon: '🌅', envColor: '#451A03', lightIntensity: 1.5 },
  { id: 'neon', name: 'Cyberpunk Neon', icon: '🌆', envColor: '#581C87', lightIntensity: 1.8 },
  { id: 'softbox', name: 'Clean Softbox', icon: '💡', envColor: '#0F172A', lightIntensity: 1.0 }
];

export const MATERIAL_TYPES = [
  { id: 'cardboard', name: 'Standard Cardboard', roughness: 0.8, metalness: 0.1, bump: true },
  { id: 'kraft', name: 'Natural Kraft Paper', roughness: 0.9, metalness: 0.0, bump: true },
  { id: 'glossy', name: 'Glossy Coated', roughness: 0.2, metalness: 0.2, bump: false },
  { id: 'matte', name: 'Matte Premium', roughness: 0.6, metalness: 0.0, bump: false },
  { id: 'metallic', name: 'Metallic Foil Sheen', roughness: 0.3, metalness: 0.8, bump: false }
];
