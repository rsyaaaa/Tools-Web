import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, translations } from '../lib/translations';

type Theme = 'light' | 'dark';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: keyof typeof translations['id']) => string;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const applyThemeToDom = (t: Theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;

  if (t === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    if (body) {
      body.classList.add('dark');
      body.setAttribute('data-theme', 'dark');
    }
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.removeAttribute('data-theme');
    if (body) {
      body.classList.remove('dark');
      body.removeAttribute('data-theme');
    }
    root.style.colorScheme = 'light';
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state with localStorage persistence (defaults to light mode)
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('graphixlab_theme') as Theme;
      if (saved === 'dark' || saved === 'light') {
        applyThemeToDom(saved);
        return saved;
      }
    }
    applyThemeToDom('light');
    return 'light';
  });

  // Language state with localStorage persistence (defaults to Indonesian)
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('graphixlab_lang') as Language;
      if (saved === 'id' || saved === 'en') return saved;
    }
    return 'id';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync theme with DOM and localStorage
  useEffect(() => {
    applyThemeToDom(theme);
    localStorage.setItem('graphixlab_theme', theme);
  }, [theme]);

  // Sync lang with localStorage
  useEffect(() => {
    localStorage.setItem('graphixlab_lang', lang);
  }, [lang]);

  const setTheme = useCallback((t: Theme) => {
    applyThemeToDom(t);
    localStorage.setItem('graphixlab_theme', t);
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';
      applyThemeToDom(next);
      localStorage.setItem('graphixlab_theme', next);
      return next;
    });
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
  };

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  const t = (key: keyof typeof translations['id']): string => {
    const dict = translations[lang] || translations['id'];
    const val = dict[key];
    if (typeof val === 'string') return val;
    return (translations['id'][key] as string) || String(key);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        lang,
        setLang,
        t,
        isSettingsOpen,
        openSettings,
        closeSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
