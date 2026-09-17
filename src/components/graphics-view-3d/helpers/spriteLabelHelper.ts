import * as THREE from 'three';

// Cache for canvas textures to prevent re-allocating textures for identical labels
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Generates or retrieves a high-DPI cached canvas texture for a text string
 */
export function getOrCreateTextTexture(
  text: string,
  color: string,
  fontSize: number = 28,
  bold: boolean = true
): THREE.CanvasTexture {
  const cacheKey = `${text}_${color}_${fontSize}_${bold ? '1' : '0'}`;
  const existing = textureCache.get(cacheKey);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const dummy = new THREE.CanvasTexture(canvas);
    return dummy;
  }

  const dpr = 2; // High-DPI for crisp text
  const fontStyle = `${bold ? 'bold ' : ''}${fontSize * dpr}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
  ctx.font = fontStyle;

  const textMetrics = ctx.measureText(text);
  const textWidth = Math.ceil(textMetrics.width);
  const textHeight = Math.ceil(fontSize * 1.4 * dpr);

  const padding = 8 * dpr;
  canvas.width = Math.max(32 * dpr, textWidth + padding * 2);
  canvas.height = Math.max(32 * dpr, textHeight + padding);

  // Re-set font after canvas resize
  ctx.font = fontStyle;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw text
  ctx.fillStyle = color;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates a lightweight billboard THREE.Sprite for 3D text labels
 */
export function createTextSprite(
  text: string,
  color: string,
  scale: number = 0.65,
  fontSize: number = 28,
  bold: boolean = true
): THREE.Sprite {
  const texture = getOrCreateTextTexture(text, color, fontSize, bold);
  const canvas = texture.image as HTMLCanvasElement;
  const aspect = canvas.width / canvas.height;

  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(scale * aspect, scale, 1);
  return sprite;
}

/**
 * Clears the texture cache on full cleanup
 */
export function clearSpriteTextureCache(): void {
  textureCache.forEach((tex) => tex.dispose());
  textureCache.clear();
}
