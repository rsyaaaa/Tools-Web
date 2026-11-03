import React, { useState, useEffect } from 'react';
import {
  FileImage,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sliders,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { ActiveTool, VisualEngineStatus } from '../../types';

interface HomeViewProps {
  onNavigate: (tool: ActiveTool) => void;
  visualEngine: VisualEngineStatus;
}

const MOTIVATIONAL_QUOTES = [
  "Karyamu hari ini akan menginspirasi esok hari.",
  "Setiap piksel menceritakan ide hebatmu.",
  "Fokus, ciptakan visual terbaikmu sekarang juga!",
  "Mulai langkah kecil, hasilkan karya luar biasa.",
  "Jadikan kreativitasmu tanpa batas hari ini!",
  "Eksplorasi ide tanpa ragu mencoba hal baru.",
  "Visual yang memukau berawal dari sini.",
  "Saatnya wujudkan kreasi grafis terbaikmu sekarang.",
];

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, visualEngine }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const timer = setInterval(() => {
      setFadeState('out');
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
        setFadeState('in');
      }, 300);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-10 py-4 max-w-5xl mx-auto">
      {/* Top Telemetry Row */}
      <div className="flex items-center justify-between border-b border-workspace-outline pb-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-workspace-muted">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>GRAPHIXLAB WORKSPACE // COMMAND CENTER</span>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Visual Engine Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-workspace-soft border border-workspace-outline text-workspace-foreground">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-mono uppercase tracking-wide">
              {visualEngine === 'hardware-accelerated' ? 'Engine: WebGL/2D' : 'Engine: Canvas 2D'}
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-status-success ml-0.5" />
          </div>

          {/* 100% Client-Side Pill */}
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-status-prod-bg text-status-prod-fg border border-status-success/30 font-sans text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Client-Side</span>
          </div>
        </div>
      </div>

      {/* Central Hero Stage */}
      <div className="text-center space-y-4 pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary-strong text-xs font-mono font-semibold">
          <Layers className="w-3.5 h-3.5" />
          <span>VISUAL UTILITIES & SMART PHOTOBOOTH</span>
        </div>

        {/* Big Central Question */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-workspace-foreground">
          Mau Ngapain Hari ini?
        </h1>

        {/* Dynamic Motivational Quote (Max 8 words) */}
        <div className="h-8 flex items-center justify-center">
          <p
            className={`text-sm sm:text-base font-medium text-workspace-muted transition-all duration-300 transform ${fadeState === 'in'
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-1'
              }`}
          >
            "{MOTIVATIONAL_QUOTES[quoteIndex]}"
          </p>
        </div>
      </div>

      {/* Interactive Tool Menu Cards (3 Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Card 1: Image Compressor Studio */}
        <div
          onClick={() => onNavigate('compressor')}
          className="group relative bg-workspace-elevated rounded-lg border border-workspace-outline p-6 shadow-subtle hover:shadow-raised hover:border-primary/70 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            {/* Top Card Icon & Badge */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all">
                <FileImage className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-workspace-soft text-workspace-muted border border-workspace-outline">
                TOOL 01 // MATRIX
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-workspace-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                <span>Image Compressor</span>
              </h2>
              <p className="text-xs sm:text-sm text-workspace-muted leading-relaxed">
                Kompresi gambar instan langsung di browser dengan slider perbandingan belah-tengah (curtain split), downsampling resolusi, dan estimasi reduksi ukuran real-time.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-1.5 pt-2 border-t border-workspace-outline/60 text-xs text-workspace-foreground font-mono">
              <div className="flex items-center gap-2 text-workspace-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success flex-shrink-0" />
                <span>Format: JPEG, PNG, dan WebP</span>
              </div>
              <div className="flex items-center gap-2 text-workspace-muted">
                <Sliders className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span>Preset % & Dimensi Kustom</span>
              </div>
              <div className="flex items-center gap-2 text-workspace-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success flex-shrink-0" />
                <span>Curtain Split Inspector</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2">
            <div className="w-full h-10 rounded-sm bg-workspace-surface group-hover:bg-primary text-workspace-foreground group-hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all border border-workspace-outline group-hover:border-primary shadow-xs">
              <span>Buka Compressor</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 2: AI Palette Photobooth */}
        <div
          onClick={() => onNavigate('photobooth')}
          className="group relative bg-workspace-elevated rounded-lg border border-workspace-outline p-6 shadow-subtle hover:shadow-raised hover:border-primary/70 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            {/* Top Card Icon & Badge */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-workspace-soft text-workspace-muted border border-workspace-outline">
                TOOL 02 // HEURISTIC
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-workspace-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                <span>AI Photobooth</span>
              </h2>
              <p className="text-xs sm:text-sm text-workspace-muted leading-relaxed">
                Abadikan rangkaian foto multi-shot dengan WebRTC camera, ekstraksi 4 warna dominan via K-Means clustering, dan render strip photobooth siap cetak.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-1.5 pt-2 border-t border-workspace-outline/60 text-xs text-workspace-foreground font-mono">
              <div className="flex items-center gap-2 text-workspace-muted">
                <Camera className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span>WebRTC Shutter & Countdown 3s</span>
              </div>
              <div className="flex items-center gap-2 text-workspace-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success flex-shrink-0" />
                <span>K-Means Sub-200ms & Mood Tone</span>
              </div>
              <div className="flex items-center gap-2 text-workspace-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success flex-shrink-0" />
                <span>Procedural Film Grain Strip</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2">
            <div className="w-full h-10 rounded-sm bg-workspace-surface group-hover:bg-primary text-workspace-foreground group-hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all border border-workspace-outline group-hover:border-primary shadow-xs">
              <span>Buka Photobooth</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 3: Image Converter Studio */}
        <div
          onClick={() => onNavigate('converter')}
          className="group relative bg-workspace-elevated rounded-lg border border-workspace-outline p-6 shadow-subtle hover:shadow-raised hover:border-primary/70 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            {/* Top Card Icon & Badge */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all">
                <RefreshCw className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-workspace-soft text-workspace-muted border border-workspace-outline">
                TOOL 03 // CONVERTER
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-workspace-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                <span>Image Converter</span>
              </h2>
              <p className="text-xs sm:text-sm text-workspace-muted leading-relaxed">
                Konversi 11+ format citra (JPEG, JPG, PNG, GIF, BMP, TIFF/TIF, HEIC, ICO, SVG, EPS, PDF) secara batch 100% di browser tanpa upload ke server.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-1.5 pt-2 border-t border-workspace-outline/60 text-xs text-workspace-foreground font-mono">
              <div className="flex items-center gap-2 text-workspace-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success flex-shrink-0" />
                <span>JPEG, JPG, PNG, GIF, BMP, TIFF</span>
              </div>
              <div className="flex items-center gap-2 text-workspace-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success flex-shrink-0" />
                <span>ICO, SVG, EPS, PDF & HEIC Input</span>
              </div>
              <div className="flex items-center gap-2 text-workspace-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success flex-shrink-0" />
                <span>Multi-File Batch & Quality Control</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2">
            <div className="w-full h-10 rounded-sm bg-workspace-surface group-hover:bg-primary text-workspace-foreground group-hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all border border-workspace-outline group-hover:border-primary shadow-xs">
              <span>Buka Image Converter</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Privacy / Security Reassurance */}
      <div className="pt-4 text-center">
        <p className="text-[11px] font-mono text-workspace-muted">
          PRIVACY ASSURED · 100% CLIENT-SIDE EXECUTION · ZERO SERVER PERSISTENCE
        </p>
      </div>
    </div>
  );
};

