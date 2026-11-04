import React, { useEffect } from 'react';
import {
  X,
  Settings,
  Languages,
  Sun,
  Moon,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    closeSettings,
    lang,
    setLang,
    theme,
    setTheme,
    t,
  } = useApp();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSettings();
    };
    if (isSettingsOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, closeSettings]);

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={closeSettings} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-workspace-elevated dark:bg-workspace-dark-elevated rounded-lg border border-workspace-outline dark:border-workspace-dark-outline p-6 shadow-dialog space-y-6 text-workspace-foreground dark:text-workspace-dark-foreground z-10 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-workspace-outline dark:border-workspace-dark-outline pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-workspace-foreground dark:text-workspace-dark-foreground">
                {t('settingsTitle')}
              </h3>
              <p className="text-xs text-workspace-muted dark:text-workspace-dark-muted">
                {t('settingsDesc')}
              </p>
            </div>
          </div>

          <button
            onClick={closeSettings}
            className="p-1.5 rounded text-workspace-muted hover:text-workspace-foreground dark:text-workspace-dark-muted dark:hover:text-workspace-dark-foreground hover:bg-workspace-soft dark:hover:bg-workspace-dark-soft transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Language Switcher */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-workspace-muted dark:text-workspace-dark-muted flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-primary" />
            <span>{t('languageLabel')}</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* Indonesian */}
            <button
              onClick={() => setLang('id')}
              className={`p-3 rounded-md border text-left transition-all flex items-center justify-between ${
                lang === 'id'
                  ? 'border-primary bg-primary/10 text-primary-strong font-bold ring-1 ring-primary'
                  : 'border-workspace-outline dark:border-workspace-dark-outline bg-workspace-surface dark:bg-workspace-dark-surface text-workspace-foreground dark:text-workspace-dark-foreground hover:border-workspace-outline-strong'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">🇮🇩</span>
                <div className="text-xs">
                  <span className="font-semibold block">Bahasa</span>
                  <span className="text-[10px] text-workspace-muted dark:text-workspace-dark-muted">Indonesia</span>
                </div>
              </div>
              {lang === 'id' && <Check className="w-4 h-4 text-primary" />}
            </button>

            {/* English */}
            <button
              onClick={() => setLang('en')}
              className={`p-3 rounded-md border text-left transition-all flex items-center justify-between ${
                lang === 'en'
                  ? 'border-primary bg-primary/10 text-primary-strong font-bold ring-1 ring-primary'
                  : 'border-workspace-outline dark:border-workspace-dark-outline bg-workspace-surface dark:bg-workspace-dark-surface text-workspace-foreground dark:text-workspace-dark-foreground hover:border-workspace-outline-strong'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">🇬🇧</span>
                <div className="text-xs">
                  <span className="font-semibold block">English</span>
                  <span className="text-[10px] text-workspace-muted dark:text-workspace-dark-muted">Global / US</span>
                </div>
              </div>
              {lang === 'en' && <Check className="w-4 h-4 text-primary" />}
            </button>
          </div>
        </div>

        {/* Section 2: Theme Switcher */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-workspace-muted dark:text-workspace-dark-muted flex items-center gap-1.5">
            {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-primary" /> : <Sun className="w-3.5 h-3.5 text-primary" />}
            <span>{t('themeLabel')}</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* Light Mode */}
            <button
              onClick={() => setTheme('light')}
              className={`p-3 rounded-md border text-left transition-all flex items-center justify-between ${
                theme === 'light'
                  ? 'border-primary bg-primary/10 text-primary-strong font-bold ring-1 ring-primary'
                  : 'border-workspace-outline dark:border-workspace-dark-outline bg-workspace-surface dark:bg-workspace-dark-surface text-workspace-foreground dark:text-workspace-dark-foreground hover:border-workspace-outline-strong'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold block">{t('lightMode').split(' ')[0]} {t('lightMode').split(' ')[1]}</span>
                  <span className="text-[10px] text-workspace-muted dark:text-workspace-dark-muted">Warm Paper</span>
                </div>
              </div>
              {theme === 'light' && <Check className="w-4 h-4 text-primary" />}
            </button>

            {/* Dark Mode */}
            <button
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-md border text-left transition-all flex items-center justify-between ${
                theme === 'dark'
                  ? 'border-primary bg-primary/10 text-primary-strong font-bold ring-1 ring-primary'
                  : 'border-workspace-outline dark:border-workspace-dark-outline bg-workspace-surface dark:bg-workspace-dark-surface text-workspace-foreground dark:text-workspace-dark-foreground hover:border-workspace-outline-strong'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-primary-warm flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold block">{t('darkMode').split(' ')[0]} {t('darkMode').split(' ')[1]}</span>
                  <span className="text-[10px] text-workspace-muted dark:text-workspace-dark-muted">Dark Studio</span>
                </div>
              </div>
              {theme === 'dark' && <Check className="w-4 h-4 text-primary" />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-workspace-outline dark:border-workspace-dark-outline flex justify-end">
          <button
            onClick={closeSettings}
            className="px-4 py-2 rounded bg-primary hover:bg-primary-strong text-white text-xs font-bold transition-all shadow-raised"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

