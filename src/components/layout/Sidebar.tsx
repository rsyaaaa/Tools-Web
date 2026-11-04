import React, { useState } from 'react';
import {
  FileImage,
  Sparkles,
  RefreshCw,
  Layers,
  Settings,
} from 'lucide-react';
import { ActiveTool } from '../../types';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTool,
  onSelectTool,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { openSettings, t, lang } = useApp();

  const handleToolClick = (tool: ActiveTool) => {
    onSelectTool(tool);
    setIsHovered(false);
  };

  return (
    <div className="w-16 flex-shrink-0 h-full relative">
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
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm tracking-tight text-white leading-tight group-hover:text-primary-warm transition-colors truncate">
                    GraphixLab
                  </span>
                  <span className="text-[10px] font-mono tracking-wider text-white/50 uppercase">
                    Evreghen Shell
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
            {isHovered && (
              <div className="px-3 py-1.5 text-[10px] font-mono tracking-widest text-white/40 uppercase">
                {t('coreModules')}
              </div>
            )}

            {/* Tool 1: Image Compressor */}
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

            {/* Tool 2: AI Palette Photobooth */}
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
  );
};
