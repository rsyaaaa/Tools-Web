import React from 'react';
import {
  FileImage,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
  Activity,
  HardDrive
} from 'lucide-react';
import { ActiveTool } from '../../types';

interface SidebarProps {
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTool,
  onSelectTool,
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
          }`}
    >
      {/* Top Branding Section */}
      <div>
        <div className="h-16 flex items-center justify-between px-3 border-b border-white/10">
          {!isCollapsed && (
            <div className="flex items-center space-x-2.5 overflow-hidden pl-1">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary-strong flex items-center justify-center shadow-raised flex-shrink-0">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white leading-tight">
                  GraphixLab
                </span>
                <span className="text-[10px] font-mono tracking-wider text-white/50 uppercase">
                  Evreghen Shell
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="mx-auto">
              <button
                onClick={onToggleCollapse}
                title="Expand sidebar"
                className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary-strong flex items-center justify-center shadow-raised hover:scale-105 transition-transform"
              >
                <Layers className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex w-8 h-8 rounded items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Section */}
        <div className="p-2 space-y-1 mt-2">
          {!isCollapsed && (
            <div className="px-3 py-1.5 text-[10px] font-mono tracking-widest text-white/40 uppercase">
              Core Visual Modules
            </div>
          )}

          {/* Tool 1: Image Compressor */}
          <button
            onClick={() => onSelectTool('compressor')}
            title="Image Compressor Studio"
            className={`w-full flex items-center rounded-md transition-all text-left ${
              isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3 py-2.5'
      } ${
              activeTool === 'compressor'
        ? 'bg-primary text-white font-medium shadow-raised'
        : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}
          >
            <FileImage className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs truncate">Image Compressor</span>
                <span className="text-[10px] text-white/60 tracking-tight">
                  Lossy & Lossless Matrix
                </span>
              </div>
            )}
          </button>

          {/* Tool 2: AI Palette Photobooth */}
          <button
            onClick={() => onSelectTool('photobooth')}
            title="AI Palette Photobooth"
            className={`w - full flex items - center rounded - md transition - all text - left ${
    isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3 py-2.5'
  } ${
    activeTool === 'photobooth'
      ? 'bg-primary text-white font-medium shadow-raised'
      : 'text-white/70 hover:text-white hover:bg-white/10'
  } `}
          >
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs truncate">AI Palette Photobooth</span>
                <span className="text-[10px] text-white/60 tracking-tight">
                  K-Means Strip Studio
                </span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Telemetry Card / Memory Info */}
      <div className="p-2 border-t border-white/10">
        {!isCollapsed ? (
          <div className="bg-white/5 rounded-lg p-2.5 space-y-2 border border-white/5">
            <div className="flex items-center justify-between text-[11px] font-mono text-white/70">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-primary" />
                Storage State:
              </span>
              <span className="text-status-success font-semibold">RAM ONLY</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/50 font-mono">
              <span>Telemetry:</span>
              <span>2D Matrix v1.0</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
              <div className="bg-primary h-full w-2/3" />
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2" title="RAM Only State">
            <Activity className="w-4 h-4 text-status-success animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};

