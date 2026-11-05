import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { HomeView } from './components/home/HomeView';
import { Dropzone } from './components/compressor/Dropzone';
import { CompressionControls } from './components/compressor/CompressionControls';
import { CompareView } from './components/compressor/CompareView';
import { CameraView } from './components/photobooth/CameraView';
import { PaletteCard } from './components/photobooth/PaletteCard';
import { TemplateSelector } from './components/photobooth/TemplateSelector';
import { StripPreview } from './components/photobooth/StripPreview';
import { ConverterView } from './components/converter/ConverterView';
import { SettingsModal } from './components/settings/SettingsModal';
import {
  ActiveTool,
  VisualEngineStatus,
  ImageFileMeta,
  CompressionSettings,
  CompressionResult,
  CapturedPhoto,
  PaletteAnalysis,
  StripConfig,
} from './types';
import { compressImage } from './lib/image-compressor';
import { extractPaletteFromImage } from './lib/color-analyzer';

export const App: React.FC = () => {
  // Navigation & Shell State
  const [activeTool, setActiveTool] = useState<ActiveTool>('home');
  const [visualEngine] = useState<VisualEngineStatus>('hardware-accelerated');

  // --- Tool 1: Image Compressor State ---
  const [imageMeta, setImageMeta] = useState<ImageFileMeta | null>(null);
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({
    scaleMode: 'percent',
    scalePercent: 75,
    customWidth: 1920,
    customHeight: 1080,
    lockAspectRatio: true,
    quality: 0.8,
    outputFormat: 'image/jpeg',
  });
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Compress image handler
  const runCompression = useCallback(
    async (meta: ImageFileMeta, settings: CompressionSettings) => {
      setIsCompressing(true);
      try {
        const res = await compressImage(meta, settings);
        setCompressionResult(res);
      } catch (err) {
        console.error('Compression error:', err);
      } finally {
        setIsCompressing(false);
      }
    },
    []
  );

  // Trigger compression when image or settings change
  useEffect(() => {
    if (imageMeta) {
      runCompression(imageMeta, compressionSettings);
    }
  }, [imageMeta, compressionSettings, runCompression]);

  const handleImageSelected = (meta: ImageFileMeta) => {
    setImageMeta(meta);
    setCompressionSettings((prev) => ({
      ...prev,
      customWidth: meta.originalWidth,
      customHeight: meta.originalHeight,
    }));
  };

  const handleUpdateSettings = (newSettings: Partial<CompressionSettings>) => {
    setCompressionSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // --- Tool 2: AI Palette Photobooth State ---
  const [photoboothPhotos, setPhotoboothPhotos] = useState<CapturedPhoto[]>([]);
  const [targetCount, setTargetCount] = useState<1 | 2 | 3 | 4>(4);
  const [paletteAnalysis, setPaletteAnalysis] = useState<PaletteAnalysis | null>(null);
  const [isAnalyzingPalette, setIsAnalyzingPalette] = useState(false);

  const [stripConfig, setStripConfig] = useState<StripConfig>({
    shotCount: 4,
    frameColor: '#F2E8DC',
    borderColor: '#D4C4B2',
    textColor: '#4A3B32',
    label: 'GRAPHIXLAB PHOTOBOOTH',
    showTimestamp: true,
    grainIntensity: 0.06,
    innerPadding: 44,
    borderWidth: 2,
  });

  const handlePhotosCaptured = async (photos: CapturedPhoto[]) => {
    setPhotoboothPhotos(photos);
    if (photos.length > 0) {
      setIsAnalyzingPalette(true);
      try {
        // Sample palette from the first or composite photo
        const analysis = await extractPaletteFromImage(photos[0].dataUrl, 4);
        setPaletteAnalysis(analysis);

        // Auto assign harmonized theme
        setStripConfig((prev) => ({
          ...prev,
          shotCount: targetCount,
          frameColor: analysis.suggestedFrameColor,
          borderColor: analysis.suggestedBorderColor,
          textColor: analysis.suggestedTextColor,
        }));
      } catch (err) {
        console.error('Palette extraction error:', err);
      } finally {
        setIsAnalyzingPalette(false);
      }
    }
  };

  const handleUpdateStripConfig = (newCfg: Partial<StripConfig>) => {
    setStripConfig((prev) => ({ ...prev, ...newCfg }));
  };

  const handleRetakePhotobooth = () => {
    setPhotoboothPhotos([]);
    setPaletteAnalysis(null);
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-workspace dark:bg-workspace-dark-bg text-workspace-foreground dark:text-workspace-dark-foreground transition-colors duration-200">
      {/* Shell Dark Frosted Sidebar */}
      <Sidebar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
      />

      {/* Dynamic Canvas Workspace Viewport */}
      <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Halaman Utama / Home Launchpad */}
          {activeTool === 'home' && (
            <HomeView onNavigate={setActiveTool} />
          )}

          {/* Tool 1: Image Compressor Studio */}
          {activeTool === 'compressor' && (
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-workspace-outline dark:border-workspace-dark-outline pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-workspace-foreground dark:text-workspace-dark-foreground">
                    Image Compressor Studio
                  </h2>
                  <p className="text-xs sm:text-sm text-workspace-muted dark:text-workspace-dark-muted mt-0.5">
                    Client-side lossless and quantized image optimization with real-time curtain split inspector.
                  </p>
                </div>
              </div>

              {/* If no image selected yet, show prominent dropzone */}
              {!imageMeta ? (
                <div className="max-w-3xl mx-auto py-8">
                  <Dropzone
                    onImageSelected={handleImageSelected}
                    currentImage={imageMeta}
                  />
                </div>
              ) : (
                /* Active Workspace: Controls & Split View */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Controls & Replace Dropzone */}
                  <div className="lg:col-span-5 space-y-5">
                    <CompressionControls
                      imageMeta={imageMeta}
                      settings={compressionSettings}
                      result={compressionResult}
                      isProcessing={isCompressing}
                      onUpdateSettings={handleUpdateSettings}
                    />

                    <Dropzone
                      onImageSelected={handleImageSelected}
                      currentImage={imageMeta}
                    />
                  </div>

                  {/* Right Column: Interactive Compare View & Metrics */}
                  <div className="lg:col-span-7 space-y-5">
                    <CompareView
                      originalMeta={imageMeta}
                      result={compressionResult}
                      isProcessing={isCompressing}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tool 2: AI Palette Photobooth Studio */}
          {activeTool === 'photobooth' && (
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-workspace-outline dark:border-workspace-dark-outline pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-workspace-foreground dark:text-workspace-dark-foreground flex items-center gap-2">
                    <span>AI Palette Photobooth</span>
                    <span className="text-xs bg-primary/15 text-primary-strong border border-primary/30 px-2 py-0.5 rounded font-mono font-semibold">
                      SMART STRIP
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-workspace-muted dark:text-workspace-dark-muted mt-0.5">
                    WebRTC multi-shot camera, K-Means dominant color extraction, and dynamic canvas strip compositor.
                  </p>
                </div>
              </div>

              {photoboothPhotos.length === 0 ? (
                    /* Stage 1: Camera Viewfinder & Shutter */
                    <div className="max-w-3xl mx-auto">
                      <CameraView
                        onPhotosCaptured={handlePhotosCaptured}
                        targetCount={targetCount}
                        onTargetCountChange={(c) => {
                          setTargetCount(c);
                          setStripConfig((prev) => ({ ...prev, shotCount: c }));
                        }}
                      />
                    </div>
                  ) : (
                    /* Stage 2: Photos Captured! Palette Analysis + Strip Compositor */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left Column: AI Palette Swatches & Strip Template Styling */}
                      <div className="lg:col-span-6 space-y-6">
                        <PaletteCard
                          palette={paletteAnalysis}
                          isAnalyzing={isAnalyzingPalette}
                        />

                        <TemplateSelector
                          config={stripConfig}
                          palette={paletteAnalysis}
                          onUpdateConfig={handleUpdateStripConfig}
                        />
                      </div>

                      {/* Right Column: High-Res Photobooth Strip Canvas Output */}
                      <div className="lg:col-span-6">
                        <StripPreview
                          photos={photoboothPhotos}
                          config={stripConfig}
                          onRetake={handleRetakePhotobooth}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

          {/* Tool 3: Image Converter Studio */}
          {activeTool === 'converter' && (
            <ConverterView visualEngine={visualEngine} />
          )}
        </div>
      </main>

      {/* Global Settings & Appearance Modal */}
      <SettingsModal />
    </div>
  );
};

export default App;
