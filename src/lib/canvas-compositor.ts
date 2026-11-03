import { CapturedPhoto, StripConfig } from '../types';
import { loadImage } from './image-compressor';

/**
 * Creates procedural film grain texture buffer
 */
function createNoiseBuffer(width: number, height: number, intensity: number): HTMLCanvasElement {
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = width;
  noiseCanvas.height = height;
  const ctx = noiseCanvas.getContext('2d');
  if (!ctx) return noiseCanvas;

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;
  const amount = Math.min(255, Math.max(0, intensity * 255));

  for (let i = 0; i < data.length; i += 4) {
    const val = (Math.random() - 0.5) * amount * 2;
    data[i] = 128 + val;
    data[i + 1] = 128 + val;
    data[i + 2] = 128 + val;
    data[i + 3] = Math.round(intensity * 180); // alpha
  }

  ctx.putImageData(imgData, 0, 0);
  return noiseCanvas;
}

/**
 * Renders the photobooth strip onto a high-resolution Canvas
 */
export async function renderPhotoboothStrip(
  photos: CapturedPhoto[],
  config: StripConfig
): Promise<HTMLCanvasElement> {
  const count = Math.min(photos.length, config.shotCount);
  const stripWidth = 800; // Base high-res width
  const marginX = config.innerPadding || 44;
  const marginTop = config.innerPadding || 44;
  const photoGap = 24;
  const footerHeight = 130;

  const photoWidth = stripWidth - marginX * 2;
  // Aspect ratio 4:3 for each photo
  const photoHeight = Math.round(photoWidth * 0.75);

  const totalHeight = marginTop + count * photoHeight + (count - 1) * photoGap + footerHeight;

  const canvas = document.createElement('canvas');
  canvas.width = stripWidth;
  canvas.height = totalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // 1. Fill Frame Background
  ctx.fillStyle = config.frameColor;
  ctx.fillRect(0, 0, stripWidth, totalHeight);

  // 2. Outer decorative border if configured
  if (config.borderWidth > 0 && config.borderColor) {
    ctx.strokeStyle = config.borderColor;
    ctx.lineWidth = config.borderWidth;
    ctx.strokeRect(
      config.borderWidth / 2,
      config.borderWidth / 2,
      stripWidth - config.borderWidth,
      totalHeight - config.borderWidth
    );
  }

  // 3. Draw Photos
  for (let i = 0; i < count; i++) {
    const photo = photos[i];
    const yPos = marginTop + i * (photoHeight + photoGap);

    const img = await loadImage(photo.dataUrl);

    // Subtle photo frame / border
    ctx.save();

    // Rounded rectangle path for photo
    const radius = 6;
    ctx.beginPath();
    ctx.moveTo(marginX + radius, yPos);
    ctx.lineTo(marginX + photoWidth - radius, yPos);
    ctx.quadraticCurveTo(marginX + photoWidth, yPos, marginX + photoWidth, yPos + radius);
    ctx.lineTo(marginX + photoWidth, yPos + photoHeight - radius);
    ctx.quadraticCurveTo(
      marginX + photoWidth,
      yPos + photoHeight,
      marginX + photoWidth - radius,
      yPos + photoHeight
    );
    ctx.lineTo(marginX + radius, yPos + photoHeight);
    ctx.quadraticCurveTo(marginX, yPos + photoHeight, marginX, yPos + photoHeight - radius);
    ctx.lineTo(marginX, yPos + radius);
    ctx.quadraticCurveTo(marginX, yPos, marginX + radius, yPos);
    ctx.closePath();
    ctx.clip();

    // Center crop image to fit 4:3
    const imgRatio = img.width / img.height;
    const targetRatio = photoWidth / photoHeight;
    let sW = img.width;
    let sH = img.height;
    let sX = 0;
    let sY = 0;

    if (imgRatio > targetRatio) {
      sW = img.height * targetRatio;
      sX = (img.width - sW) / 2;
    } else {
      sH = img.width / targetRatio;
      sY = (img.height - sH) / 2;
    }

    ctx.drawImage(img, sX, sY, sW, sH, marginX, yPos, photoWidth, photoHeight);
    ctx.restore();

    // Subtle inner border line around the photo
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(marginX, yPos, photoWidth, photoHeight);
  }

  // 4. Procedural Film Grain Overlay
  if (config.grainIntensity > 0) {
    const noise = createNoiseBuffer(stripWidth, totalHeight, config.grainIntensity);
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(noise, 0, 0);
    ctx.restore();
  }

  // 5. Metadata and Typography Stamping in Footer Area
  const footerStartY = totalHeight - footerHeight + 20;

  ctx.fillStyle = config.textColor;
  ctx.textAlign = 'center';

  // Branding Label
  const displayLabel = config.label || 'GRAPHIXLAB PHOTOBOOTH';
  ctx.font = 'bold 20px ui-sans-serif, system-ui, sans-serif';
  ctx.letterSpacing = '0.12em';
  ctx.fillText(displayLabel.toUpperCase(), stripWidth / 2, footerStartY + 30);

  // Timestamp and Monospace Metadata
  if (config.showTimestamp) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '.');
    const timeStr = now.toTimeString().slice(0, 8);
    const metaString = `${dateStr} // ${timeStr} · AI PALETTE QUANTIZED`;

    ctx.font = '400 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    ctx.letterSpacing = '0.08em';
    ctx.globalAlpha = 0.75;
    ctx.fillText(metaString, stripWidth / 2, footerStartY + 62);
    ctx.globalAlpha = 1.0;
  }

  // Small bottom accent line
  ctx.strokeStyle = config.textColor;
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(stripWidth / 2 - 40, footerStartY + 82);
  ctx.lineTo(stripWidth / 2 + 40, footerStartY + 82);
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  return canvas;
}

/**
 * Downloads photobooth strip as high-res PNG
 */
export async function downloadPhotoboothStrip(
  canvas: HTMLCanvasElement,
  customName?: string
): Promise<void> {
  const dateTag = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const fileName = customName ? `${customName}.png` : `graphixlab-strip-${dateTag}.png`;

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      resolve();
    }, 'image/png');
  });
}

