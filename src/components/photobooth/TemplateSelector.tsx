import React, { useState } from 'react';
import {
  Sliders,
  Type,
  Calendar,
  Waves,
  Check,
  Palette,
  ArrowUp,
} from 'lucide-react';
import { StripConfig, PaletteAnalysis } from '../../types';
import { PHOTOBOOTH_THEMES, PhotoboothTheme } from '../../lib/photobooth-themes';

interface TemplateSelectorProps {
  config: StripConfig;
  palette?: PaletteAnalysis | null;
  onUpdateConfig: (newConfig: Partial<StripConfig>) => void;
  onThemeSelected?: () => void;
}

const CATEGORIES = [
  'Semua',
  'Suasana & Vibe',
  'Alam & Kosmik',
  'Kultural & Destinasi',
  'Modern & Seni',
  'Gaya Hidup',
] as const;

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  config,
  palette: _palette,
  onUpdateConfig,
  onThemeSelected,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const filteredThemes =
    selectedCategory === 'Semua'
      ? PHOTOBOOTH_THEMES
      : PHOTOBOOTH_THEMES.filter((t) => t.category === selectedCategory);

  const triggerScrollToPreview = () => {
    if (onThemeSelected) {
      onThemeSelected();
    } else {
      const previewEl = document.getElementById('photobooth-preview-section');
      if (previewEl) {
        previewEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        const mainEl = document.querySelector('main');
        if (mainEl) {
          mainEl.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  };

  const selectTheme = (tmpl: PhotoboothTheme) => {
    onUpdateConfig({
      themeId: tmpl.id,
      patternType: tmpl.patternType,
      frameColor: tmpl.frameColor,
      gradientTo: tmpl.gradientTo,
      borderColor: tmpl.borderColor,
      textColor: tmpl.textColor,
    });
    triggerScrollToPreview();
  };

  return (
    <div className="bg-workspace-elevated rounded-lg border border-workspace-outline p-3.5 sm:p-5 shadow-subtle space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-workspace-outline pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-primary" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-workspace-foreground">
            Tema Strip Photobooth (20+)
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mobile shortcut to jump directly to preview */}
          <button
            type="button"
            onClick={triggerScrollToPreview}
            className="lg:hidden text-[10px] sm:text-[11px] font-mono px-2 py-1 rounded bg-workspace-soft border border-workspace-outline hover:border-primary text-workspace-foreground hover:text-primary transition-colors flex items-center gap-1 font-semibold cursor-pointer"
            title="Lihat Hasil Preview di Atas"
          >
            <ArrowUp className="w-3 h-3 text-primary" />
            <span>Hasil</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          const count =
            cat === 'Semua'
              ? PHOTOBOOTH_THEMES.length
              : PHOTOBOOTH_THEMES.filter((t) => t.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-workspace-soft text-workspace-muted hover:text-workspace-foreground border border-workspace-outline'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-white/25 text-white' : 'bg-workspace text-workspace-muted'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Illustrated Themes Grid (20+ Themes) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-workspace-muted">
          <span className="font-semibold uppercase tracking-wider text-[11px] sm:text-xs">
            Pilih Tema ({filteredThemes.length} Pilihan)
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono truncate max-w-[140px] text-right">
            {config.themeId ? `${PHOTOBOOTH_THEMES.find(t => t.id === config.themeId)?.name || 'Kustom'}` : 'Default'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 max-h-[290px] sm:max-h-[340px] overflow-y-auto pr-1">
          {filteredThemes.map((tmpl) => {
            const isSelected =
              config.themeId === tmpl.id ||
              (!config.themeId && config.patternType === tmpl.patternType);

            return (
              <button
                key={tmpl.id}
                onClick={() => selectTheme(tmpl)}
                className={`p-2.5 rounded-lg border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/40 bg-primary/10 shadow-sm'
                    : 'border-workspace-outline bg-workspace-surface hover:border-primary/50 hover:bg-workspace-soft/60'
                }`}
              >
                {/* Top: Icon Emoji + Badge */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-xl group-hover:scale-110 transition-transform">
                    {tmpl.iconEmoji}
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold tracking-wider bg-workspace-soft border border-workspace-outline text-workspace-muted">
                    {tmpl.badge}
                  </span>
                </div>

                {/* Swatch Preview Bar */}
                <div
                  className="w-full h-5 rounded border mb-2 relative overflow-hidden flex items-center justify-end px-1"
                  style={{
                    background: tmpl.gradientTo
                      ? `linear-gradient(135deg, ${tmpl.frameColor}, ${tmpl.gradientTo})`
                      : tmpl.frameColor,
                    borderColor: tmpl.borderColor,
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/30 shadow-xs"
                    style={{ backgroundColor: tmpl.borderColor }}
                    title={`Border: ${tmpl.borderColor}`}
                  />
                </div>

                {/* Theme Name */}
                <span className="text-xs font-bold text-workspace-foreground leading-tight line-clamp-1 block">
                  {tmpl.name}
                </span>

                {/* Description */}
                <p className="text-[10px] text-workspace-muted line-clamp-2 mt-1 leading-snug">
                  {tmpl.description}
                </p>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Customization Controls */}
      <div className="space-y-4 pt-3 border-t border-workspace-outline">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-workspace-muted">
          <Palette className="w-3.5 h-3.5 text-primary" />
          <span>Kustomisasi Manual Warna & Teks</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Frame Color */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase text-workspace-muted font-mono block">
              Frame Base
            </label>
            <div className="flex items-center space-x-1.5">
              <input
                type="color"
                value={config.frameColor}
                onChange={(e) => onUpdateConfig({ frameColor: e.target.value })}
                className="w-7 h-7 rounded border border-workspace-outline cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={config.frameColor}
                onChange={(e) => onUpdateConfig({ frameColor: e.target.value })}
                className="w-full text-[11px] font-mono rounded bg-workspace border border-workspace-outline px-2 py-1 text-workspace-foreground"
              />
            </div>
          </div>

          {/* Border Accent */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase text-workspace-muted font-mono block">
              Border Accent
            </label>
            <div className="flex items-center space-x-1.5">
              <input
                type="color"
                value={config.borderColor}
                onChange={(e) => onUpdateConfig({ borderColor: e.target.value })}
                className="w-7 h-7 rounded border border-workspace-outline cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={config.borderColor}
                onChange={(e) => onUpdateConfig({ borderColor: e.target.value })}
                className="w-full text-[11px] font-mono rounded bg-workspace border border-workspace-outline px-2 py-1 text-workspace-foreground"
              />
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase text-workspace-muted font-mono block">
              Text Color
            </label>
            <div className="flex items-center space-x-1.5">
              <input
                type="color"
                value={config.textColor}
                onChange={(e) => onUpdateConfig({ textColor: e.target.value })}
                className="w-7 h-7 rounded border border-workspace-outline cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={config.textColor}
                onChange={(e) => onUpdateConfig({ textColor: e.target.value })}
                className="w-full text-[11px] font-mono rounded bg-workspace border border-workspace-outline px-2 py-1 text-workspace-foreground"
              />
            </div>
          </div>
        </div>

        {/* Custom Label Footer & Timestamp */}
        <div className="space-y-3 pt-2">
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
    </div>
  );
};
