import { DominantColor, PaletteAnalysis, PhotoboothMood } from '../types';

/**
 * Converts RGB numbers to hex code
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const hex = [clamp(r), clamp(g), clamp(b)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
  return `#${hex.toUpperCase()}`;
}

/**
 * Calculates luminance: Y = 0.299R + 0.587G + 0.114B
 */
export function calculateLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Fast Euclidean distance between two RGB vectors
 */
function colorDistanceSq(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return dr * dr + dg * dg + db * db;
}

/**
 * Client-side K-Means Color Quantization executed on 100x100 downsampled buffer (< 200ms)
 */
export async function extractPaletteFromImage(
  imageSource: HTMLImageElement | HTMLCanvasElement | string,
  k: number = 4
): Promise<PaletteAnalysis> {
  const startTime = performance.now();

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;

  if (typeof imageSource === 'string') {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageSource;
    });
    canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.drawImage(img, 0, 0, 100, 100);
  } else {
    canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.drawImage(imageSource, 0, 0, 100, 100);
  }

  const imageData = ctx.getImageData(0, 0, 100, 100);
  const data = imageData.data;

  // 1. Collect pixel RGB samples (ignore transparent pixels)
  const pixels: [number, number, number][] = [];
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 128) continue; // skip transparent
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    pixels.push([r, g, b]);
    sumR += r;
    sumG += g;
    sumB += b;
  }

  const totalPixels = pixels.length || 1;
  const avgR = sumR / totalPixels;
  const avgG = sumG / totalPixels;
  const avgB = sumB / totalPixels;
  const avgLuminance = calculateLuminance(avgR, avgG, avgB);

  // 2. Centroid initialization (k-means++ style spread)
  const centroids: [number, number, number][] = [];
  // First centroid: pixel closest to center average
  centroids.push([Math.round(avgR), Math.round(avgG), Math.round(avgB)]);

  // Pick remaining k-1 centroids that are furthest from existing centroids
  for (let c = 1; c < k; c++) {
    let bestPixel = pixels[Math.floor(Math.random() * pixels.length)];
    let maxDist = -1;

    // Sample candidate pixels
    const sampleSize = Math.min(200, pixels.length);
    for (let s = 0; s < sampleSize; s++) {
      const p = pixels[Math.floor((s / sampleSize) * pixels.length)];
      // find min distance to any existing centroid
      let minDist = Infinity;
      for (const existing of centroids) {
        const d = colorDistanceSq(p[0], p[1], p[2], existing[0], existing[1], existing[2]);
        if (d < minDist) minDist = d;
      }
      if (minDist > maxDist) {
        maxDist = minDist;
        bestPixel = p;
      }
    }
    centroids.push([bestPixel[0], bestPixel[1], bestPixel[2]]);
  }

  // 3. Lloyd's K-Means clustering iterations
  const maxIterations = 12;
  const clusterCounts = new Array(k).fill(0);
  const clusterSums = Array.from({ length: k }, () => [0, 0, 0]);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Reset cluster stats
    for (let c = 0; c < k; c++) {
      clusterCounts[c] = 0;
      clusterSums[c][0] = 0;
      clusterSums[c][1] = 0;
      clusterSums[c][2] = 0;
    }

    // Assign pixels to closest centroid
    for (let i = 0; i < pixels.length; i++) {
      const [r, g, b] = pixels[i];
      let bestIdx = 0;
      let bestDist = Infinity;

      for (let c = 0; c < k; c++) {
        const d = colorDistanceSq(r, g, b, centroids[c][0], centroids[c][1], centroids[c][2]);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = c;
        }
      }

      clusterCounts[bestIdx]++;
      clusterSums[bestIdx][0] += r;
      clusterSums[bestIdx][1] += g;
      clusterSums[bestIdx][2] += b;
    }

    // Update centroids and track max change
    let maxShift = 0;
    for (let c = 0; c < k; c++) {
      if (clusterCounts[c] > 0) {
        const newR = Math.round(clusterSums[c][0] / clusterCounts[c]);
        const newG = Math.round(clusterSums[c][1] / clusterCounts[c]);
        const newB = Math.round(clusterSums[c][2] / clusterCounts[c]);

        const shift = Math.sqrt(
          colorDistanceSq(newR, newG, newB, centroids[c][0], centroids[c][1], centroids[c][2])
        );
        if (shift > maxShift) maxShift = shift;

        centroids[c] = [newR, newG, newB];
      }
    }

    if (maxShift < 1.0) break; // Converged
  }

  // 4. Build dominant color objects
  const dominantColors: DominantColor[] = centroids.map((c, idx) => {
    const lum = calculateLuminance(c[0], c[1], c[2]);
    return {
      rgb: c,
      hex: rgbToHex(c[0], c[1], c[2]),
      luminance: Math.round(lum),
      frequency: clusterCounts[idx] / totalPixels,
    };
  });

  // Sort descending by frequency
  dominantColors.sort((a, b) => b.frequency - a.frequency);

  // 5. Tone & Mood Analyzer
  const rToBRatio = (avgR + 1) / (avgB + 1);
  const bToRRatio = (avgB + 1) / (avgR + 1);

  let mood: PhotoboothMood;
  let colorTemperature: 'warm' | 'cool' | 'neutral';

  if (rToBRatio > 1.15) {
    colorTemperature = 'warm';
  } else if (bToRRatio > 1.15) {
    colorTemperature = 'cool';
  } else {
    colorTemperature = 'neutral';
  }

  if (avgLuminance < 90) {
    mood = 'Moody Dark';
  } else if (avgLuminance > 165) {
    mood = 'Pastel Bright';
  } else if (colorTemperature === 'warm') {
    mood = 'Warm Vintage';
  } else if (colorTemperature === 'cool') {
    mood = 'Cyber Cool';
  } else {
    mood = avgLuminance >= 128 ? 'Pastel Bright' : 'Warm Vintage';
  }

  // 6. Harmonious Auto-Template Theme assignment
  let suggestedFrameColor: string;
  let suggestedBorderColor: string;
  let suggestedTextColor: string;

  switch (mood) {
    case 'Warm Vintage':
      suggestedFrameColor = '#F2E8DC';
      suggestedBorderColor = '#D4C4B2';
      suggestedTextColor = '#4A3B32';
      break;
    case 'Moody Dark':
      suggestedFrameColor = '#18181A';
      suggestedBorderColor = '#2F2F36';
      suggestedTextColor = '#E6E6E8';
      break;
    case 'Pastel Bright':
      suggestedFrameColor = '#FAF7F2';
      suggestedBorderColor = '#E8E1D7';
      suggestedTextColor = '#38332E';
      break;
    case 'Cyber Cool':
      suggestedFrameColor = '#131B24';
      suggestedBorderColor = '#243547';
      suggestedTextColor = '#DDE8F4';
      break;
  }

  const duration = performance.now() - startTime;

  return {
    colors: dominantColors,
    mood,
    suggestedFrameColor,
    suggestedBorderColor,
    suggestedTextColor,
    colorTemperature,
    averageLuminance: Math.round(avgLuminance),
    processingTimeMs: Math.round(duration),
  };
}

