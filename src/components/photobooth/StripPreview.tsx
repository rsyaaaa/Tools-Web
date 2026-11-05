import React, { useRef, useEffect, useState } from 'react';
import {
  Download,
  RotateCcw,
  Image as ImageIcon,
  Sparkles,
  Check,
  Sliders,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CapturedPhoto, StripConfig, PaletteAnalysis } from '../../types';
import { PHOTOBOOTH_THEMES } from '../../lib/photobooth-themes';
import { renderPhotoboothStrip, downloadPhotoboothStrip } from '../../lib/canvas-compositor';

interface StripPreviewProps {
  photos: CapturedPhoto[];
  config: StripConfig;
  palette?: PaletteAnalysis | null;
  onUpdateConfig?: (newConfig: Partial<StripConfig>) => void;
  onRetake: () => void;
  onScrollToTemplates?: () => void;
}

export const StripPreview: React.FC<StripPreviewProps> = ({
  photos,
  config,
  palette,
  onUpdateConfig,
  onRetake,
  onScrollToTemplates,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderedDataUrl, setRenderedDataUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Swipe gesture touch coordinates
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Render photobooth strip
  useEffect(() => {
    let isCancelled = false;

    const render = async () => {
      if (photos.length === 0) return;
      setIsRendering(true);
      try {
        const canvas = await renderPhotoboothStrip(photos, config);
        if (!isCancelled) {
          canvasRef.current = canvas;
          setRenderedDataUrl(canvas.toDataURL('image/png'));
        }
      } catch (err) {
        console.error('Failed to render photobooth strip:', err);
      } finally {
        if (!isCancelled) setIsRendering(false);
      }
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [photos, config]);

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    await downloadPhotoboothStrip(canvasRef.current);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  // Find index of current theme
  const currentThemeIndex = PHOTOBOOTH_THEMES.findIndex((t) => t.id === config.themeId);
  const currentTheme = currentThemeIndex >= 0 ? PHOTOBOOTH_THEMES[currentThemeIndex] : null;

  // Navigate to previous theme in cycle
  const goToPrevTheme = () => {
    if (!onUpdateConfig) return;
    const newIndex =
      currentThemeIndex <= 0
        ? PHOTOBOOTH_THEMES.length - 1
        : currentThemeIndex - 1;
    const tmpl = PHOTOBOOTH_THEMES[newIndex];
    onUpdateConfig({
      themeId: tmpl.id,
      patternType: tmpl.patternType,
      frameColor: tmpl.frameColor,
      gradientTo: tmpl.gradientTo,
      borderColor: tmpl.borderColor,
      textColor: tmpl.textColor,
    });
  };

  // Navigate to next theme in cycle
  const goToNextTheme = () => {
    if (!onUpdateConfig) return;
    const newIndex =
      currentThemeIndex === -1 || currentThemeIndex >= PHOTOBOOTH_THEMES.length - 1
        ? 0
        : currentThemeIndex + 1;
    const tmpl = PHOTOBOOTH_THEMES[newIndex];
    onUpdateConfig({
      themeId: tmpl.id,
      patternType: tmpl.patternType,
      frameColor: tmpl.frameColor,
      gradientTo: tmpl.gradientTo,
      borderColor: tmpl.borderColor,
      textColor: tmpl.textColor,
    });
  };

  // Touch Swipe Handlers for mobile gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Check if horizontal movement is prominent (threshold > 35px and dominant over vertical)
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) {
        // Swiped Left -> Next Theme
        goToNextTheme();
      } else {
        // Swiped Right -> Previous Theme
        goToPrevTheme();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Apply AI Match handler
  const handleApplyAiMatch = () => {
    if (!palette || !onUpdateConfig) return;
    onUpdateConfig({
      themeId: 'theme-ai-match',
      patternType: undefined,
      gradientTo: undefined,
      frameColor: palette.suggestedFrameColor,
      borderColor: palette.suggestedBorderColor,
      textColor: palette.suggestedTextColor,
    });
  };

  return (
    <div className="bg-workspace-elevated rounded-lg border border-workspace-outline p-4 sm:p-5 shadow-subtle space-y-4 sm:space-y-5">
      {/* Header: Title on Left, Apply AI Match replacing High-Res box on Right */}
      <div className="flex items-center justify-between border-b border-workspace-outline pb-3">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-workspace-foreground">
            Photobooth Strip Output
          </h3>
        </div>

        {/* Apply AI Match Button Replacing High-Res PNG Box */}
        {palette ? (
          <button
            type="button"
            onClick={handleApplyAiMatch}
            className={`text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1 rounded-md border flex items-center gap-1.5 transition-all shadow-subtle active:scale-95 cursor-pointer ${
              config.themeId === 'theme-ai-match'
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-primary/10 text-primary-strong border-primary/30 hover:bg-primary hover:text-white'
            }`}
            title="Terapkan warna harmonis hasil AI K-Means ke strip foto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px] sm:text-xs font-bold">Apply AI Match</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-workspace-muted px-2 py-0.5 rounded bg-workspace-soft border border-workspace-outline">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>AI Match Ready</span>
          </div>
        )}
      </div>

      {/* Preview Viewport with Arrows & Touch-Swipe */}
      <div
        ref={containerRef}
        className="w-full relative flex items-center justify-center p-2 sm:p-4 bg-workspace-surface/80 rounded-md border border-workspace-outline min-h-[300px] sm:min-h-[480px] overflow-hidden select-none"
      >
        {isRendering && !renderedDataUrl ? (
          <div className="flex flex-col items-center justify-center space-y-2 text-workspace-muted">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono">Compositing Photobooth Strip...</span>
          </div>
        ) : renderedDataUrl ? (
          <div
            className="relative group max-h-[420px] sm:max-h-[580px] rounded-md shadow-raised border border-black/10 overflow-hidden touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* The Rendered Strip Image */}
            <img
              src={renderedDataUrl}
              alt="Photobooth Strip Preview"
              className="max-h-[400px] sm:max-h-[560px] w-auto object-contain mx-auto block pointer-events-none transition-transform group-hover:scale-[1.01]"
              draggable={false}
            />

            {/* Left Arrow Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevTheme();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/85 active:scale-90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-raised transition-all cursor-pointer z-20 group/btn"
              aria-label="Tema Sebelumnya"
              title="Tema Sebelumnya (atau geser kanan)"
            >
              <ChevronLeft className="w-5 h-5 group-hover/btn:-translate-x-0.5 transition-transform" />
            </button>

            {/* Right Arrow Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNextTheme();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/85 active:scale-90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-raised transition-all cursor-pointer z-20 group/btn"
              aria-label="Tema Selanjutnya"
              title="Tema Selanjutnya (atau geser kiri)"
            >
              <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>

            {/* Bottom Floating Pill: Current Theme Indicator */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold border border-white/20 shadow-md flex items-center gap-1.5 pointer-events-none whitespace-nowrap z-20">
              <span>{currentTheme?.iconEmoji || (config.themeId === 'theme-ai-match' ? '✨' : '🎨')}</span>
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {currentTheme?.name || (config.themeId === 'theme-ai-match' ? 'AI Matched Tone' : 'Kustom')}
              </span>
              <span className="text-white/60 font-mono text-[10px]">
                ({currentThemeIndex >= 0 ? `${currentThemeIndex + 1}/${PHOTOBOOTH_THEMES.length}` : 'AI'})
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center text-workspace-muted text-xs">
            Foto yang diambil akan dirender di sini.
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
        <button
          onClick={handleDownload}
          disabled={!renderedDataUrl || isRendering}
          className="h-11 px-4 rounded bg-primary hover:bg-primary-strong active:bg-primary-focus text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-raised transition-all disabled:opacity-40 disabled:cursor-not-allowed order-1 sm:order-2"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Strip Tersimpan!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Photo Strip</span>
            </>
          )}
        </button>

        <button
          onClick={onRetake}
          className="h-11 px-4 rounded border border-workspace-outline bg-workspace-surface hover:bg-workspace-soft text-workspace-foreground text-xs font-semibold flex items-center justify-center space-x-2 transition-colors order-2 sm:order-1"
        >
          <RotateCcw className="w-4 h-4 text-workspace-muted" />
          <span>Retake / Sesi Baru</span>
        </button>

        {/* Mobile Quick Scroll to Templates (20+ Themes) */}
        {onScrollToTemplates && (
          <button
            type="button"
            onClick={onScrollToTemplates}
            className="lg:hidden col-span-1 sm:col-span-2 h-10 px-3 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary-strong font-semibold text-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.98] order-3"
          >
            <Sliders className="w-3.5 h-3.5 text-primary" />
            <span>Pilih Tema Template (20+ Pilihan) ↓</span>
          </button>
        )}
      </div>
    </div>
  );
};

