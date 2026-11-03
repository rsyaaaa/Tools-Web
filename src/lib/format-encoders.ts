/**
 * 100% Client-Side Pure Binary Encoders for BMP, ICO, TIFF, PDF, SVG, and EPS
 * Zero external servers, in-memory client processing.
 */

/**
 * Encodes an HTMLCanvasElement into a 24-bit uncompressed Windows BMP file
 */
export function encodeBmp(canvas: HTMLCanvasElement): Blob {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Row size padded to multiple of 4 bytes
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // 1. BMP Header (14 bytes)
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4d); // 'M'
  view.setUint32(2, fileSize, true); // File size
  view.setUint16(6, 0, true); // Reserved
  view.setUint16(8, 0, true); // Reserved
  view.setUint32(10, 54, true); // Offset to pixel data

  // 2. DIB Header (BITMAPINFOHEADER - 40 bytes)
  view.setUint32(14, 40, true); // Header size
  view.setInt32(18, width, true); // Width
  view.setInt32(22, height, true); // Height (positive = bottom-up)
  view.setUint16(26, 1, true); // Color planes
  view.setUint16(28, 24, true); // Bits per pixel (24-bit RGB)
  view.setUint32(30, 0, true); // Compression (BI_RGB)
  view.setUint32(34, pixelArraySize, true); // Image size
  view.setInt32(38, 2835, true); // X pixels/m (approx 72 DPI)
  view.setInt32(42, 2835, true); // Y pixels/m
  view.setUint32(46, 0, true); // Colors in color table
  view.setUint32(50, 0, true); // Important colors

  // 3. Pixel Data (Bottom-to-top, BGR order)
  let offset = 54;
  for (let y = height - 1; y >= 0; y--) {
    const rowStart = y * width * 4;
    for (let x = 0; x < width; x++) {
      const idx = rowStart + x * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      view.setUint8(offset++, b);
      view.setUint8(offset++, g);
      view.setUint8(offset++, r);
    }

    // Row padding
    const padding = rowSize - width * 3;
    for (let p = 0; p < padding; p++) {
      view.setUint8(offset++, 0);
    }
  }

  return new Blob([buffer], { type: 'image/bmp' });
}

/**
 * Encodes an HTMLCanvasElement into a Windows Icon (.ico) file
 * Modern Windows ICO format embeds standard PNG data inside the ICO container
 */
export async function encodeIco(canvas: HTMLCanvasElement, targetSize: number = 256): Promise<Blob> {
  // Scale canvas to icon dimensions (e.g. 256, 128, 64, 32, 16)
  const icoCanvas = document.createElement('canvas');
  const size = Math.min(256, Math.max(16, targetSize));
  icoCanvas.width = size;
  icoCanvas.height = size;
  const ctx = icoCanvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, size, size);
  }

  const pngBlob = await new Promise<Blob>((resolve, reject) => {
    icoCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png');
  });

  const pngBytes = await pngBlob.arrayBuffer();
  const pngLength = pngBytes.byteLength;

  // Total size: 6 (ICONDIR) + 16 (ICONDIRENTRY) + pngLength
  const totalSize = 22 + pngLength;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // 1. ICONDIR (6 bytes)
  view.setUint16(0, 0, true); // Reserved (must be 0)
  view.setUint16(2, 1, true); // Type: 1 = ICO
  view.setUint16(4, 1, true); // Image count: 1

  // 2. ICONDIRENTRY (16 bytes)
  view.setUint8(6, size >= 256 ? 0 : size); // Width (0 means 256)
  view.setUint8(7, size >= 256 ? 0 : size); // Height
  view.setUint8(8, 0); // Palette colors
  view.setUint8(9, 0); // Reserved
  view.setUint16(10, 1, true); // Color planes
  view.setUint16(12, 32, true); // Bits per pixel
  view.setUint32(14, pngLength, true); // Resource size in bytes
  view.setUint32(18, 22, true); // Offset to image data (22)

  // 3. PNG Image Data
  new Uint8Array(buffer, 22).set(new Uint8Array(pngBytes));

  return new Blob([buffer], { type: 'image/x-icon' });
}

/**
 * Encodes an HTMLCanvasElement into a Baseline 24-bit RGB TIFF file (.tif / .tiff)
 */
export function encodeTiff(canvas: HTMLCanvasElement): Blob {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Uncompressed RGB strip
  const rawBytes = new Uint8Array(width * height * 3);
  let rawIdx = 0;
  for (let i = 0; i < data.length; i += 4) {
    rawBytes[rawIdx++] = data[i]; // R
    rawBytes[rawIdx++] = data[i + 1]; // G
    rawBytes[rawIdx++] = data[i + 2]; // B
  }

  const numDirEntries = 12;
  const ifdSize = 2 + numDirEntries * 12 + 4;
  const extraDataOffset = 8 + ifdSize;
  const extraDataSize = 6 + 8 + 8; // BitsPerSample(6) + XRes(8) + YRes(8)
  const imageOffset = extraDataOffset + extraDataSize;
  const totalFileSize = imageOffset + rawBytes.length;

  const buffer = new ArrayBuffer(totalFileSize);
  const view = new DataView(buffer);

  // 1. TIFF Header (8 bytes)
  view.setUint8(0, 0x49); // 'I' (Little-endian Intel)
  view.setUint8(1, 0x49); // 'I'
  view.setUint16(2, 42, true); // Magic 42
  view.setUint32(4, 8, true); // Offset to first IFD (8)

  // 2. IFD Entries
  let ifdOffset = 8;
  view.setUint16(ifdOffset, numDirEntries, true);
  ifdOffset += 2;

  const writeTag = (tag: number, type: number, count: number, valueOrOffset: number) => {
    view.setUint16(ifdOffset, tag, true);
    view.setUint16(ifdOffset + 2, type, true);
    view.setUint32(ifdOffset + 4, count, true);
    view.setUint32(ifdOffset + 8, valueOrOffset, true);
    ifdOffset += 12;
  };

  // Tag 256: ImageWidth (SHORT=3, count=1)
  writeTag(256, 4, 1, width);
  // Tag 257: ImageLength
  writeTag(257, 4, 1, height);
  // Tag 258: BitsPerSample (3 SHORTs, offset to extraDataOffset)
  writeTag(258, 3, 3, extraDataOffset);
  // Tag 259: Compression (1 = uncompressed)
  writeTag(259, 3, 1, 1);
  // Tag 262: PhotometricInterpretation (2 = RGB)
  writeTag(262, 3, 1, 2);
  // Tag 273: StripOffsets (points to rawBytes)
  writeTag(273, 4, 1, imageOffset);
  // Tag 277: SamplesPerPixel (3)
  writeTag(277, 3, 1, 3);
  // Tag 278: RowsPerStrip (height)
  writeTag(278, 4, 1, height);
  // Tag 279: StripByteCounts (size of rawBytes)
  writeTag(279, 4, 1, rawBytes.length);
  // Tag 282: XResolution (RATIONAL=5, count=1, offset)
  writeTag(282, 5, 1, extraDataOffset + 6);
  // Tag 283: YResolution (RATIONAL=5, count=1, offset)
  writeTag(283, 5, 1, extraDataOffset + 14);
  // Tag 296: ResolutionUnit (2 = inch)
  writeTag(296, 3, 1, 2);

  // Next IFD offset (0 = none)
  view.setUint32(ifdOffset, 0, true);

  // 3. Extra Data Values:
  // BitsPerSample values: [8, 8, 8]
  view.setUint16(extraDataOffset, 8, true);
  view.setUint16(extraDataOffset + 2, 8, true);
  view.setUint16(extraDataOffset + 4, 8, true);

  // XResolution: 72/1
  view.setUint32(extraDataOffset + 6, 72, true);
  view.setUint32(extraDataOffset + 10, 1, true);

  // YResolution: 72/1
  view.setUint32(extraDataOffset + 14, 72, true);
  view.setUint32(extraDataOffset + 18, 1, true);

  // 4. Raw Image Data
  new Uint8Array(buffer, imageOffset).set(rawBytes);

  return new Blob([buffer], { type: 'image/tiff' });
}

/**
 * Encodes an HTMLCanvasElement into a Single-Page PDF Document (.pdf)
 */
export async function encodePdf(canvas: HTMLCanvasElement): Promise<Blob> {
  const width = canvas.width;
  const height = canvas.height;

  // Convert canvas to JPEG blob
  const jpegBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('JPEG export failed'))), 'image/jpeg', 0.95);
  });

  const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
  const jpegLen = jpegBytes.length;

  const header = `%PDF-1.4\n`;
  const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`;
  const obj4Header = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegLen} >>\nstream\n`;
  const obj4Footer = `\nendstream\nendobj\n`;
  const contentStream = `q\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ\n`;
  const obj5 = `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`;

  // Byte calculations
  const enc = new TextEncoder();
  const bHeader = enc.encode(header);
  const bObj1 = enc.encode(obj1);
  const bObj2 = enc.encode(obj2);
  const bObj3 = enc.encode(obj3);
  const bObj4H = enc.encode(obj4Header);
  const bObj4F = enc.encode(obj4Footer);
  const bObj5 = enc.encode(obj5);

  const offset1 = bHeader.length;
  const offset2 = offset1 + bObj1.length;
  const offset3 = offset2 + bObj2.length;
  const offset4 = offset3 + bObj3.length;
  const offset5 = offset4 + bObj4H.length + jpegLen + bObj4F.length;
  const xrefOffset = offset5 + bObj5.length;

  const pad = (n: number) => n.toString().padStart(10, '0');
  const xref = `xref\n0 6\n0000000000 65535 f \n${pad(offset1)} 00000 n \n${pad(offset2)} 00000 n \n${pad(offset3)} 00000 n \n${pad(offset4)} 00000 n \n${pad(offset5)} 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  const bXref = enc.encode(xref);

  const totalLength = xrefOffset + bXref.length;
  const finalBuffer = new Uint8Array(totalLength);

  let cur = 0;
  finalBuffer.set(bHeader, cur); cur += bHeader.length;
  finalBuffer.set(bObj1, cur); cur += bObj1.length;
  finalBuffer.set(bObj2, cur); cur += bObj2.length;
  finalBuffer.set(bObj3, cur); cur += bObj3.length;
  finalBuffer.set(bObj4H, cur); cur += bObj4H.length;
  finalBuffer.set(jpegBytes, cur); cur += jpegLen;
  finalBuffer.set(bObj4F, cur); cur += bObj4F.length;
  finalBuffer.set(bObj5, cur); cur += bObj5.length;
  finalBuffer.set(bXref, cur);

  return new Blob([finalBuffer], { type: 'application/pdf' });
}

/**
 * Encodes an HTMLCanvasElement into a Scalable Vector Graphics wrapper (.svg)
 */
export function encodeSvg(canvas: HTMLCanvasElement): Blob {
  const width = canvas.width;
  const height = canvas.height;
  const dataUrl = canvas.toDataURL('image/png');

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image width="${width}" height="${height}" href="${dataUrl}"/>
</svg>`;

  return new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
}

/**
 * Encodes an HTMLCanvasElement into an Encapsulated PostScript (.eps) file
 */
export function encodeEps(canvas: HTMLCanvasElement, title: string = 'GraphixLab Image'): Blob {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let hexStream = '';
  let lineCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i].toString(16).padStart(2, '0');
    const g = data[i + 1].toString(16).padStart(2, '0');
    const b = data[i + 2].toString(16).padStart(2, '0');
    hexStream += r + g + b;
    lineCount += 6;
    if (lineCount >= 72) {
      hexStream += '\n';
      lineCount = 0;
    }
  }

  const epsContent = `%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: 0 0 ${width} ${height}
%%Title: ${title}
%%Creator: GraphixLab Client-Side Visual Utilities
%%Pages: 1
%%LanguageLevel: 2
%%EndComments
%%BeginProlog
%%EndProlog
%%Page: 1 1
gsave
0 0 translate
${width} ${height} scale
/picstr ${width * 3} string def
${width} ${height} 8
[ ${width} 0 0 -${height} 0 ${height} ]
{ currentfile picstr readhexstring pop }
false 3 colorimage
${hexStream}
grestore
showpage
%%EOF
`;

  return new Blob([epsContent], { type: 'application/postscript' });
}

/**
 * Dynamic HEIC/HEIF decoder for browser
 */
export async function decodeHeicIfSupported(file: File): Promise<Blob> {
  const isHeic =
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif') ||
    file.type === 'image/heic' ||
    file.type === 'image/heif';

  if (!isHeic) return file;

  try {
    const heic2any = (await import('heic2any')).default;
    const converted = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.95,
    });

    return Array.isArray(converted) ? converted[0] : converted;
  } catch (err) {
    console.warn('HEIC conversion fallback error:', err);
    throw new Error('Gagal mendekode berkas HEIC. Pastikan file valid.');
  }
}

