import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { useApp } from './context/AppContext';
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
  const { theme, toggleTheme } = useApp();

  // Navigation & Shell State
  const [activeTool, setActiveTool] = useState<ActiveTool>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const handleScrollToPreview = () => {
    const previewEl = document.getElementById('photobooth-preview-section');
    if (previewEl) {
      previewEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleScrollToTemplates = () => {
    const templatesEl = document.getElementById('photobooth-templates-section');
    if (templatesEl) {
      templatesEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRetakePhotobooth = () => {
    setPhotoboothPhotos([]);
    setPaletteAnalysis(null);
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-workspace dark:bg-workspace-dark-bg text-workspace-foreground dark:text-workspace-dark-foreground transition-colors duration-200">
      {/* Mobile Top Navigation Bar (md:hidden) */}
      <header className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-workspace-elevated dark:bg-workspace-dark-elevated border-b border-workspace-outline dark:border-workspace-dark-outline z-30 sticky top-0 shadow-xs flex-shrink-0">
        {/* Left: Subtle Pagelist Icon Button, followed by GraphixLab */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-9 h-9 rounded-lg border border-workspace-outline dark:border-workspace-dark-outline bg-workspace-surface/80 dark:bg-workspace-dark-surface/80 hover:bg-workspace-soft dark:hover:bg-workspace-dark-soft text-workspace-foreground dark:text-workspace-dark-foreground hover:border-primary/50 active:scale-95 flex items-center justify-center transition-all shadow-subtle group cursor-pointer"
            aria-label="Daftar Halaman"
            title="Daftar Halaman"
          >
            <Menu className="w-4 h-4 text-workspace-foreground dark:text-workspace-dark-foreground group-hover:text-primary transition-colors" strokeWidth={2.2} />
          </button>

          <button
            onClick={() => setActiveTool('home')}
            className="font-bold text-base tracking-tight text-workspace-foreground dark:text-workspace-dark-foreground hover:text-primary transition-colors cursor-pointer select-none text-left"
          >
            GraphixLab
          </button>
        </div>

        {/* Right: Theme Quick Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg border border-workspace-outline dark:border-workspace-dark-outline bg-workspace-surface/80 dark:bg-workspace-dark-surface/80 hover:bg-workspace-soft dark:hover:bg-workspace-dark-soft text-workspace-muted hover:text-workspace-foreground active:scale-95 flex items-center justify-center transition-all shadow-subtle"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
        </button>
      </header>

      {/* Shell Sidebar (Desktop Expandable + Mobile Drawer) */}
      <Sidebar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Dynamic Canvas Workspace Viewport */}
      <main className="flex-1 h-full overflow-y-auto p-3.5 sm:p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto space-y-5 sm:space-y-6">
          {/* Halaman Utama / Home Launchpad */}
          {activeTool === 'home' && (
            <HomeView onNavigate={setActiveTool} />
          )}

          {/* Tool 1: Image Compressor Studio */}
          {activeTool === 'compressor' && (
            <div className="space-y-5 sm:space-y-6">
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
                <div className="max-w-3xl mx-auto py-4 sm:py-8">
                  <Dropzone
                    onImageSelected={handleImageSelected}
                    currentImage={imageMeta}
                  />
                </div>
              ) : (
                /* Active Workspace: Controls & Split View */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                  {/* On mobile: Compare inspector on top; on desktop on right */}
                  <div className="lg:col-span-7 space-y-4 sm:space-y-5 order-1 lg:order-2">
                    <CompareView
                      originalMeta={imageMeta}
                      result={compressionResult}
                      isProcessing={isCompressing}
                    />
                  </div>

                  {/* On mobile: Controls underneath; on desktop on left */}
                  <div className="lg:col-span-5 space-y-4 sm:space-y-5 order-2 lg:order-1">
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
                </div>
              )}
            </div>
          )}

          {/* Tool 2: AI Photobooth Studio */}
          {activeTool === 'photobooth' && (
            <div className="space-y-5 sm:space-y-6">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-workspace-outline dark:border-workspace-dark-outline pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-workspace-foreground dark:text-workspace-dark-foreground flex items-center gap-2">
                    <span>AI Photobooth Studio</span>
                    <span className="text-xs bg-primary/15 text-primary-strong border border-primary/30 px-2 py-0.5 rounded font-mono font-semibold">
                      20+ Themes
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
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                      {/* On mobile: Preview on top so user sees their photo strip first! On desktop: Preview on right */}
                      <div
                        id="photobooth-preview-section"
                        className="lg:col-span-6 order-1 lg:order-2 scroll-mt-2 sm:scroll-mt-4"
                      >
                        <StripPreview
                          photos={photoboothPhotos}
                          config={stripConfig}
                          palette={paletteAnalysis}
                          onUpdateConfig={handleUpdateStripConfig}
                          onRetake={handleRetakePhotobooth}
                          onScrollToTemplates={handleScrollToTemplates}
                        />
                      </div>

                      {/* On mobile: Styling & Templates underneath. On desktop: Controls on left */}
                      <div
                        id="photobooth-templates-section"
                        className="lg:col-span-6 space-y-5 sm:space-y-6 order-2 lg:order-1 scroll-mt-2 sm:scroll-mt-4"
                      >
                        <PaletteCard
                          palette={paletteAnalysis}
                          isAnalyzing={isAnalyzingPalette}
                        />

                        <TemplateSelector
                          config={stripConfig}
                          palette={paletteAnalysis}
                          onUpdateConfig={handleUpdateStripConfig}
                          onThemeSelected={handleScrollToPreview}
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
