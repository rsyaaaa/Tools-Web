export type ActiveTool = 'home' | 'compressor' | 'photobooth';

export type CameraStatus = 'inactive' | 'ready' | 'streaming' | 'permission-denied' | 'unsupported';

export type VisualEngineStatus = 'canvas-2d' | 'hardware-accelerated';

// --- Image Compressor Types ---
export interface ImageFileMeta {
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  dataUrl: string;
  aspectRatio: number;
}

export type ScaleMode = 'percent' | 'manual';

export interface CompressionSettings {
  scaleMode: ScaleMode;
  scalePercent: number; // e.g. 100, 75, 50, 25
  customWidth: number;
  customHeight: number;
  lockAspectRatio: boolean;
  quality: number; // 0.1 to 1.0 (step 0.05)
  outputFormat: 'image/jpeg' | 'image/webp';
}

export interface CompressionResult {
  blob: Blob;
  dataUrl: string;
  size: number;
  width: number;
  height: number;
  reductionPercent: number;
  processingTimeMs: number;
}

// --- Photobooth Types ---
export type PhotoboothMood = 'Warm Vintage' | 'Moody Dark' | 'Pastel Bright' | 'Cyber Cool';

export interface DominantColor {
  rgb: [number, number, number];
  hex: string;
  luminance: number;
  frequency: number; // fraction of sampled pixels
}

export interface PaletteAnalysis {
  colors: DominantColor[];
  mood: PhotoboothMood;
  suggestedFrameColor: string;
  suggestedBorderColor: string;
  suggestedTextColor: string;
  colorTemperature: 'warm' | 'cool' | 'neutral';
  averageLuminance: number;
  processingTimeMs: number;
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  blob?: Blob;
  width: number;
  height: number;
}

export interface StripConfig {
  shotCount: 3 | 4;
  frameColor: string;
  borderColor: string;
  textColor: string;
  label: string;
  showTimestamp: boolean;
  grainIntensity: number; // 0 to 0.25
  innerPadding: number;
  borderWidth: number;
}

