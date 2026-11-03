import React from 'react';
import { Download, Sliders, Lock, Unlock, FileCheck, Layers } from 'lucide-react';
import { CompressionSettings, ImageFileMeta, CompressionResult } from '../../types';
import { downloadBlob, formatBytes } from '../../lib/image-compressor';

interface CompressionControlsProps {
  imageMeta: ImageFileMeta;
  settings: CompressionSettings;
  result: CompressionResult | null;
  isProcessing: boolean;
  onUpdateSettings: (newSettings: Partial<CompressionSettings>) => void;
}

export const CompressionControls: React.FC<CompressionControlsProps> = ({
  imageMeta,
  settings,
  result,
  isProcessing,
  onUpdateSettings,
}) => {
  const handleWidthChange = (val: number) => {
    if (isNaN(val) || val <= 0) return;
    if (settings.lockAspectRatio) {
      const h = Math.round(val / imageMeta.aspectRatio);
      onUpdateSettings({ customWidth: val, customHeight: h });
    } else {
      onUpdateSettings({ customWidth: val });
    }
  };

  const handleHeightChange = (val: number) => {
    if (isNaN(val) || val <= 0) return;
    if (settings.lockAspectRatio) {
      const w = Math.round(val * imageMeta.aspectRatio);
      onUpdateSettings({ customHeight: val, customWidth: w });
    } else {
      onUpdateSettings({ customHeight: val });
    }
  };

  const handleDownload = () => {
    if (!result) return;
    downloadBlob(result.blob, imageMeta.name, settings.outputFormat);
  };

  return (
    <div className="bg-workspace-elevated rounded-lg border border-workspace-outline p-5 shadow-subtle space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-workspace-outline pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-workspace-foreground">
            Compression & Resize Engine
          </h2>
        </div>
        <span className="text-[11px] font-mono text-workspace-muted px-2 py-0.5 rounded bg-workspace-soft border border-workspace-outline">
          STEP: 0.05
        </span>
      </div>

      {/* 1. Scale / Resize Mode */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-workspace-muted">
            Scale / Resolution Mode
          </label>
          <div className="flex bg-workspace-soft p-0.5 rounded-md border border-workspace-outline text-xs">
            <button
              onClick={() => onUpdateSettings({ scaleMode: 'percent' })}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                settings.scaleMode === 'percent'
                  ? 'bg-primary text-white font-medium shadow-sm'
                  : 'text-workspace-muted hover:text-workspace-foreground'
              }`}
            >
              Preset %
            </button>
            <button
              onClick={() => onUpdateSettings({ scaleMode: 'manual' })}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                settings.scaleMode === 'manual'
                  ? 'bg-primary text-white font-medium shadow-sm'
                  : 'text-workspace-muted hover:text-workspace-foreground'
              }`}
            >
              Manual WxH
            </button>
          </div>
        </div>

        {/* Percentage Preset Buttons */}
        {settings.scaleMode === 'percent' ? (
          <div className="grid grid-cols-4 gap-2">
            {[100, 75, 50, 25].map((pct) => (
              <button
                key={pct}
                onClick={() => onUpdateSettings({ scalePercent: pct })}
                className={`py-2 text-xs font-mono rounded border transition-all ${
                  settings.scalePercent === pct
                    ? 'border-primary bg-primary/10 text-primary-strong font-bold'
                    : 'border-workspace-outline bg-workspace-surface text-workspace-foreground hover:border-workspace-outline-strong'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        ) : (
          /* Manual Dimension Input */
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <label className="text-[10px] text-workspace-muted uppercase font-mono block mb-1">
                Width (px)
              </label>
              <input
                type="number"
                min="10"
                max="10000"
                value={settings.customWidth}
                onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                className="w-full bg-workspace text-workspace-foreground text-xs font-mono rounded-sm border border-workspace-outline px-2.5 py-1.5 focus:outline-none focus:border-primary"
              />
            </div>

            <button
              onClick={() => onUpdateSettings({ lockAspectRatio: !settings.lockAspectRatio })}
              title={settings.lockAspectRatio ? 'Kunci rasio aktif' : 'Kunci rasio nonaktif'}
              className={`p-2 rounded mt-4 border transition-colors ${
                settings.lockAspectRatio
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-workspace-soft border-workspace-outline text-workspace-muted'
              }`}
            >
              {settings.lockAspectRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>

            <div className="flex-1">
              <label className="text-[10px] text-workspace-muted uppercase font-mono block mb-1">
                Height (px)
              </label>
              <input
                type="number"
                min="10"
                max="10000"
                value={settings.customHeight}
                onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                className="w-full bg-workspace text-workspace-foreground text-xs font-mono rounded-sm border border-workspace-outline px-2.5 py-1.5 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Quality Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-workspace-muted">
            Quantization Quality
          </label>
          <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
            {Math.round(settings.quality * 100)}% ({settings.quality.toFixed(2)})
          </span>
        </div>
        <input
          type="range"
          min="0.10"
          max="1.0"
          step="0.05"
          value={settings.quality}
          onChange={(e) => onUpdateSettings({ quality: parseFloat(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] font-mono text-workspace-muted">
          <span>0.10 (High Compression)</span>
          <span>0.50 (Balanced)</span>
          <span>1.0 (Lossless/Max)</span>
        </div>
      </div>

      {/* 3. Output Format Converter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-workspace-muted">
          Target Output Format
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onUpdateSettings({ outputFormat: 'image/jpeg' })}
            className={`py-2 px-3 rounded text-xs flex items-center justify-center space-x-2 border transition-all ${
              settings.outputFormat === 'image/jpeg'
                ? 'border-primary bg-primary/10 text-primary-strong font-bold'
                : 'border-workspace-outline bg-workspace-surface text-workspace-foreground hover:border-workspace-outline-strong'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>JPEG (.jpg)</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ outputFormat: 'image/webp' })}
            className={`py-2 px-3 rounded text-xs flex items-center justify-center space-x-2 border transition-all ${
              settings.outputFormat === 'image/webp'
                ? 'border-primary bg-primary/10 text-primary-strong font-bold'
                : 'border-workspace-outline bg-workspace-surface text-workspace-foreground hover:border-workspace-outline-strong'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>WebP (.webp)</span>
          </button>
        </div>
      </div>

      {/* 4. Action & Download Button */}
      <div className="pt-2">
        <button
          onClick={handleDownload}
          disabled={!result || isProcessing}
          className="w-full h-11 bg-primary hover:bg-primary-strong text-white font-medium text-xs sm:text-sm rounded-sm transition-all flex items-center justify-center space-x-2 shadow-raised disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>
            {isProcessing ? 'Processing Matrix...' : `Download Compressed (${result ? formatBytes(result.size) : 'Ready'})`}
          </span>
        </button>
        <p className="text-[10px] text-center text-workspace-muted mt-2 font-mono">
          Auto naming: {imageMeta.name.replace(/\.[^/.]+$/, '')}-compressed.{settings.outputFormat === 'image/webp' ? 'webp' : 'jpg'}
        </p>
      </div>
    </div>
  );
};

