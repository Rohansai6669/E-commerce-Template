/**
 * Performance-focused image optimization configuration constants and aspect ratio utilities.
 */
export const IMAGE_PRESETS = {
  /**
   * Standard responsive image sizing configurations for grid list items.
   */
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw',
  
  /**
   * Sizing configurations for large full-screen above-the-fold banners.
   */
  banner: '100vw',
  
  /**
   * Detailed PDP layout gallery size rules.
   */
  gallery: '(max-width: 768px) 100vw, 50vw',
  
  /**
   * Sizing config for small itemized list checkout items avatars.
   */
  avatar: '48px',
};

/**
 * Generates custom aspect ratio inline style settings.
 */
export function getAspectRatioStyle(width: number, height: number): React.CSSProperties {
  return {
    aspectRatio: `${width} / ${height}`,
  };
}
export default IMAGE_PRESETS;
