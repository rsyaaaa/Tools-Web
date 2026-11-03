import React, { useRef, useEffect, useState } from 'react';
import { Download, RotateCcw, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { CapturedPhoto, StripConfig } from '../../types';
import { renderPhotoboothStrip, downloadPhotoboothStrip } from '../../lib/canvas-compositor';

interface StripPreviewProps {
  photos: CapturedPhoto[];
  config: StripConfig;
  onRetake: () => void;
}

export const StripPreview: React.FC<StripPreviewProps> = ({ photos, config, onRetake }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderedDataUrl, setRenderedDataUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

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

  return (
    <div className="bg-workspace-elevated rounded-lg border border-workspace-outline p-5 shadow-subtle space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-workspace-outline pb-3">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-workspace-foreground">
            Photobooth Strip Output
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-workspace-muted px-2 py-0.5 rounded bg-workspace-soft border border-workspace-outline">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>High-Res PNG</span>
        </div>
      </div>

      {/* Preview Viewport */}
      <div
        ref={containerRef}
        className="w-full flex items-center justify-center p-4 bg-workspace-surface/80 rounded-md border border-workspace-outline min-h-[480px] overflow-auto"
      >
        {isRendering && !renderedDataUrl ? (
          <div className="flex flex-col items-center justify-center space-y-2 text-workspace-muted">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono">Compositing Photobooth Strip...</span>
          </div>
        ) : renderedDataUrl ? (
          <div className="relative group max-h-[580px] overflow-hidden rounded-md shadow-raised border border-black/10">
            <img
              src={renderedDataUrl}
              alt="Photobooth Strip Preview"
              className="max-h-[560px] w-auto object-contain mx-auto transition-transform group-hover:scale-[1.01]"
            />
            {isRendering && (
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono backdrop-blur-sm animate-pulse">
                Updating...
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-workspace-muted text-xs">
            Foto yang diambil akan dirender di sini.
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          onClick={onRetake}
          className="h-11 px-4 rounded border border-workspace-outline bg-workspace-surface hover:bg-workspace-soft text-workspace-foreground text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-workspace-muted" />
          <span>Retake / Sesi Baru</span>
        </button>

        <button
          onClick={handleDownload}
          disabled={!renderedDataUrl || isRendering}
          className="h-11 px-4 rounded bg-primary hover:bg-primary-strong active:bg-primary-focus text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-raised transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
};

