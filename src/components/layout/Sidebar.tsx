import React, { useState } from 'react';
import {
  FileImage,
  Sparkles,
  RefreshCw,
  Layers,
  Settings,
  X,
  Check,
} from 'lucide-react';
import { ActiveTool } from '../../types';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTool,
  onSelectTool,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { openSettings, t, lang } = useApp();

  const handleToolClick = (tool: ActiveTool) => {
    onSelectTool(tool);
    setIsHovered(false);
    onCloseMobile?.();
  };

  return (
    <>
      {/* ======================================================== */}
      {/* 1. DESKTOP EXPANDABLE SIDEBAR (Visible only on md: and up) */}
      {/* ======================================================== */}
      <div className="hidden md:block w-16 flex-shrink-0 h-full relative">
        <aside
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`fixed top-0 left-0 bottom-0 z-50 shell-glass border-r flex flex-col justify-between transition-all duration-300 ease-in-out select-none shadow-raised overflow-hidden ${
            isHovered ? 'w-64 shadow-dialog' : 'w-16'
          }`}
        >
          {/* Top Branding Section */}
          <div>
            <div className="h-16 flex items-center px-3 border-b border-white/10">
              {isHovered ? (
                <div
                  onClick={() => handleToolClick('home')}
                  className="flex items-center space-x-2.5 overflow-hidden pl-1 cursor-pointer group w-full"
                  title="GraphixLab - Kembali ke Halaman Utama"
                >
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary-strong flex items-center justify-center shadow-raised flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center min-w-0">
                    <span className="font-bold text-sm tracking-tight text-white leading-tight group-hover:text-primary-warm transition-colors truncate">
                      GraphixLab
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mx-auto">
                  <button
                    onClick={() => handleToolClick('home')}
                    title="GraphixLab - Kembali ke Halaman Utama"
                    className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary-strong flex items-center justify-center shadow-raised hover:scale-105 transition-transform"
                  >
                    <Layers className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Section */}
            <div className="p-2 space-y-1 mt-2">
              {/* Tool 1: AI Photobooth */}
              <button
                onClick={() => handleToolClick('photobooth')}
                title={t('photoboothTitle')}
                className={`w-full flex items-center rounded-md transition-all text-left ${
                  !isHovered ? 'justify-center p-3' : 'space-x-3 px-3 py-2.5'
                } ${
                  activeTool === 'photobooth'
                    ? 'bg-primary text-white font-medium shadow-raised'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sparkles className="w-5 h-5 flex-shrink-0" />
                {isHovered && (
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs truncate">{t('photoboothTitle')}</span>
                    <span className="text-[10px] text-white/60 tracking-tight">
                      {t('photoboothSubtitle')}
                    </span>
                  </div>
                )}
              </button>

              {/* Tool 2: Image Compressor */}
              <button
                onClick={() => handleToolClick('compressor')}
                title={t('compressorTitle')}
                className={`w-full flex items-center rounded-md transition-all text-left ${
                  !isHovered ? 'justify-center p-3' : 'space-x-3 px-3 py-2.5'
                } ${
                  activeTool === 'compressor'
                    ? 'bg-primary text-white font-medium shadow-raised'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileImage className="w-5 h-5 flex-shrink-0" />
                {isHovered && (
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs truncate">{t('compressorTitle')}</span>
                    <span className="text-[10px] text-white/60 tracking-tight">
                      {t('compressorSubtitle')}
                    </span>
                  </div>
                )}
              </button>

              {/* Tool 3: Image Converter */}
              <button
                onClick={() => handleToolClick('converter')}
                title={t('converterTitle')}
                className={`w-full flex items-center rounded-md transition-all text-left ${
                  !isHovered ? 'justify-center p-3' : 'space-x-3 px-3 py-2.5'
                } ${
                  activeTool === 'converter'
                    ? 'bg-primary text-white font-medium shadow-raised'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <RefreshCw className="w-5 h-5 flex-shrink-0" />
                {isHovered && (
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs truncate">{t('converterTitle')}</span>
                    <span className="text-[10px] text-white/60 tracking-tight">
                      {t('converterSubtitle')}
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Footer Section: Settings */}
          <div className="p-2 border-t border-white/10">
            <button
              onClick={() => {
                openSettings();
                setIsHovered(false);
              }}
              title={t('settingsTitle')}
              className={`w-full flex items-center rounded-md transition-all text-left group ${
                !isHovered ? 'justify-center p-3' : 'space-x-3 px-3 py-2.5'
              } text-white/70 hover:text-white hover:bg-white/10`}
            >
              <Settings className="w-5 h-5 flex-shrink-0 text-white/70 group-hover:text-primary-warm group-hover:rotate-45 transition-transform" />
              {isHovered && (
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-semibold text-white group-hover:text-primary-warm transition-colors truncate">
                    {lang === 'id' ? 'Pengaturan' : 'Settings'}
                  </span>
                  <span className="text-[10px] text-white/50 tracking-tight">
                    {lang === 'id' ? 'Bahasa & Tema' : 'Language & Theme'}
                  </span>
                </div>
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* ======================================================== */}
      {/* 2. MOBILE OFF-CANVAS PAGELIST DRAWER (Hidden on md: and up) */}
      {/* ======================================================== */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0d1117] border-r border-white/10 text-white flex flex-col justify-between p-4 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Mobile Header with Close Button */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
            <div
              onClick={() => handleToolClick('home')}
              className="flex items-center space-x-2.5 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary-strong flex items-center justify-center text-white shadow-raised">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-bold text-base tracking-tight text-white block leading-tight">
                GraphixLab
              </span>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tool Menu Items */}
          <div className="py-3.5 space-y-1.5">
            {/* Menu Item: AI Photobooth Studio */}
            <button
              onClick={() => handleToolClick('photobooth')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                activeTool === 'photobooth'
                  ? 'bg-primary text-white font-semibold shadow-raised'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Sparkles className="w-4 h-4 text-primary-warm flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold">AI Photobooth Studio</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/20 text-white font-mono">
                      20+
                    </span>
                  </div>
                  <span className="text-[10px] text-white/60 truncate">
                    {lang === 'id' ? 'Foto strip 1-4 shots & 22 tema' : '1-4 shots & 22 themes'}
                  </span>
                </div>
              </div>
              {activeTool === 'photobooth' && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
            </button>

            {/* Menu Item: Image Compressor */}
            <button
              onClick={() => handleToolClick('compressor')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                activeTool === 'compressor'
                  ? 'bg-primary text-white font-semibold shadow-raised'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <FileImage className="w-4 h-4 text-primary-warm flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold">{t('compressorTitle')}</span>
                  <span className="text-[10px] text-white/60 truncate">
                    {lang === 'id' ? 'Kompresi lossy & lossless' : 'Lossy & lossless matrix'}
                  </span>
                </div>
              </div>
              {activeTool === 'compressor' && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
            </button>

            {/* Menu Item: Image Converter */}
            <button
              onClick={() => handleToolClick('converter')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                activeTool === 'converter'
                  ? 'bg-primary text-white font-semibold shadow-raised'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <RefreshCw className="w-4 h-4 text-primary-warm flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold">{t('converterTitle')}</span>
                  <span className="text-[10px] text-white/60 truncate">
                    {lang === 'id' ? 'Konversi batch 10 format gambar' : '10-format batch conversion'}
                  </span>
                </div>
              </div>
              {activeTool === 'converter' && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Footer: Settings */}
        <div className="pt-3 border-t border-white/10">
          <button
            onClick={() => {
              openSettings();
              onCloseMobile?.();
            }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4 text-white/70" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white">
                {lang === 'id' ? 'Pengaturan Tampilan & Bahasa' : 'Appearance & Language'}
              </span>
              <span className="text-[10px] text-white/50">
                {lang === 'id' ? 'Bilingual (ID/EN) & Mode Warna' : 'Bilingual (ID/EN) & Theme'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};
