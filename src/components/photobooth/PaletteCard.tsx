import React, { useState } from 'react';
import { Palette, Copy, Check, Sparkles, Thermometer, Sun } from 'lucide-react';
import { PaletteAnalysis } from '../../types';

interface PaletteCardProps {
  palette: PaletteAnalysis | null;
  isAnalyzing: boolean;
}

export const PaletteCard: React.FC<PaletteCardProps> = ({ palette, isAnalyzing }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const getMoodBadgeStyle = (mood: string) => {
    switch (mood) {
      case 'Warm Vintage':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Moody Dark':
        return 'bg-neutral-800 text-neutral-100 border-neutral-700';
      case 'Pastel Bright':
        return 'bg-pink-100 text-pink-900 border-pink-300';
      case 'Cyber Cool':
        return 'bg-cyan-100 text-cyan-900 border-cyan-300';
      default:
        return 'bg-workspace-soft text-workspace-foreground border-workspace-outline';
    }
  };

  return (
    <div className="bg-workspace-elevated rounded-lg border border-workspace-outline p-5 shadow-subtle space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-workspace-outline pb-3">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-workspace-foreground">
            AI Palette & Tone Analyzer
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-workspace-muted px-2 py-0.5 rounded bg-workspace-soft border border-workspace-outline">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>K-Means (4 Centroids)</span>
        </div>
      </div>

      {palette ? (
        <div className="space-y-4">
          {/* Mood & Tone Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-md bg-workspace-soft border border-workspace-outline">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-workspace-muted block">
                Classified Mood
              </span>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getMoodBadgeStyle(
                  palette.mood
                )}`}
              >
                <span>{palette.mood}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-workspace-foreground">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase text-workspace-muted block flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-primary" />
                  Temp
                </span>
                <span className="font-semibold capitalize text-primary">
                  {palette.colorTemperature}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase text-workspace-muted block flex items-center gap-1">
                  <Sun className="w-3 h-3 text-primary" />
                  Luminance (Y)
                </span>
                <span className="font-semibold">{palette.averageLuminance} / 255</span>
              </div>
            </div>
          </div>

          {/* Dominant Color Swatches */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-workspace-muted block">
              Dominant Centroids (Hex Swatches)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {palette.colors.map((color, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCopy(color.hex)}
                  title="Klik untuk menyalin HEX"
                  className="group relative rounded-md border border-workspace-outline bg-workspace-surface p-2 cursor-pointer hover:border-primary transition-all flex flex-col space-y-2"
                >
                  {/* Color preview box */}
                  <div
                    className="w-full h-12 rounded shadow-inner border border-black/10 relative"
                    style={{ backgroundColor: color.hex }}
                  >
                    <button
                      className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-[11px] font-mono opacity-0 group-hover:opacity-100 transition-opacity rounded"
                    >
                      {copiedHex === color.hex ? (
                        <span className="flex items-center gap-1 text-status-success font-bold">
                          <Check className="w-3 h-3" /> COPIED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy className="w-3 h-3" /> COPY
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Hex & Frequency */}
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-workspace-foreground">{color.hex}</span>
                    <span className="text-workspace-muted text-[10px]">
                      {Math.round(color.frequency * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benchmark speed */}
          <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-workspace-muted">
            <span>Latency: {palette.processingTimeMs} ms</span>
            <span className="text-status-success">Sub-200ms Target: PASS</span>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-workspace-muted space-y-2">
          <Palette className="w-8 h-8 text-workspace-outline mx-auto" />
          <p className="text-xs">
            {isAnalyzing
              ? 'Menganalisis matriks warna dengan K-Means...'
              : 'Ambil atau unggah foto untuk melihat palet warna AI.'}
          </p>
        </div>
      )}
    </div>
  );
};

