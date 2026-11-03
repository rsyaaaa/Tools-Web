import { ConvertTargetFormat } from '../types';
import { loadImage } from './image-compressor';
import {
  encodeBmp,
  encodeIco,
  encodeTiff,
  encodePdf,
  encodeSvg,
  encodeEps,
} from './format-encoders';

export function getFormatLabel(mime: string): string {
  switch (mime.toLowerCase()) {
    case 'image/png':
      return 'PNG';
    case 'image/jpeg':
    case 'image/jpg':
      return 'JPEG / JPG';
    case 'image/webp':
      return 'WebP';
    case 'image/gif':
      return 'GIF';
    case 'image/bmp':
      return 'BMP';
    case 'image/tiff':
    case 'image/tif':
      return 'TIFF / TIF';
    case 'image/x-icon':
    case 'image/vnd.microsoft.icon':
      return 'ICO';
    case 'image/svg+xml':
      return 'SVG';
    case 'application/postscript':
      return 'EPS';
    case 'application/pdf':
      return 'PDF';
    case 'image/heic':
    case 'image/heif':
      return 'HEIC / HEIF';
    default:
      return mime.replace('image/', '').toUpperCase() || 'IMAGE';
  }
}

  export function getExtensionFromMime(mime: ConvertTargetFormat, useJpegExt: boolean = false): string {
    switch (mime) {
      case 'image/png':
        return 'png';
      case 'image/jpeg':
        return useJpegExt ? 'jpeg' : 'jpg';
      case 'image/webp':
        return 'webp';
      case 'image/gif':
        return 'gif';
      case 'image/bmp':
        return 'bmp';
      case 'image/tiff':
        return 'tiff';
      case 'image/x-icon':
        return 'ico';
      case 'image/svg+xml':
        return 'svg';
      case 'application/postscript':
        return 'eps';
      case 'application/pdf':
        return 'pdf';
      default:
        return 'png';
    }
  }

  export async function convertImage(
    sourceUrl: string,
    targetFormat: ConvertTargetFormat,
    quality: number = 0.92,
    backgroundColor: string = '#FFFFFF'
  ): Promise<{ blob: Blob; url: string; size: number; width: number; height: number }> {
    const img = await loadImage(sourceUrl);
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const requiresOpaqueBg = targetFormat === 'image/jpeg' || targetFormat === 'image/bmp';
    const ctx = canvas.getContext('2d', {
      alpha: !requiresOpaqueBg,
    });
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    // Smooth resampling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

      // Fill background if format requires no transparency
      if (requiresOpaqueBg) {
        ctx.fillStyle = backgroundColor || '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      let blob: Blob;

      switch (targetFormat) {
        case 'image/bmp':
          blob = encodeBmp(canvas);
          break;

        case 'image/x-icon':
          blob = await encodeIco(canvas, Math.min(256, Math.max(width, height)));
          break;

        case 'image/tiff':
          blob = encodeTiff(canvas);
          break;

        case 'application/pdf':
          blob = await encodePdf(canvas);
          break;

        case 'image/svg+xml':
          blob = encodeSvg(canvas);
          break;

        case 'application/postscript':
          blob = encodeEps(canvas);
          break;

        case 'image/gif':
          // Browsers often support canvas.toBlob('image/gif'); if not supported, fallback to image/png
          blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob(
              (b) => {
                if (b && b.type === 'image/gif') resolve(b);
                else {
                  // Fallback to PNG wrapped as GIF blob
                  canvas.toBlob((pb) => resolve(new Blob([pb!], { type: 'image/gif' })), 'image/png');
                }
              },
              'image/gif'
            );
          });
          break;

        case 'image/png':
          blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png');
          });
          break;

        case 'image/jpeg':
          blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('JPEG export failed'))), 'image/jpeg', quality);
          });
          break;

        case 'image/webp':
        default:
          blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('WebP export failed'))), 'image/webp', quality);
          });
          break;
      }

      const url = URL.createObjectURL(blob);

      return {
        blob,
        url,
        size: blob.size,
        width,
        height,
      };
    }

    export function downloadConvertedFile(
      blob: Blob,
      originalName: string,
  targetFormat: ConvertTargetFormat,
      useJpegExt: boolean = false
    ) {
      const ext = getExtensionFromMime(targetFormat, useJpegExt);
      const baseName = originalName.replace(/\.[^/.]+$/, '');
      const fileName = `${baseName}.${ext}`;

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }
