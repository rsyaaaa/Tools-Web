import React, { useState, useRef, useCallback } from 'react';
import { Columns, SplitSquareVertical, CheckCircle2, TrendingDown, Clock, Maximize2 } from 'lucide-react';
import { ImageFileMeta, CompressionResult } from '../../types';
import { formatBytes } from '../../lib/image-compressor';

interface CompareViewProps {
  originalMeta: ImageFileMeta;
  result: CompressionResult | null;
  isProcessing: boolean;
}

export const CompareView: React.FC<CompareViewProps> = ({
  originalMeta,
  result,
  isProcessing,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'side-by-side'>('split');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = () => {
    setIsDragging(true);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    },
    [isDragging]
  );

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const reduction = result ? result.reductionPercent : 0;
  const isReduced = reduction > 0;

  return (
    <div className="space-y-4">
      {/* Metrics Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Original Size */}
        <div className="bg-workspace-elevated p-3 rounded-lg border border-workspace-outline shadow-subtle">
          <div className="text-[10px] font-mono uppercase text-workspace-muted">Original Size</div>
          <div className="text-sm sm:text-base font-bold text-workspace-foreground mt-0.5 font-mono">
            {formatBytes(originalMeta.originalSize)}
          </div>
          <div className="text-[10px] text-workspace-muted font-mono mt-0.5">
            {originalMeta.originalWidth} × {originalMeta.originalHeight} px
          </div>
        </div>

        {/* Metric 2: Compressed Size */}
        <div className="bg-workspace-elevated p-3 rounded-lg border border-workspace-outline shadow-subtle">
          <div className="text-[10px] font-mono uppercase text-workspace-muted">Compressed Size</div>
          <div className="text-sm sm:text-base font-bold text-primary mt-0.5 font-mono">
            {result ? formatBytes(result.size) : 'Calculating...'}
          </div>
          <div className="text-[10px] text-workspace-muted font-mono mt-0.5">
            {result ? `${result.width} × ${result.height} px` : '...'}
          </div>
        </div>

        {/* Metric 3: Delta Reduction */}
        <div className="bg-workspace-elevated p-3 rounded-lg border border-workspace-outline shadow-subtle">
          <div className="text-[10px] font-mono uppercase text-workspace-muted">Size Delta</div>
          <div
            className={`text-sm sm:text-base font-bold mt-0.5 font-mono flex items-center gap-1 ${
              isReduced ? 'text-status-success' : 'text-workspace-muted'
            }`}
          >
            {isReduced && <TrendingDown className="w-4 h-4" />}
            {result ? `${isReduced ? '-' : '+'}${Math.abs(reduction)}%` : '0%'}
          </div>
          <div className="text-[10px] text-workspace-muted font-mono mt-0.5">
            {result && isReduced
              ? `Saved ${formatBytes(originalMeta.originalSize - result.size)}`
              : 'Lossless threshold'}
          </div>
        </div>

        {/* Metric 4: Execution Speed */}
        <div className="bg-workspace-elevated p-3 rounded-lg border border-workspace-outline shadow-subtle">
          <div className="text-[10px] font-mono uppercase text-workspace-muted">Processing Time</div>
          <div className="text-sm sm:text-base font-bold text-workspace-foreground mt-0.5 font-mono flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-primary" />
            {result ? `${result.processingTimeMs} ms` : '—'}
          </div>
          <div className="text-[10px] text-status-success font-mono mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Client 2D Matrix</span>
          </div>
        </div>
      </div>

      {/* Visual Inspector Card */}
      <div className="bg-workspace-elevated rounded-lg border border-workspace-outline shadow-subtle overflow-hidden">
        {/* Inspector Header / View Mode Controls */}
        <div className="px-4 py-3 border-b border-workspace-outline flex items-center justify-between bg-workspace-soft/50">
          <div className="flex items-center space-x-2">
            <Maximize2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-workspace-foreground">
              Visual Inspector
            </span>
            {isProcessing && (
              <span className="text-[10px] font-mono text-primary animate-pulse ml-2">
                ● Rendering Canvas...
              </span>
            )}
          </div>

          <div className="flex bg-workspace rounded border border-workspace-outline p-0.5 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded flex items-center space-x-1.5 transition-colors ${
                viewMode === 'split'
                  ? 'bg-primary text-white font-medium shadow-sm'
                  : 'text-workspace-muted hover:text-workspace-foreground'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span className="text-[11px]">Curtain Slider</span>
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-2.5 py-1 rounded flex items-center space-x-1.5 transition-colors ${
                viewMode === 'side-by-side'
                  ? 'bg-primary text-white font-medium shadow-sm'
                  : 'text-workspace-muted hover:text-workspace-foreground'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="text-[11px]">Side-by-Side</span>
            </button>
          </div>
        </div>

        {/* Viewport Display */}
        <div className="p-2 sm:p-4 bg-workspace/60 min-h-[280px] sm:min-h-[380px] flex items-center justify-center">
          {viewMode === 'split' ? (
            /* Split Curtain Slider View */
            <div
              ref={containerRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="relative w-full max-w-4xl h-[280px] sm:h-[480px] select-none overflow-hidden rounded-md border border-workspace-outline bg-workspace-surface shadow-subtle cursor-ew-resize touch-none"
            >
              {/* Layer 1: Compressed Image (Background) */}
              <img
                src={result ? result.dataUrl : originalMeta.dataUrl}
                alt="Compressed preview"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
              <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-1 rounded border border-white/10 z-10">
                COMPRESSED ({result ? formatBytes(result.size) : '—'})
              </div>

              {/* Layer 2: Original Image (Clipped overlay) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src={originalMeta.dataUrl}
                  alt="Original preview"
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-1 rounded border border-white/10 z-10">
                  ORIGINAL ({formatBytes(originalMeta.originalSize)})
                </div>
              </div>

              {/* Draggable Divider Handle */}
              <div
                onPointerDown={handlePointerDown}
                className="absolute top-0 bottom-0 w-0.5 bg-primary z-20 cursor-ew-resize"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-raised border-2 border-white">
                  <SplitSquareVertical className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ) : (
            /* Side-by-Side View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
              {/* Original Card */}
              <div className="flex flex-col rounded-md border border-workspace-outline overflow-hidden bg-workspace-elevated">
                <div className="px-3 py-1.5 bg-workspace-soft border-b border-workspace-outline flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold text-workspace-foreground">ORIGINAL</span>
                  <span className="text-workspace-muted">{formatBytes(originalMeta.originalSize)}</span>
                </div>
                <div className="h-64 sm:h-80 flex items-center justify-center p-2 bg-workspace/40">
                  <img
                    src={originalMeta.dataUrl}
                    alt="Original"
                    className="max-h-full max-w-full object-contain rounded"
                  />
                </div>
                <div className="p-2 text-center text-[11px] font-mono text-workspace-muted border-t border-workspace-outline">
                  {originalMeta.originalWidth} × {originalMeta.originalHeight} px
                </div>
              </div>

              {/* Compressed Card */}
              <div className="flex flex-col rounded-md border border-workspace-outline overflow-hidden bg-workspace-elevated">
                <div className="px-3 py-1.5 bg-workspace-soft border-b border-workspace-outline flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold text-primary">COMPRESSED</span>
                  <span className="text-primary font-bold">{result ? formatBytes(result.size) : '...'}</span>
                </div>
                <div className="h-64 sm:h-80 flex items-center justify-center p-2 bg-workspace/40">
                  <img
                    src={result ? result.dataUrl : originalMeta.dataUrl}
                    alt="Compressed"
                    className="max-h-full max-w-full object-contain rounded"
                  />
                </div>
                <div className="p-2 text-center text-[11px] font-mono text-workspace-muted border-t border-workspace-outline">
                  {result ? `${result.width} × ${result.height} px` : '...'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
