import React, { useState, useEffect } from 'react';
import {
  FileImage,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Layers,
  Sliders,
  Camera,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';
import { ActiveTool } from '../../types';
import { useApp } from '../../context/AppContext';
import { translations } from '../../lib/translations';

interface HomeViewProps {
  onNavigate: (tool: ActiveTool) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { theme, toggleTheme, lang, t } = useApp();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  const currentQuotes = translations[lang]?.quotes || translations['id'].quotes;

  useEffect(() => {
    const timer = setInterval(() => {
      setFadeState('out');
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % currentQuotes.length);
        setFadeState('in');
      }, 300);
    }, 4000);

    return () => clearInterval(timer);
  }, [currentQuotes.length]);

  return (
    <div className="space-y-8 py-4 sm:py-6 max-w-5xl mx-auto relative">
      {/* Top Header Row with Dark/Light Mode Toggle in the Top-Right Corner */}
      <div className="flex justify-end items-center relative z-30">
        <button
          type="button"
          id="theme-toggle-btn"
          onClick={(e) => {
            e.stopPropagation();
            toggleTheme();
          }}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          title={
            theme === 'dark'
              ? (lang === 'id' ? 'Beralih ke Mode Terang' : 'Switch to Light Mode')
              : (lang === 'id' ? 'Beralih ke Mode Gelap' : 'Switch to Dark Mode')
          }
          className="w-11 h-11 rounded-full flex items-center justify-center bg-workspace-elevated border-2 border-workspace-outline text-workspace-foreground hover:border-primary hover:text-primary active:scale-90 transition-all shadow-raised group cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-90 transition-transform duration-300" />
          ) : (
            <Moon className="w-5 h-5 text-primary group-hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Central Hero Stage */}
      <div className="text-center space-y-4 pt-0 pb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary-strong dark:text-primary-warm text-xs font-mono font-semibold">
          <Layers className="w-3.5 h-3.5" />
          <span>{t('freeClientSideBadge')}</span>
        </div>

        {/* Big Central Question */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-workspace-foreground dark:text-workspace-dark-foreground">
          {t('heroQuestion')}
        </h1>

        {/* Dynamic Motivational Quote (Max 8 words) */}
        <div className="h-8 flex items-center justify-center">
          <p
            className={`text-sm sm:text-base font-medium text-workspace-muted dark:text-workspace-dark-muted transition-all duration-300 transform ${
              fadeState === 'in'
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-1'
            }`}
          >
            "{currentQuotes[quoteIndex % currentQuotes.length]}"
          </p>
        </div>
      </div>

      {/* Interactive Tool Menu Cards (3 Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Card 1: Image Compressor Studio */}
        <div
          onClick={() => onNavigate('compressor')}
          className="group relative bg-workspace-elevated dark:bg-workspace-dark-elevated rounded-lg border border-workspace-outline dark:border-workspace-dark-outline p-6 shadow-subtle hover:shadow-raised hover:border-primary/70 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            {/* Top Card Icon & Badge */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all">
                <FileImage className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-workspace-soft dark:bg-workspace-dark-soft text-workspace-muted dark:text-workspace-dark-muted border border-workspace-outline dark:border-workspace-dark-outline">
                TOOL 01 // MATRIX
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-workspace-foreground dark:text-workspace-dark-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                <span>{t('compressorTitle')}</span>
              </h2>
              <p className="text-xs sm:text-sm text-workspace-muted dark:text-workspace-dark-muted leading-relaxed">
                {t('card1Desc')}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-1.5 pt-2 border-t border-workspace-outline/60 dark:border-workspace-dark-outline text-xs text-workspace-foreground dark:text-workspace-dark-foreground font-mono">
              <div className="flex items-center gap-2 text-workspace-muted dark:text-workspace-dark-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success flex-shrink-0" />
                <span>Format: JPEG, PNG, WebP</span>
              </div>
              <div className="flex items-center gap-2 text-workspace-muted dark:text-workspace-dark-muted">
                <Sliders className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span>{lang === 'id' ? 'Preset % & Dimensi Kustom' : 'Preset % & Custom WxH'}</span>
              </div>
              <div className="flex items-center gap-2 text-workspace-muted dark:text-workspace-dark-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success flex-shrink-0" />
                <span>Curtain Split Inspector</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2">
            <div className="w-full h-10 rounded-sm bg-workspace-surface dark:bg-workspace-dark-surface group-hover:bg-primary text-workspace-foreground dark:text-workspace-dark-foreground group-hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all border border-workspace-outline dark:border-workspace-dark-outline group-hover:border-primary shadow-xs">
              <span>{t('card1Btn')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 2: AI Palette Photobooth */}
        <div
          onClick={() => onNavigate('photobooth')}
          className="group relative bg-workspace-elevated dark:bg-workspace-dark-elevated rounded-lg border border-workspace-outline dark:border-workspace-dark-outline p-6 shadow-subtle hover:shadow-raised hover:border-primary/70 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            {/* Top Card Icon & Badge */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-workspace-soft dark:bg-workspace-dark-soft text-workspace-muted dark:text-workspace-dark-muted border border-workspace-outline dark:border-workspace-dark-outline">
                TOOL 02 // HEURISTIC
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-workspace-foreground dark:text-workspace-dark-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                <span>{t('photoboothTitle')}</span>
              </h2>
              <p className="text-xs sm:text-sm text-workspace-muted dark:text-workspace-dark-muted leading-relaxed">
                {t('card2Desc')}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-1.5 pt-2 border-t border-workspace-outline/60 dark:border-workspace-dark-outline text-xs text-workspace-foreground dark:text-workspace-dark-foreground font-mono">
              <div className="flex items-center gap-2 text-workspace-muted dark:text-workspace-dark-muted">
                <Camera className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span>WebRTC Shutter & Countdown 3s</span>
              </div>
              <div className="flex items-center gap-2 text-workspace-muted dark:text-workspace-dark-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success flex-shrink-0" />
                <span>K-Means Sub-200ms & Mood Tone</span>
              </div>
              <div className="flex items-center gap-2 text-workspace-muted dark:text-workspace-dark-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success flex-shrink-0" />
                <span>Procedural Film Grain Strip</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2">
            <div className="w-full h-10 rounded-sm bg-workspace-surface dark:bg-workspace-dark-surface group-hover:bg-primary text-workspace-foreground dark:text-workspace-dark-foreground group-hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all border border-workspace-outline dark:border-workspace-dark-outline group-hover:border-primary shadow-xs">
              <span>{t('card2Btn')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 3: Image Converter Studio */}
        <div
          onClick={() => onNavigate('converter')}
          className="group relative bg-workspace-elevated dark:bg-workspace-dark-elevated rounded-lg border border-workspace-outline dark:border-workspace-dark-outline p-6 shadow-subtle hover:shadow-raised hover:border-primary/70 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            {/* Top Card Icon & Badge */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all">
                <RefreshCw className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-workspace-soft dark:bg-workspace-dark-soft text-workspace-muted dark:text-workspace-dark-muted border border-workspace-outline dark:border-workspace-dark-outline">
                TOOL 03 // CONVERTER
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-workspace-foreground dark:text-workspace-dark-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                <span>{t('converterTitle')}</span>
              </h2>
              <p className="text-xs sm:text-sm text-workspace-muted dark:text-workspace-dark-muted leading-relaxed">
                {t('card3Desc')}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-1.5 pt-2 border-t border-workspace-outline/60 dark:border-workspace-dark-outline text-xs text-workspace-foreground dark:text-workspace-dark-foreground font-mono">
              <div className="flex items-center gap-2 text-workspace-muted dark:text-workspace-dark-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success flex-shrink-0" />
                <span>JPEG, JPG, PNG, GIF, BMP, TIFF</span>
              </div>
              <div className="flex items-center gap-2 text-workspace-muted dark:text-workspace-dark-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success flex-shrink-0" />
                <span>ICO, SVG, EPS, PDF & HEIC Input</span>
              </div>
              <div className="flex items-center gap-2 text-workspace-muted dark:text-workspace-dark-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success flex-shrink-0" />
                <span>Multi-File Batch & Quality Control</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2">
            <div className="w-full h-10 rounded-sm bg-workspace-surface dark:bg-workspace-dark-surface group-hover:bg-primary text-workspace-foreground dark:text-workspace-dark-foreground group-hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all border border-workspace-outline dark:border-workspace-dark-outline group-hover:border-primary shadow-xs">
              <span>{t('card3Btn')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Privacy / Security Reassurance */}
      <div className="pt-4 text-center">
        <p className="text-[11px] font-mono text-workspace-muted dark:text-workspace-dark-muted">
          {t('privacyFooter')}
        </p>
      </div>
    </div>
  );
};
