export const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23F5F5F7'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2386868B'%3EAYEZZ GLOBAL%3C/text%3E%3C/svg%3E";

export const PACKAGING_MODELS = [];

export const PRESET_DESIGNS = [];


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
