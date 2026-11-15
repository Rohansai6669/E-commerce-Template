export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'Modern Streetwear & Display' | 'Swiss & Clean Sans' | 'Luxury Editorial Serif' | 'Technical Monospace';
  badge: string;
  description: string;
}

export const CURATED_FONTS: FontOption[] = [
  // 1. Streetwear & Display Fonts
  {
    id: 'clash-display',
    name: 'Clash Display',
    family: "'Clash Display', -apple-system, BlinkMacSystemFont, sans-serif",
    category: 'Modern Streetwear & Display',
    badge: 'Streetwear / Luxury',
    description: 'Edgy, high-contrast brutalist display typeface built for streetwear & luxury fashion headers.',
  },
  {
    id: 'helvetica-now',
    name: 'Helvetica Now Display',
    family: "'Helvetica Now Display', 'Helvetica Now', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    category: 'Swiss & Clean Sans',
    badge: 'Swiss International',
    description: 'The pinnacle of Swiss modernist typography with razor-sharp geometric precision.',
  },
  {
    id: 'cabinet-grotesk',
    name: 'Cabinet Grotesk',
    family: "'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
    category: 'Modern Streetwear & Display',
    badge: 'High-Impact Editorial',
    description: 'Bold neo-grotesque display font with distinctive geometric cuts and massive presence.',
  },
  {
    id: 'syne',
    name: 'Syne',
    family: "'Syne', sans-serif",
    category: 'Modern Streetwear & Display',
    badge: 'Avant-Garde Boutique',
    description: 'Artistic, sculptural geometric font designed for high-concept fashion & boutique labels.',
  },
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    family: "'Space Grotesk', sans-serif",
    category: 'Modern Streetwear & Display',
    badge: 'Cyber / Technical',
    description: 'Modernist brutalist sans with monospace vibes, ideal for modern urban streetwear.',
  },
  {
    id: 'satoshi',
    name: 'Satoshi',
    family: "'Satoshi', sans-serif",
    category: 'Swiss & Clean Sans',
    badge: 'Modern Grotesque',
    description: 'Refined contemporary sans inspired by modernist graphic design principles.',
  },
  {
    id: 'general-sans',
    name: 'General Sans',
    family: "'General Sans', sans-serif",
    category: 'Swiss & Clean Sans',
    badge: 'Contemporary Clean',
    description: 'Crisp, perfectly balanced Swiss sans that renders beautifully at any size.',
  },
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans',
    family: "'Plus Jakarta Sans', sans-serif",
    category: 'Swiss & Clean Sans',
    badge: 'Refined Body & Nav',
    description: 'Warm, friendly geometric sans optimized for ultra-legible digital e-commerce body text.',
  },
  {
    id: 'inter',
    name: 'Inter',
    family: "'Inter', sans-serif",
    category: 'Swiss & Clean Sans',
    badge: 'Hyper-Legible',
    description: 'World-renowned neutral typography for maximum legibility across complex catalogs.',
  },
  {
    id: 'dm-sans',
    name: 'DM Sans',
    family: "'DM Sans', sans-serif",
    category: 'Swiss & Clean Sans',
    badge: 'Editorial Prose',
    description: 'Low-contrast geometric sans offering smooth, effortless readability for paragraphs.',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    family: "'Montserrat', sans-serif",
    category: 'Swiss & Clean Sans',
    badge: 'Architectural Geometric',
    description: 'Classic geometric sans based on traditional urban signage in Buenos Aires.',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    family: "'Outfit', sans-serif",
    category: 'Swiss & Clean Sans',
    badge: 'Modern Fashion Sans',
    description: 'Sleek, airy modern geometric sans that gives a light luxury feel to titles and body.',
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    family: "'Playfair Display', Georgia, serif",
    category: 'Luxury Editorial Serif',
    badge: 'Haute Couture / Vogue',
    description: 'Dramatic high-contrast transitional serif reminiscent of European luxury fashion magazines.',
  },
  {
    id: 'cinzel',
    name: 'Cinzel',
    family: "'Cinzel', 'Times New Roman', serif",
    category: 'Luxury Editorial Serif',
    badge: 'Classic Heritage',
    description: 'Classical Roman inscriptional uppercase serif conveying timeless aristocratic luxury.',
  },
  {
    id: 'italiana',
    name: 'Italiana',
    family: "'Italiana', Didot, serif",
    category: 'Luxury Editorial Serif',
    badge: 'Italian Atelier',
    description: 'Elegantly proportioned Didot-style serif inspired by Italian calligraphy and fashion.',
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    family: "'JetBrains Mono', monospace",
    category: 'Technical Monospace',
    badge: 'Technical Specs & Code',
    description: 'Ultra-crisp developer monospace font for prices, SKU codes, and technical garment specs.',
  },
];

