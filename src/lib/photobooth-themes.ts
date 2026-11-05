export interface PhotoboothTheme {
  id: string;
  name: string;
  category: 'Suasana & Vibe' | 'Alam & Kosmik' | 'Kultural & Destinasi' | 'Modern & Seni' | 'Gaya Hidup';
  frameColor: string;
  gradientTo?: string;
  borderColor: string;
  textColor: string;
  badge: string;
  patternType:
    | 'romantic-hearts'
    | 'space-galaxy'
    | 'education-grid'
    | 'ocean-waves'
    | 'forest-botanical'
    | 'minimalist-mono'
    | 'modern-y2k'
    | 'japan-sakura'
    | 'korea-pastel'
    | 'china-heritage'
    | 'sunset-glow'
    | 'vintage-film'
    | 'neon-synth'
    | 'autumn-maple'
    | 'winter-snow'
    | 'coffee-mocha'
    | 'artistic-watercolor'
    | 'comic-pop'
    | 'botanical-floral'
    | 'music-vinyl'
    | 'midnight-city'
    | 'warm-cream';
  iconEmoji: string;
  description: string;
}

export const PHOTOBOOTH_THEMES: PhotoboothTheme[] = [
  // 1. Romantis
  {
    id: 'theme-romantic',
    name: 'Romantis (Sweet Hearts)',
    category: 'Suasana & Vibe',
    frameColor: '#FFF0F5',
    gradientTo: '#FFE4E1',
    borderColor: '#F472B6',
    textColor: '#9D174D',
    badge: 'ROMANCE',
    patternType: 'romantic-hearts',
    iconEmoji: '💖',
    description: 'Aura manis merah muda berhias floating hearts & lengkung pita floral.',
  },
  // 2. Space & Galaxy
  {
    id: 'theme-space',
    name: 'Space & Galaxy',
    category: 'Alam & Kosmik',
    frameColor: '#0A0C1B',
    gradientTo: '#1E1B4B',
    borderColor: '#6366F1',
    textColor: '#E0E7FF',
    badge: 'COSMIC',
    patternType: 'space-galaxy',
    iconEmoji: '🚀',
    description: 'Kosmik galaksi pekat bertabur bintang berkelap-kelip & konstelasi.',
  },
  // 3. Edukasi & Kampus
  {
    id: 'theme-education',
    name: 'Edukasi & Kampus',
    category: 'Gaya Hidup',
    frameColor: '#F8FAFC',
    gradientTo: '#F1F5F9',
    borderColor: '#38BDF8',
    textColor: '#0369A1',
    badge: 'CAMPUS',
    patternType: 'education-grid',
    iconEmoji: '📐',
    description: 'Tekstur kertas grid catatan teknik, skala mistar, dan aksen sketsa.',
  },
  // 4. Laut & Samudra
  {
    id: 'theme-ocean',
    name: 'Laut & Samudra',
    category: 'Alam & Kosmik',
    frameColor: '#ECFEFF',
    gradientTo: '#CFFAFE',
    borderColor: '#06B6D4',
    textColor: '#0E7490',
    badge: 'OCEANIC',
    patternType: 'ocean-waves',
    iconEmoji: '🌊',
    description: 'Gradasi pirus ombak samudra dengan gelembung air & siluet buih laut.',
  },
  // 5. Hutan & Botanical
  {
    id: 'theme-forest',
    name: 'Hutan & Botanical',
    category: 'Alam & Kosmik',
    frameColor: '#F2F7F4',
    gradientTo: '#E2ECE5',
    borderColor: '#10B981',
    textColor: '#065F46',
    badge: 'NATURE',
    patternType: 'forest-botanical',
    iconEmoji: '🌿',
    description: 'Hijau sage teduh berhiaskan dedaunan cemara dan ranting pinus alami.',
  },
  // 6. Minimalis Studio
  {
    id: 'theme-minimalist',
    name: 'Minimalis Studio',
    category: 'Modern & Seni',
    frameColor: '#FFFFFF',
    gradientTo: '#F8FAFC',
    borderColor: '#94A3B8',
    textColor: '#0F172A',
    badge: 'MINIMAL',
    patternType: 'minimalist-mono',
    iconEmoji: '◻️',
    description: 'Gaya galeri modern bersih dengan garis bingkai presisi berkelas.',
  },
  // 7. Modern Y2K Cyber
  {
    id: 'theme-y2k',
    name: 'Modern Y2K Cyber',
    category: 'Modern & Seni',
    frameColor: '#170A2A',
    gradientTo: '#2E1065',
    borderColor: '#D946EF',
    textColor: '#F0ABFC',
    badge: 'CYBER Y2K',
    patternType: 'modern-y2k',
    iconEmoji: '✨',
    description: 'Kilau 4-pointed stars retro-futuristik berpadu ungu neon kromik.',
  },
  // 8. Jepang Sakura
  {
    id: 'theme-japan',
    name: 'Jepang Sakura (桜)',
    category: 'Kultural & Destinasi',
    frameColor: '#FFF5F7',
    gradientTo: '#FFE4E6',
    borderColor: '#FB7185',
    textColor: '#9F1239',
    badge: 'NIHON',
    patternType: 'japan-sakura',
    iconEmoji: '🌸',
    description: 'Nuansa musim semi Kyoto dengan guguran kelopak bunga sakura melayang.',
  },
  // 9. Korea Dreamy
  {
    id: 'theme-korea',
    name: 'Korea Dreamy (인생네컷)',
    category: 'Kultural & Destinasi',
    frameColor: '#FAF5FF',
    gradientTo: '#F3E8FF',
    borderColor: '#C084FC',
    textColor: '#6B21A8',
    badge: 'LIFE4CUTS',
    patternType: 'korea-pastel',
    iconEmoji: '☁️',
    description: 'Estetika photobooth Korea Life4Cuts dengan awan pastel & bintang mungil.',
  },
  // 10. China Heritage
  {
    id: 'theme-china',
    name: 'China Heritage (中国风)',
    category: 'Kultural & Destinasi',
    frameColor: '#7F1D1D',
    gradientTo: '#991B1B',
    borderColor: '#FBBF24',
    textColor: '#FEF08A',
    badge: 'ORIENTAL',
    patternType: 'china-heritage',
    iconEmoji: '🏮',
    description: 'Merah vermilion kaisar dengan ornamen awan xiangyun & bordir emas.',
  },
  // 11. Sunset Golden Hour
  {
    id: 'theme-sunset',
    name: 'Sunset Golden Hour',
    category: 'Suasana & Vibe',
    frameColor: '#FFF7ED',
    gradientTo: '#FED7AA',
    borderColor: '#F97316',
    textColor: '#9A3412',
    badge: 'TWILIGHT',
    patternType: 'sunset-glow',
    iconEmoji: '🌅',
    description: 'Hangatnya sang surya tenggelam dengan semburat jingga keemasan.',
  },
  // 12. Vintage Film 90s
  {
    id: 'theme-vintage',
    name: 'Vintage Film 90s',
    category: 'Suasana & Vibe',
    frameColor: '#F5EBE1',
    gradientTo: '#E6D7C3',
    borderColor: '#78350F',
    textColor: '#451A03',
    badge: 'ANALOG',
    patternType: 'vintage-film',
    iconEmoji: '🎞️',
    description: 'Gaya klise seluloid 35mm lengkap dengan lubang gerigi film retro.',
  },
  // 13. Neon Synthwave
  {
    id: 'theme-neon',
    name: 'Neon Synthwave',
    category: 'Modern & Seni',
    frameColor: '#0F0B1E',
    gradientTo: '#1E1035',
    borderColor: '#EC4899',
    textColor: '#22D3EE',
    badge: 'SYNTH 80S',
    patternType: 'neon-synth',
    iconEmoji: '⚡',
    description: 'Lampu arcade neon ungu-sian dengan garis perspektif grid digital.',
  },
  // 14. Musim Gugur (Autumn)
  {
    id: 'theme-autumn',
    name: 'Musim Gugur (Autumn)',
    category: 'Alam & Kosmik',
    frameColor: '#FEF3C7',
    gradientTo: '#FDE68A',
    borderColor: '#D97706',
    textColor: '#78350F',
    badge: 'AUTUMN',
    patternType: 'autumn-maple',
    iconEmoji: '🍁',
    description: 'Karamel hangat dengan dedaunan maple yang jatuh berguguran.',
  },
  // 15. Winter Snow
  {
    id: 'theme-winter',
    name: 'Winter Wonderland',
    category: 'Alam & Kosmik',
    frameColor: '#F0F9FF',
    gradientTo: '#E0F2FE',
    borderColor: '#38BDF8',
    textColor: '#075985',
    badge: 'FROST',
    patternType: 'winter-snow',
    iconEmoji: '❄️',
    description: 'Hawa dingin salju kutub berhias kristal kepingan salju simetris.',
  },
  // 16. Café & Coffee Shop
  {
    id: 'theme-coffee',
    name: 'Café & Coffee Shop',
    category: 'Gaya Hidup',
    frameColor: '#ECE5DF',
    gradientTo: '#D8C7B8',
    borderColor: '#8D6E63',
    textColor: '#3E2723',
    badge: 'CAFÉ',
    patternType: 'coffee-mocha',
    iconEmoji: '☕',
    description: 'Aroma kopi moka dan latte art dengan aksen biji kopi yang menenangkan.',
  },
  // 17. Artistic Watercolor
  {
    id: 'theme-watercolor',
    name: 'Artistic Watercolor',
    category: 'Modern & Seni',
    frameColor: '#FDF8F6',
    gradientTo: '#F5EBE6',
    borderColor: '#A855F7',
    textColor: '#581C87',
    badge: 'AQUARELLE',
    patternType: 'artistic-watercolor',
    iconEmoji: '🎨',
    description: 'Percikan lembut warna cat air artistik dengan sapuan pigmen estetik.',
  },
  // 18. Manga & Pop Art
  {
    id: 'theme-comic',
    name: 'Manga & Pop Art',
    category: 'Modern & Seni',
    frameColor: '#FEF9C3',
    gradientTo: '#FEF08A',
    borderColor: '#EF4444',
    textColor: '#18181B',
    badge: 'COMIC POP',
    patternType: 'comic-pop',
    iconEmoji: '💥',
    description: 'Titik pola halftone komik pop art dengan sudut aksi penuh energi.',
  },
  // 19. Botanical Garden
  {
    id: 'theme-botanical-dark',
    name: 'Botanical Garden (Dark)',
    category: 'Alam & Kosmik',
    frameColor: '#12221B',
    gradientTo: '#1E3A2F',
    borderColor: '#F59E0B',
    textColor: '#FEF3C7',
    badge: 'ELEGANCE',
    patternType: 'botanical-floral',
    iconEmoji: '🌺',
    description: 'Latar hijau emerald pekat elegan dipadu dedaunan emas mewah.',
  },
  // 20. Vinyl Record & Music
  {
    id: 'theme-music',
    name: 'Vinyl Record & Music',
    category: 'Gaya Hidup',
    frameColor: '#16171B',
    gradientTo: '#25272F',
    borderColor: '#FE6E00',
    textColor: '#FAFAFA',
    badge: 'VINYL BEAT',
    patternType: 'music-vinyl',
    iconEmoji: '🎵',
    description: 'Garis alur piringan hitam vinyl dan grafik gelombang suara equalizer.',
  },
  // 21. Midnight City Lights
  {
    id: 'theme-city',
    name: 'Midnight City Lights',
    category: 'Suasana & Vibe',
    frameColor: '#0D1117',
    gradientTo: '#161B22',
    borderColor: '#58A6FF',
    textColor: '#E6EDF3',
    badge: 'METROPOLIS',
    patternType: 'midnight-city',
    iconEmoji: '🌃',
    description: 'Siluet cakrawala gedung kota malam bertabur lingkaran cahaya bokeh.',
  },
  // 22. Warm Cream Classic
  {
    id: 'theme-classic',
    name: 'Warm Cream Classic',
    category: 'Modern & Seni',
    frameColor: '#F2E8DC',
    gradientTo: '#E8DDD0',
    borderColor: '#D4C4B2',
    textColor: '#4A3B32',
    badge: 'CLASSIC',
    patternType: 'warm-cream',
    iconEmoji: '📷',
    description: 'Bingkai studio foto klasik bernuansa krem gading yang hangat.',
  },
];

