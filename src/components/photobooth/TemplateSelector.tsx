import React from 'react';
import { Sliders, Sparkles, Type, Calendar, Waves, Check } from 'lucide-react';
import { StripConfig, PaletteAnalysis } from '../../types';

interface TemplateSelectorProps {
  config: StripConfig;
  palette: PaletteAnalysis | null;
  onUpdateConfig: (newConfig: Partial<StripConfig>) => void;
}

const PRESET_TEMPLATES = [
  { name: 'Warm Cream', frame: '#F2E8DC', border: '#D4C4B2', text: '#4A3B32' },
  { name: 'Matte Charcoal', frame: '#18181A', border: '#2F2F36', text: '#E6E6E8' },
  { name: 'Pure Minimal', frame: '#FFFFFF', border: '#E5E7EB', text: '#1F2937' },
  { name: 'Pastel Blush', frame: '#FAF4F2', border: '#EADCD7', text: '#4A3834' },
  { name: 'Midnight Navy', frame: '#0F172A', border: '#1E293B', text: '#F8FAFC' },
  { name: 'Cyber Neon', frame: '#111827', border: '#06B6D4', text: '#38BDF8' },
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  config,
  palette,
  onUpdateConfig,
}) => {
  const applyAutoTemplate = () => {
    if (!palette) return;
    onUpdateConfig({
      frameColor: palette.suggestedFrameColor,
      borderColor: palette.suggestedBorderColor,
      textColor: palette.suggestedTextColor,
    });
  };

  return (
    <div className="bg-workspace-elevated rounded-lg border border-workspace-outline p-5 shadow-subtle space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-workspace-outline pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-workspace-foreground">
            Strip Template & Frame Styling
          </h3>
        </div>

        {palette && (
          <button
            onClick={applyAutoTemplate}
            className="text-[11px] font-mono px-2.5 py-1 rounded bg-primary/10 text-primary-strong border border-primary/30 hover:bg-primary hover:text-white transition-colors flex items-center gap-1 font-semibold"
          >
            <Sparkles className="w-3 h-3" />
            <span>Apply AI Match</span>
          </button>
        )}
      </div>

      {/* Preset Theme Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-workspace-muted block">
          Preset Frame Themes
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_TEMPLATES.map((tmpl) => {
            const isSelected =
              config.frameColor.toLowerCase() === tmpl.frame.toLowerCase() &&
              config.borderColor.toLowerCase() === tmpl.border.toLowerCase();

            return (
              <button
                key={tmpl.name}
                onClick={() =>
                  onUpdateConfig({
                    frameColor: tmpl.frame,
                    borderColor: tmpl.border,
                    textColor: tmpl.text,
                  })
                }
                className={`p-2 rounded border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary ring-1 ring-primary bg-primary/5'
                    : 'border-workspace-outline bg-workspace-surface hover:border-workspace-outline-strong'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1.5">
                  <span
                    className="w-4 h-4 rounded-full border border-black/20 shadow-xs inline-block"
                    style={{ backgroundColor: tmpl.frame }}
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-black/20 shadow-xs inline-block"
                    style={{ backgroundColor: tmpl.border }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-workspace-foreground truncate block">
                  {tmpl.name}
                </span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary absolute top-2 right-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Color Pickers */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Frame Color Picker */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase text-workspace-muted font-mono block">
            Frame Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={config.frameColor}
              onChange={(e) => onUpdateConfig({ frameColor: e.target.value })}
              className="w-8 h-8 rounded border border-workspace-outline cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={config.frameColor}
              onChange={(e) => onUpdateConfig({ frameColor: e.target.value })}
              className="w-full text-xs font-mono rounded bg-workspace border border-workspace-outline px-2 py-1 text-workspace-foreground"
            />
          </div>
        </div>

        {/* Border Accent Picker */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase text-workspace-muted font-mono block">
            Border Accent
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={config.borderColor}
              onChange={(e) => onUpdateConfig({ borderColor: e.target.value })}
              className="w-8 h-8 rounded border border-workspace-outline cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={config.borderColor}
              onChange={(e) => onUpdateConfig({ borderColor: e.target.value })}
              className="w-full text-xs font-mono rounded bg-workspace border border-workspace-outline px-2 py-1 text-workspace-foreground"
            />
          </div>
        </div>
      </div>

      {/* Custom Label Footer & Timestamp */}
      <div className="space-y-3 pt-2 border-t border-workspace-outline">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-workspace-muted flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-primary" />
            Custom Footer Label
          </label>
          <input
            type="text"
            value={config.label}
            onChange={(e) => onUpdateConfig({ label: e.target.value })}
            placeholder="Contoh: GRAPHIXLAB · 2026"
            className="w-full text-xs rounded bg-workspace border border-workspace-outline px-3 py-2 text-workspace-foreground focus:outline-none focus:border-primary font-sans"
          />
        </div>

        {/* Date Timestamp Toggle */}
        <div className="flex items-center justify-between py-1">
          <span className="text-xs text-workspace-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Monospace Date Stamp
          </span>
          <button
            onClick={() => onUpdateConfig({ showTimestamp: !config.showTimestamp })}
            className={`w-10 h-5 rounded-full transition-colors relative ${
              config.showTimestamp ? 'bg-primary' : 'bg-workspace-soft border border-workspace-outline'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                config.showTimestamp ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Procedural Film Grain Slider */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-workspace-foreground flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-primary" />
              Procedural Film Grain
            </span>
            <span className="text-xs font-mono text-primary font-bold">
              {Math.round(config.grainIntensity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="0.25"
            step="0.01"
            value={config.grainIntensity}
            onChange={(e) => onUpdateConfig({ grainIntensity: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

