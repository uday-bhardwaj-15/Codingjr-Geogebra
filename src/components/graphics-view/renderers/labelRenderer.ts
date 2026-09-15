export interface LabelRenderOptions {
  fontSize?: number;
  fontFamily?: string;
  isBold?: boolean;
  isItalic?: boolean;
  color?: string;
}

export function renderSubscriptLabel(
  ctx: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
  options: LabelRenderOptions = {}
): { width: number; height: number } {
  const fontSize = options.fontSize || 12;
  const fontFamily = options.fontFamily || 'Inter, -apple-system, sans-serif';
  const weight = options.isBold ? '600' : '500';
  const style = options.isItalic ? 'italic' : 'normal';
  const color = options.color || '#1e293b';

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // White text halo for high contrast and readability
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;

  // Check for subscript underscore: e.g. K_3, P_1, A_10, Q_{12}
  const underscoreIndex = label.indexOf('_');
  if (underscoreIndex === -1) {
    ctx.font = `${style} ${weight} ${fontSize}px ${fontFamily}`;
    ctx.strokeText(label, x, y);
    ctx.fillStyle = color;
    ctx.fillText(label, x, y);
    const metrics = ctx.measureText(label);
    ctx.restore();
    return { width: metrics.width, height: fontSize };
  }

  const baseText = label.substring(0, underscoreIndex);
  let subText = label.substring(underscoreIndex + 1);
  if (subText.startsWith('{') && subText.endsWith('}')) {
    subText = subText.substring(1, subText.length - 1);
  }

  // 1. Draw base text
  ctx.font = `${style} ${weight} ${fontSize}px ${fontFamily}`;
  ctx.strokeText(baseText, x, y);
  ctx.fillStyle = color;
  ctx.fillText(baseText, x, y);
  const baseWidth = ctx.measureText(baseText).width;

  // 2. Draw subscript text at 72% font size, dropped down slightly
  const subFontSize = Math.max(8, Math.round(fontSize * 0.72));
  const subYOffset = Math.round(fontSize * 0.35);
  ctx.font = `${style} ${weight} ${subFontSize}px ${fontFamily}`;
  ctx.strokeText(subText, x + baseWidth + 1, y + subYOffset);
  ctx.fillStyle = color;
  ctx.fillText(subText, x + baseWidth + 1, y + subYOffset);
  const subWidth = ctx.measureText(subText).width;

  ctx.restore();
  return {
    width: baseWidth + 1 + subWidth,
    height: fontSize + subYOffset,
  };
}

