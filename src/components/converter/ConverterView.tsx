import React, { useState, useRef } from 'react';
import {
  RefreshCw,
  UploadCloud,
  Download,
  Trash2,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Cpu,
  ShieldCheck,
  ArrowRight,
  Layers,
  FileText,
  Sliders,
} from 'lucide-react';
import { ConvertTaskItem, ConvertTargetFormat, VisualEngineStatus } from '../../types';
import {
  convertImage,
  downloadConvertedFile,
  getExtensionFromMime,
  getFormatLabel,
} from '../../lib/image-converter';
import { decodeHeicIfSupported } from '../../lib/format-encoders';
import { formatBytes, loadImage } from '../../lib/image-compressor';

interface ConverterViewProps {
  visualEngine: VisualEngineStatus;
}

const AVAILABLE_FORMATS: {
  format: ConvertTargetFormat;
  label: string;
  ext: string;
  desc: string;
  category: 'Popular' | 'System' | 'Vector & Doc';
}[] = [
    { format: 'image/png', label: 'PNG', ext: '.png', desc: 'Lossless, Alpha Transparansi', category: 'Popular' },
    { format: 'image/jpeg', label: 'JPG / JPEG', ext: '.jpg', desc: 'Universal, Kompresi Tinggi', category: 'Popular' },
    { format: 'image/webp', label: 'WebP', ext: '.webp', desc: 'Format Web Modern Ringan', category: 'Popular' },
    { format: 'image/gif', label: 'GIF', ext: '.gif', desc: 'Grafis / Animasi', category: 'Popular' },
    { format: 'image/x-icon', label: 'ICO', ext: '.ico', desc: 'Windows Icon & Favicon', category: 'System' },
    { format: 'image/bmp', label: 'BMP', ext: '.bmp', desc: 'Windows Bitmap Uncompressed', category: 'System' },
    { format: 'image/tiff', label: 'TIFF / TIF', ext: '.tiff', desc: 'Tagged Image Archival', category: 'System' },
    { format: 'application/pdf', label: 'PDF', ext: '.pdf', desc: 'Adobe PDF Single Page', category: 'Vector & Doc' },
    { format: 'image/svg+xml', label: 'SVG', ext: '.svg', desc: 'Scalable Vector Wrapper', category: 'Vector & Doc' },
    { format: 'application/postscript', label: 'EPS', ext: '.eps', desc: 'Encapsulated PostScript', category: 'Vector & Doc' },
  ];

export const ConverterView: React.FC<ConverterViewProps> = ({ visualEngine }) => {
  const [items, setItems] = useState<ConvertTaskItem[]>([]);
  const [globalTargetFormat, setGlobalTargetFormat] = useState<ConvertTargetFormat>('image/png');
  const [useJpegExtension, setUseJpegExtension] = useState<boolean>(false);
  const [globalQuality, setGlobalQuality] = useState<number>(0.92);
  const [globalBgColor, setGlobalBgColor] = useState<string>('#FFFFFF');
  const [isConvertingAll, setIsConvertingAll] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate and read input files
  const handleFiles = async (files: FileList | File[]) => {
    const validExtensions = [
      '.png', '.jpg', '.jpeg', '.webp', '.gif',
      '.bmp', '.tiff', '.tif', '.heic', '.heif',
      '.ico', '.svg', '.eps', '.pdf'
    ];

    const inputList = Array.from(files).filter((f) => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      return (
        f.type.startsWith('image/') ||
        f.type === 'application/pdf' ||
        f.type === 'application/postscript' ||
        validExtensions.includes(ext)
      );
    });

    if (inputList.length === 0) return;

    const newItems: ConvertTaskItem[] = [];

      for (const file of inputList) {
        try {
          let processedBlob: Blob = file;
          const lowerName = file.name.toLowerCase();

          // If HEIC / HEIF file from iOS/macOS, decode client-side
          if (lowerName.endsWith('.heic') || lowerName.endsWith('.heif') || file.type.includes('heic') || file.type.includes('heif')) {
            processedBlob = await decodeHeicIfSupported(file);
          }

          const previewUrl = URL.createObjectURL(processedBlob);
          const img = await loadImage(previewUrl);

          newItems.push({
            id: Math.random().toString(36).substring(2, 9),
            file,
            name: file.name,
            originalSize: file.size,
            originalFormat: file.type || ('image/' + (lowerName.split('.').pop() || 'png')),
            originalWidth: img.naturalWidth || img.width,
            originalHeight: img.naturalHeight || img.height,
            previewUrl,
            targetFormat: globalTargetFormat,
            quality: globalQuality,
            backgroundColor: globalBgColor,
            status: 'pending',
            convertedBlob: null,
            convertedUrl: null,
            convertedSize: null,
          });
        } catch (err: unknown) {
          console.error('Failed to load image metadata for', file.name, err);
        }
      }

      setItems((prev) => [...prev, ...newItems]);
    };

    // Convert a single task item
    const convertItem = async (itemId: string) => {
      setItems((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, status: 'converting' } : it))
      );

      const item = items.find((it) => it.id === itemId);
      if (!item) return;

      try {
        const res = await convertImage(
          item.previewUrl,
          item.targetFormat,
          item.quality,
          item.backgroundColor
        );

        setItems((prev) =>
          prev.map((it) =>
            it.id === itemId
              ? {
                ...it,
                status: 'completed',
                convertedBlob: res.blob,
                convertedUrl: res.url,
                convertedSize: res.size,
              }
              : it
          )
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal konversi';
        setItems((prev) =>
          prev.map((it) =>
            it.id === itemId ? { ...it, status: 'error', errorMessage: msg } : it
          )
        );
      }
    };

    // Convert all pending or completed items
    const handleConvertAll = async () => {
      if (items.length === 0) return;
      setIsConvertingAll(true);

      for (const item of items) {
        try {
          setItems((prev) =>
            prev.map((it) => (it.id === item.id ? { ...it, status: 'converting' } : it))
          );

          const res = await convertImage(
            item.previewUrl,
            item.targetFormat,
            item.quality,
            item.backgroundColor
          );

          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? {
                  ...it,
                  status: 'completed',
                  convertedBlob: res.blob,
                  convertedUrl: res.url,
                  convertedSize: res.size,
                }
                : it
            )
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Gagal konversi';
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id ? { ...it, status: 'error', errorMessage: msg } : it
            )
          );
        }
      }

      setIsConvertingAll(false);
    };

    // Update target format for all items
    const handleSetGlobalTargetFormat = (format: ConvertTargetFormat) => {
      setGlobalTargetFormat(format);
      setItems((prev) =>
        prev.map((it) => ({
          ...it,
          targetFormat: format,
          status: it.status === 'completed' ? 'pending' : it.status,
        }))
      );
    };

    // Update target format for a single item
    const handleSetItemTargetFormat = (itemId: string, format: ConvertTargetFormat) => {
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? {
              ...it,
              targetFormat: format,
              status: it.status === 'completed' ? 'pending' : it.status,
            }
            : it
        )
      );
    };

    // Download all completed files
    const handleDownloadAll = () => {
      const completedItems = items.filter((it) => it.status === 'completed' && it.convertedBlob);
      completedItems.forEach((it, idx) => {
        setTimeout(() => {
          if (it.convertedBlob) {
            downloadConvertedFile(it.convertedBlob, it.name, it.targetFormat, useJpegExtension);
          }
        }, idx * 250);
      });
    };

    // Clear all items
    const handleClearAll = () => {
      items.forEach((it) => {
        if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
        if (it.convertedUrl) URL.revokeObjectURL(it.convertedUrl);
      });
      setItems([]);
    };

    // Remove single item
    const handleRemoveItem = (id: string) => {
      const it = items.find((x) => x.id === id);
      if (it) {
        if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
        if (it.convertedUrl) URL.revokeObjectURL(it.convertedUrl);
      }
      setItems((prev) => prev.filter((x) => x.id !== id));
    };

    // Load demo samples
    const loadDemoConverterImages = () => {
      const canvas1 = document.createElement('canvas');
      canvas1.width = 600;
      canvas1.height = 600;
      const ctx1 = canvas1.getContext('2d');
      if (ctx1) {
        ctx1.clearRect(0, 0, 600, 600);
        ctx1.fillStyle = '#FE6E00';
        ctx1.beginPath();
        ctx1.arc(300, 300, 200, 0, Math.PI * 2);
        ctx1.fill();

        ctx1.fillStyle = '#FFFFFF';
        ctx1.font = 'bold 44px ui-sans-serif, system-ui';
        ctx1.textAlign = 'center';
        ctx1.fillText('LOGO ALPHA', 300, 290);
        ctx1.font = '20px ui-mono';
        ctx1.fillText('PNG TRANSPARENT', 300, 335);
      }

      const canvas2 = document.createElement('canvas');
      canvas2.width = 1200;
      canvas2.height = 800;
      const ctx2 = canvas2.getContext('2d');
      if (ctx2) {
        const grad = ctx2.createLinearGradient(0, 0, 1200, 800);
        grad.addColorStop(0, '#0F172A');
        grad.addColorStop(0.5, '#423D38');
        grad.addColorStop(1, '#FE6E00');
        ctx2.fillStyle = grad;
        ctx2.fillRect(0, 0, 1200, 800);

        ctx2.fillStyle = '#FFFFFF';
        ctx2.font = 'bold 48px ui-sans-serif, system-ui';
        ctx2.fillText('RAW SCENE MATRIX', 80, 390);
        ctx2.font = '20px ui-mono';
        ctx2.fillText('1200x800 RGB COMPOSITION FOR MULTI-FORMAT TEST', 80, 435);
      }

      canvas1.toBlob((blob1) => {
        if (!blob1) return;
        const file1 = new File([blob1], 'sample-app-logo.png', { type: 'image/png' });

        canvas2.toBlob((blob2) => {
          if (!blob2) return;
          const file2 = new File([blob2], 'sample-wallpaper.jpg', { type: 'image/jpeg' });
          handleFiles([file1, file2]);
        }, 'image/jpeg', 0.95);
      }, 'image/png');
    };

    const completedCount = items.filter((it) => it.status === 'completed').length;
    const requiresQuality = globalTargetFormat === 'image/jpeg' || globalTargetFormat === 'image/webp';
    const requiresBg = globalTargetFormat === 'image/jpeg' || globalTargetFormat === 'image/bmp';

    return (
      <div className="space-y-6">
        {/* Section Header with Telemetry Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-workspace-outline pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-workspace-foreground flex items-center gap-2">
              <span>Image Converter Studio</span>
              <span className="text-xs bg-primary/15 text-primary-strong border border-primary/30 px-2 py-0.5 rounded font-mono font-semibold">
                11+ FORMATS
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-workspace-muted mt-0.5">
              Konversi universal: JPEG, JPG, PNG, GIF, BMP, TIFF/TIF, HEIC/HEIF, ICO, SVG, EPS, dan PDF 100% di browser.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Visual Engine Status Badge */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-workspace-soft border border-workspace-outline text-workspace-foreground">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-mono uppercase tracking-wide">
                {visualEngine === 'hardware-accelerated' ? 'Engine: WebGL/2D' : 'Engine: Canvas 2D'}
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-status-success ml-0.5" />
            </div>

            {/* Security / 100% Client-Side Pill */}
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-status-prod-bg text-status-prod-fg border border-status-success/30 font-sans text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Client-Side</span>
            </div>

            {items.length === 0 && (
              <button
                onClick={loadDemoConverterImages}
                className="px-3.5 py-2 rounded border border-primary/40 bg-primary/10 hover:bg-primary hover:text-white text-primary-strong text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Muat Contoh Citra Uji</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Grid: Left Controls & Right List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Dropzone & Comprehensive Format Matrix (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* File Upload Dropzone */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tiff,.tif,.heic,.heif,.ico,.svg,.eps,.pdf"
              multiple
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-5 sm:p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-workspace-outline hover:border-primary/60 bg-workspace-elevated'
              } shadow-subtle`}
            >
            <div className="flex flex-col items-center justify-center space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-workspace-soft flex items-center justify-center text-primary">
                <UploadCloud className="w-5 h-5 text-primary" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-workspace-foreground">
                  Pilih atau seret berkas ke sini
                </p>
                <p className="text-xs text-workspace-muted leading-relaxed">
                  JPEG, JPG, PNG, GIF, BMP, TIFF/TIF, HEIC/HEIF, ICO, SVG, EPS, PDF
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-workspace-soft text-[10px] font-mono text-workspace-muted border border-workspace-outline">
                <Layers className="w-3 h-3 text-primary" />
                <span>Multi-File Batch Conversion</span>
              </div>
            </div>
          </div>

          {/* Target Format & Settings Card */}
          <div className="bg-workspace-elevated rounded-lg border border-workspace-outline p-5 shadow-subtle space-y-5">
            <div className="flex items-center justify-between border-b border-workspace-outline pb-3">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-workspace-foreground">
                  Pilihan Format Target
                </h3>
              </div>
              <span className="text-[10px] font-mono text-primary font-bold px-2 py-0.5 rounded bg-primary/10 border border-primary/25">
                {getFormatLabel(globalTargetFormat)}
              </span>
            </div>

            {/* Comprehensive Grid of 10 Formats */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-workspace-muted block">
                Konversi Semua Ke Format:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_FORMATS.map((item) => {
                  const isSelected = globalTargetFormat === item.format;
                  return (
                    <button
              key = { item.format }
                      onClick={() => handleSetGlobalTargetFormat(item.format)}
            className={`p-2 rounded border text-left transition-all ${isSelected
                  ? 'border-primary ring-1 ring-primary bg-primary/10 text-primary-strong shadow-xs'
                  : 'border-workspace-outline bg-workspace-surface text-workspace-foreground hover:border-workspace-outline-strong'
                      }`}
                    >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono">{item.label}</span>
                <span className="text-[10px] font-mono text-workspace-muted">{item.ext}</span>
              </div>
              <span className="text-[9px] text-workspace-muted block truncate mt-0.5">
                {item.desc}
              </span>
            </button>
            );
                })}
          </div>

          {/* Extra extension switcher: JPG vs JPEG */}
          {globalTargetFormat === 'image/jpeg' && (
            <div className="flex items-center justify-between p-2 rounded bg-workspace-soft border border-workspace-outline text-xs">
              <span className="text-workspace-muted text-[11px] font-mono">Ekstensi File:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setUseJpegExtension(false)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${!useJpegExtension
                      ? 'bg-primary text-white font-bold'
                      : 'text-workspace-muted hover:text-workspace-foreground'
                    }`}
                >
                  .jpg
                </button>
                <button
                  onClick={() => setUseJpegExtension(true)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${useJpegExtension
                      ? 'bg-primary text-white font-bold'
                      : 'text-workspace-muted hover:text-workspace-foreground'
                    }`}
                >
                  .jpeg
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quality Slider (for WebP & JPEG) */}
            {requiresQuality && (
              <div className="space-y-2 pt-2 border-t border-workspace-outline">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-workspace-muted flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-primary" />
                      Kualitas Kuantisasi
                    </label>
                    <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                      {Math.round(globalQuality * 100)}%
                    </span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="1.0"
                  step="0.05"
                  value={globalQuality}
                  onChange={(e) => setGlobalQuality(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] font-mono text-workspace-muted">
                  <span>0.20 (File Ringan)</span>
                  <span>0.80 (Optimal)</span>
                  <span>1.0 (Maksimal)</span>
                </div>
              </div>
            )}

                {/* Background Color Picker (For JPEG / BMP transparency fill) */}
                {requiresBg && (
                  <div className="space-y-2 pt-2 border-t border-workspace-outline">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-workspace-muted">
                        Warna Latar Transparansi
                      </label>
                      <span className="text-xs font-mono text-workspace-muted">{globalBgColor}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={globalBgColor}
                        onChange={(e) => setGlobalBgColor(e.target.value)}
                        className="w-8 h-8 rounded border border-workspace-outline cursor-pointer bg-transparent"
                      />
                      <div className="flex gap-1.5 flex-1">
                        {['#FFFFFF', '#000000', '#F3F4F6'].map((c) => (
                          <button
                            key={c}
                            onClick={() => setGlobalBgColor(c)}
                            className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${globalBgColor.toLowerCase() === c.toLowerCase()
                                ? 'border-primary bg-primary/10 text-primary-strong font-bold'
                                : 'border-workspace-outline bg-workspace text-workspace-muted'
                              }`}
                          >
                            {c === '#FFFFFF' ? 'Putih' : c === '#000000' ? 'Hitam' : 'Abu'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleConvertAll}
                    disabled={items.length === 0 || isConvertingAll}
                    className="w-full h-11 bg-primary hover:bg-primary-strong active:bg-primary-focus text-white font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center space-x-2 shadow-raised disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-4 h-4 ${isConvertingAll ? 'animate-spin' : ''}`} />
                    <span>
                      {isConvertingAll
                          ? 'Sedang Memproses Konversi...'
                          : `Konversi Semua (${items.length} Berkas)`}
                    </span>
                  </button>

                  {completedCount > 0 && (
                    <button
                      onClick={handleDownloadAll}
                      className="w-full h-10 rounded border border-status-success/40 bg-status-prod-bg text-status-prod-fg font-bold text-xs flex items-center justify-center space-x-2 hover:bg-status-success hover:text-white transition-all shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh Semua ({completedCount} Berkas)</span>
                    </button>
                  )}
                </div>
              </div>
        </div>

        {/* Right Column: Queue / Conversion Task Items List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-workspace-elevated rounded-lg border border-workspace-outline p-5 shadow-subtle space-y-4">
            {/* List Header */}
            <div className="flex items-center justify-between border-b border-workspace-outline pb-3">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-workspace-foreground">
                  Antrean Berkas Gambar ({items.length})
                </h3>
              </div>

              {items.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] font-mono text-status-danger hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua</span>
                </button>
              )}
            </div>

            {/* Empty State */}
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <FileText className="w-12 h-12 text-workspace-outline mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-workspace-foreground">
                    Belum ada gambar dalam antrean
                  </p>
                  <p className="text-xs text-workspace-muted max-w-sm mx-auto">
                    Mendukung berkas JPG, PNG, WEBP, GIF, BMP, TIFF, HEIC, ICO, SVG, EPS, dan PDF.
                  </p>
                </div>
              </div>
            ) : (
              /* Item Cards */
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {items.map((item) => {
                    const origLabel = getFormatLabel(item.originalFormat);
                    const targetLabel = getFormatLabel(item.targetFormat);

                    return (
                      <div
                        key={item.id}
                        className="bg-workspace-surface rounded-md border border-workspace-outline p-3.5 transition-all hover:border-workspace-outline-strong flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        {/* Left: Thumbnail & Meta */}
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="w-14 h-14 rounded border border-workspace-outline overflow-hidden bg-workspace flex-shrink-0 flex items-center justify-center">
                            <img
                              src={item.previewUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-xs font-semibold text-workspace-foreground truncate" title={item.name}>
                              {item.name}
                            </p>

                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                              <span className="px-1.5 py-0.5 rounded bg-workspace-soft text-workspace-foreground border border-workspace-outline font-bold">
                                {origLabel}
                              </span>
                              <ArrowRight className="w-3 h-3 text-workspace-muted" />
                              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary-strong border border-primary/30 font-bold">
                                {targetLabel}
                              </span>
                              <span className="text-workspace-muted">
                                · {item.originalWidth}×{item.originalHeight} px · {formatBytes(item.originalSize)}
                              </span>
                            </div>

                            {/* Result status label */}
                            {item.status === 'completed' && item.convertedSize && (
                              <div className="text-[10px] font-mono text-status-success font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>
                                  Selesai: {formatBytes(item.convertedSize)} ({getExtensionFromMime(item.targetFormat, useJpegExtension)})
                                </span>
                              </div>
                            )}

                            {item.status === 'error' && (
                              <div className="text-[10px] text-status-danger flex items-center gap-1 font-mono">
                                <AlertCircle className="w-3 h-3" />
                                <span>{item.errorMessage || 'Gagal'}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Controls & Actions */}
                        <div className="flex items-center space-x-2 self-end sm:self-auto flex-shrink-0">
                          {/* Target Format dropdown per item */}
                          <select
                            value={item.targetFormat}
                            onChange={(e) =>
                              handleSetItemTargetFormat(item.id, e.target.value as ConvertTargetFormat)
                            }
                            className="text-[11px] font-mono rounded bg-workspace border border-workspace-outline px-2 py-1 text-workspace-foreground focus:outline-none focus:border-primary"
                          >
                            {AVAILABLE_FORMATS.map((fmt) => (
                              <option key={fmt.format} value={fmt.format}>
                                {fmt.label}
                              </option>
                            ))}
                          </select>

                          {/* Convert Button */}
                          <button
                            onClick={() => convertItem(item.id)}
                            disabled={item.status === 'converting'}
                            className="px-2.5 py-1 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-strong transition-colors disabled:opacity-40"
                            title="Konversi Berkas Ini"
                          >
                            {item.status === 'converting' ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              'Konversi'
                            )}
                          </button>

                          {/* Download Single Button */}
                          {item.status === 'completed' && item.convertedBlob && (
                            <button
                              onClick={() =>
                              downloadConvertedFile(item.convertedBlob!, item.name, item.targetFormat, useJpegExtension)
                          }
                          className="p-1.5 rounded bg-status-prod-bg text-status-prod-fg border border-status-success/30 hover:bg-status-success hover:text-white transition-colors"
                          title="Unduh Berkas Hasil"
                          >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        )}

                        {/* Remove item button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-workspace-muted hover:text-status-danger transition-colors"
                          title="Hapus dari antrean"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};
