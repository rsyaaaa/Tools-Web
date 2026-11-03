export type ActiveTool = 'home' | 'compressor' | 'photobooth' | 'converter';

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

// --- Image Converter Types ---
export type ConvertTargetFormat =
  | 'image/png'
  | 'image/jpeg'
  | 'image/webp'
  | 'image/gif'
  | 'image/bmp'
  | 'image/tiff'
  | 'image/x-icon'
  | 'image/svg+xml'
  | 'application/postscript'
  | 'application/pdf';

export interface ConvertSettings {
  targetFormat: ConvertTargetFormat;
  quality: number; // 0.1 to 1.0
  backgroundColor: string; // Used when converting transparent PNG to JPEG
}

export interface ConvertTaskItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalFormat: string;
  originalWidth: number;
  originalHeight: number;
  previewUrl: string;
  targetFormat: ConvertTargetFormat;
  quality: number;
  backgroundColor: string;
  status: 'pending' | 'converting' | 'completed' | 'error';
  convertedBlob: Blob | null;
  convertedUrl: string | null;
  convertedSize: number | null;
  errorMessage?: string;
}
