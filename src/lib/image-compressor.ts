import { ImageFileMeta, CompressionSettings, CompressionResult } from '../types';

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Calculates target width and height according to settings
 */
export function calculateTargetDimensions(
  origW: number,
  origH: number,
  settings: CompressionSettings
): { targetWidth: number; targetHeight: number } {
  if (settings.scaleMode === 'percent') {
    const factor = settings.scalePercent / 100;
    const targetWidth = Math.max(1, Math.round(origW * factor));
    const targetHeight = Math.max(1, Math.round(origH * factor));
    return { targetWidth, targetHeight };
  } else {
    let targetWidth = Math.max(1, settings.customWidth || origW);
    let targetHeight = Math.max(1, settings.customHeight || origH);

    if (settings.lockAspectRatio) {
      const ratio = origW / origH;
      // If user specified customWidth, adjust height
      if (settings.customWidth && !settings.customHeight) {
        targetHeight = Math.max(1, Math.round(targetWidth / ratio));
      } else if (settings.customHeight && !settings.customWidth) {
        targetWidth = Math.max(1, Math.round(targetHeight * ratio));
      }
    }
    return { targetWidth, targetHeight };
  }
}

/**
 * Compresses an image in the browser via Canvas 2D
 */
export async function compressImage(
  meta: ImageFileMeta,
  settings: CompressionSettings
): Promise<CompressionResult> {
  const startTime = performance.now();
  const img = await loadImage(meta.dataUrl);

  const { targetWidth, targetHeight } = calculateTargetDimensions(
    meta.originalWidth,
    meta.originalHeight,
    settings
  );

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d', { alpha: settings.outputFormat === 'image/webp' });
  if (!ctx) {
    throw new Error('Canvas 2D context is not available');
  }

  // Smooth downsampling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // If output is JPEG and image has transparency, paint white background first
  if (settings.outputFormat === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Convert to Blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to create image blob'));
      },
      settings.outputFormat,
      settings.quality
    );
  });

  const duration = performance.now() - startTime;
  const compressedUrl = URL.createObjectURL(blob);
  const reductionPercent = ((meta.originalSize - blob.size) / meta.originalSize) * 100;

  return {
    blob,
    dataUrl: compressedUrl,
    size: blob.size,
    width: targetWidth,
    height: targetHeight,
    reductionPercent: Math.round(reductionPercent * 10) / 10,
    processingTimeMs: Math.round(duration),
  };
}

export function downloadBlob(blob: Blob, originalName: string, outputFormat: string) {
  const ext = outputFormat === 'image/webp' ? 'webp' : 'jpg';
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const fileName = `${baseName}-compressed.${ext}`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

