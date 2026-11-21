/**
 * SVG previews should stay byte-for-byte as authored. Real raster screenshots
 * use Next.js image optimization automatically.
 */
export function bypassImageOptimization(src: string): boolean {
  return /\.svg(?:$|\?)/i.test(src);
}
