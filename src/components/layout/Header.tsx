import React from 'react';
import { Cpu, Camera, ShieldCheck } from 'lucide-react';
import { ActiveTool, CameraStatus, VisualEngineStatus } from '../../types';

interface HeaderProps {
  activeTool: ActiveTool;
  cameraStatus: CameraStatus;
  visualEngine: VisualEngineStatus;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTool,
  cameraStatus,
  visualEngine,
}) => {
  return (
    <header className="h-16 shell-glass border-b px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 text-white select-none">
      {/* Left: Active Tool Indicator & Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-mono tracking-wider uppercase text-white/50">
            WORKSPACE //
          </span>
          <h1 className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
            {activeTool === 'compressor' ? (
              <>Image Compressor Studio</>
            ) : (
              <>
                <span>AI Photobooth</span>
                <span className="text-[10px] bg-primary/20 text-primary-warm px-1.5 py-0.5 rounded border border-primary/30 font-mono">
                  20+ THEMES
                </span>
              </>
            )}
          </h1>
        </div>
      </div>

      {/* Right: Engine & Hardware Telemetry Badges */}
      <div className="flex items-center space-x-2 sm:space-x-3 text-xs font-mono">
        {/* Visual Engine Status Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white/80">
          <Cpu className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] uppercase tracking-wide">
            {visualEngine === 'hardware-accelerated' ? 'Engine: WebGL/2D' : 'Engine: Canvas 2D'}
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-status-success ml-0.5" />
        </div>

        {/* Camera Status Badge */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white/80">
          <Camera className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] uppercase tracking-wide">
            Cam:{' '}
            {cameraStatus === 'streaming'
              ? 'LIVE'
              : cameraStatus === 'ready'
              ? 'READY'
              : cameraStatus === 'permission-denied'
              ? 'DENIED'
              : 'IDLE'}
          </span>
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${
              cameraStatus === 'streaming'
                ? 'bg-status-success animate-ping'
                : cameraStatus === 'ready'
                ? 'bg-status-info'
                : cameraStatus === 'permission-denied'
                ? 'bg-status-danger'
                : 'bg-white/30'
            }`}
          />
        </div>

        {/* Security / Zero Server Persistence Pill */}
        <div className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-status-prod-bg text-status-prod-fg border border-status-success/30 font-sans text-[11px] font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Client-Side</span>
        </div>
      </div>
    </header>
  );
};
