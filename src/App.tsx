import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dropzone } from './components/compressor/Dropzone';
import { CompressionControls } from './components/compressor/CompressionControls';
import { CompareView } from './components/compressor/CompareView';
import { CameraView } from './components/photobooth/CameraView';
import { PaletteCard } from './components/photobooth/PaletteCard';
import { TemplateSelector } from './components/photobooth/TemplateSelector';
import { StripPreview } from './components/photobooth/StripPreview';
import {
  ActiveTool,
  CameraStatus,
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
import { Sparkles, Wand2 } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation & Shell State
  const [activeTool, setActiveTool] = useState<ActiveTool>('compressor');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle' as CameraStatus);
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

  // Helper: Load a high quality demo canvas image for Image Compressor testing
  const loadDemoCompressorImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw rich gradient & test graphics
    const grad = ctx.createLinearGradient(0, 0, 1600, 1000);
    grad.addColorStop(0, '#FE6E00');
    grad.addColorStop(0.5, '#423D38');
    grad.addColorStop(1, '#0F172A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1600, 1000);

    // Decorative shapes
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.05 + (i % 5) * 0.05})`;
      ctx.beginPath();
      ctx.arc(
        (i * 120 + 80) % 1600,
        ((i * 180 + 100) % 800) + 100,
        60 + (i % 4) * 30,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 56px ui-sans-serif, system-ui';
    ctx.fillText('GRAPHIXLAB STUDIO SAMPLE', 100, 480);
    ctx.font = '24px ui-monospace';
    ctx.fillText('1600x1000 RAW BUFFER MATRIX · CLIENT QUANTIZATION TEST', 100, 540);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'graphixlab-sample-scene.jpg', { type: 'image/jpeg' });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.98);
      handleImageSelected({
        file,
        name: file.name,
        originalSize: blob.size,
        originalWidth: 1600,
        originalHeight: 1000,
        dataUrl,
        aspectRatio: 1600 / 1000,
      });
    }, 'image/jpeg', 0.98);
  };

  // --- Tool 2: AI Palette Photobooth State ---
  const [photoboothPhotos, setPhotoboothPhotos] = useState<CapturedPhoto[]>([]);
  const [targetCount, setTargetCount] = useState<3 | 4>(4);
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

  // Helper: Load a set of demo portraits for Photobooth testing
  const loadDemoPhotoboothSet = () => {
    const colors = ['#F97316', '#3B82F6', '#10B981', '#8B5CF6'];
    const demoPhotos: CapturedPhoto[] = colors.slice(0, targetCount).map((c, i) => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Gradient portrait simulation
        const g = ctx.createLinearGradient(0, 0, 640, 480);
        g.addColorStop(0, c);
        g.addColorStop(1, '#1E293B');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 640, 480);

        // Portrait silhouette representation
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(320, 200, 75, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(320, 400, 140, 90, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 24px ui-mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`STUDIO POSE #${i + 1}`, 320, 205);
      }
      return {
        id: `demo-${i}`,
        dataUrl: canvas.toDataURL('image/jpeg', 0.95),
        width: 640,
        height: 480,
      };
    });

    handlePhotosCaptured(demoPhotos);
  };

  return (
    <div className="min-h-screen flex flex-col bg-workspace text-workspace-foreground">
      {/* Shell Topbar */}
      <Header
        activeTool={activeTool}
        cameraStatus={cameraStatus}
        visualEngine={visualEngine}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Shell Dark Frosted Sidebar */}
        <Sidebar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Dynamic Canvas Workspace Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            {/* Tool 1: Image Compressor Studio */}
            {activeTool === 'compressor' && (
              <div className="space-y-6">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-workspace-outline pb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-workspace-foreground">
                      Image Compressor Studio
                    </h2>
                    <p className="text-xs sm:text-sm text-workspace-muted mt-0.5">
                      Client-side lossless and quantized image optimization with real-time curtain split inspector.
                    </p>
                  </div>

                  {!imageMeta && (
                    <button
                      onClick={loadDemoCompressorImage}
                      className="px-3.5 py-2 rounded border border-primary/40 bg-primary/10 hover:bg-primary hover:text-white text-primary-strong text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-sm"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Muat Contoh Citra Uji</span>
                    </button>
                  )}
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-workspace-outline pb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-workspace-foreground flex items-center gap-2">
                      <span>AI Palette Photobooth</span>
                      <span className="text-xs bg-primary/15 text-primary-strong border border-primary/30 px-2 py-0.5 rounded font-mono font-semibold">
                        SMART STRIP
                      </span>
                    </h2>
                    <p className="text-xs sm:text-sm text-workspace-muted mt-0.5">
                      WebRTC multi-shot camera, K-Means dominant color extraction, and dynamic canvas strip compositor.
                    </p>
                  </div>

                  {photoboothPhotos.length === 0 && (
                    <button
                      onClick={loadDemoPhotoboothSet}
                      className="px-3.5 py-2 rounded border border-primary/40 bg-primary/10 hover:bg-primary hover:text-white text-primary-strong text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Muat Contoh Foto Studio</span>
                    </button>
                  )}
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
                      onCameraStatusChange={setCameraStatus}
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
