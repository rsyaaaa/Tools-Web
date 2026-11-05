import React, { useState, useEffect } from 'react';
import {
  FileImage,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Layers,
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
    <div className="space-y-5 sm:space-y-6 py-2 sm:py-6 max-w-3xl sm:max-w-4xl mx-auto relative">
      {/* Top Header Row with Dark/Light Mode Toggle (Desktop only, mobile has it in top bar) */}
      <div className="hidden md:flex justify-end items-center relative z-30">
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
          className="w-10 h-10 rounded-full flex items-center justify-center bg-workspace-elevated border-2 border-workspace-outline text-workspace-foreground hover:border-primary hover:text-primary active:scale-90 transition-all shadow-raised group cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-90 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-primary group-hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Central Hero Stage */}
      <div className="text-center space-y-2.5 sm:space-y-3.5 pt-0 pb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary-strong dark:text-primary-warm text-[10px] sm:text-xs font-mono font-semibold">
          <Layers className="w-3.5 h-3.5" />
          <span>{t('freeClientSideBadge')}</span>
        </div>

        {/* Big Central Question */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-workspace-foreground dark:text-workspace-dark-foreground leading-tight">
          {t('heroQuestion')}
        </h1>

        {/* Dynamic Motivational Quote (Max 8 words) */}
        <div className="h-6 sm:h-7 flex items-center justify-center">
          <p
            className={`text-xs sm:text-sm font-medium text-workspace-muted dark:text-workspace-dark-muted transition-all duration-300 transform ${
              fadeState === 'in'
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-1'
            }`}
          >
            "{currentQuotes[quoteIndex % currentQuotes.length]}"
          </p>
        </div>
      </div>

      {/* Interactive Tool Menu Cards (3 Cards) - Sized compactly to match headline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl sm:max-w-3xl mx-auto pt-1 sm:pt-2">
        {/* Card 1: AI Photobooth */}
        <div
          onClick={() => onNavigate('photobooth')}
          className="group relative bg-workspace-elevated dark:bg-workspace-dark-elevated rounded-lg border border-workspace-outline dark:border-workspace-dark-outline p-3.5 sm:p-4 shadow-subtle hover:shadow-raised hover:border-primary/70 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3"
        >
          <div className="space-y-2.5">
            {/* Top Card Icon & Badge */}
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-workspace-soft dark:bg-workspace-dark-soft text-workspace-muted dark:text-workspace-dark-muted border border-workspace-outline dark:border-workspace-dark-outline">
                20+ THEMES
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-bold text-workspace-foreground dark:text-workspace-dark-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                <span>{t('photoboothTitle')}</span>
              </h2>
              <p className="text-xs text-workspace-muted dark:text-workspace-dark-muted leading-relaxed line-clamp-2">
                {t('card2Desc')}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-1">
            <div className="w-full h-8 rounded-sm bg-workspace-surface dark:bg-workspace-dark-surface group-hover:bg-primary text-workspace-foreground dark:text-workspace-dark-foreground group-hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all border border-workspace-outline dark:border-workspace-dark-outline group-hover:border-primary shadow-xs">
              <span className="text-[11px]">{t('card2Btn')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 2: Image Compressor Studio */}
        <div
          onClick={() => onNavigate('compressor')}
          className="group relative bg-workspace-elevated dark:bg-workspace-dark-elevated rounded-lg border border-workspace-outline dark:border-workspace-dark-outline p-3.5 sm:p-4 shadow-subtle hover:shadow-raised hover:border-primary/70 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3"
        >
          <div className="space-y-2.5">
            {/* Top Card Icon & Badge */}
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all">
                <FileImage className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-workspace-soft dark:bg-workspace-dark-soft text-workspace-muted dark:text-workspace-dark-muted border border-workspace-outline dark:border-workspace-dark-outline">
                LOSSLESS
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-bold text-workspace-foreground dark:text-workspace-dark-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                <span>{t('compressorTitle')}</span>
              </h2>
              <p className="text-xs text-workspace-muted dark:text-workspace-dark-muted leading-relaxed line-clamp-2">
                {t('card1Desc')}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-1">
            <div className="w-full h-8 rounded-sm bg-workspace-surface dark:bg-workspace-dark-surface group-hover:bg-primary text-workspace-foreground dark:text-workspace-dark-foreground group-hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all border border-workspace-outline dark:border-workspace-dark-outline group-hover:border-primary shadow-xs">
              <span className="text-[11px]">{t('card1Btn')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 3: Image Converter Studio */}
        <div
          onClick={() => onNavigate('converter')}
          className="group relative bg-workspace-elevated dark:bg-workspace-dark-elevated rounded-lg border border-workspace-outline dark:border-workspace-dark-outline p-3.5 sm:p-4 shadow-subtle hover:shadow-raised hover:border-primary/70 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3"
        >
          <div className="space-y-2.5">
            {/* Top Card Icon & Badge */}
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all">
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-workspace-soft dark:bg-workspace-dark-soft text-workspace-muted dark:text-workspace-dark-muted border border-workspace-outline dark:border-workspace-dark-outline">
                10 FORMATS
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-bold text-workspace-foreground dark:text-workspace-dark-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                <span>{t('converterTitle')}</span>
              </h2>
              <p className="text-xs text-workspace-muted dark:text-workspace-dark-muted leading-relaxed line-clamp-2">
                {t('card3Desc')}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-1">
            <div className="w-full h-8 rounded-sm bg-workspace-surface dark:bg-workspace-dark-surface group-hover:bg-primary text-workspace-foreground dark:text-workspace-dark-foreground group-hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all border border-workspace-outline dark:border-workspace-dark-outline group-hover:border-primary shadow-xs">
              <span className="text-[11px]">{t('card3Btn')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
