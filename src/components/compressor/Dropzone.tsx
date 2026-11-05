import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { ImageFileMeta } from '../../types';
import { loadImage } from '../../lib/image-compressor';

interface DropzoneProps {
  onImageSelected: (meta: ImageFileMeta) => void;
  currentImage: ImageFileMeta | null;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onImageSelected, currentImage }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMsg(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Format file tidak didukung. Mohon gunakan JPG, PNG, atau WebP.');
      return;
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const img = await loadImage(dataUrl);

      const meta: ImageFileMeta = {
        file,
        name: file.name,
        originalSize: file.size,
        originalWidth: img.width,
        originalHeight: img.height,
        dataUrl,
        aspectRatio: img.width / img.height,
      };

      onImageSelected(meta);
    } catch {
      setErrorMsg('Gagal memproses file citra.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-workspace-outline hover:border-primary/60 bg-workspace-elevated'
        } shadow-subtle`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-workspace-soft flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6 text-primary" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-workspace-foreground">
              {currentImage ? 'Klik atau seret untuk mengganti foto' : 'Tarik & lepas gambar di sini, atau klik untuk memilih'}
            </p>
            <p className="text-xs text-workspace-muted">
              Mendukung file .JPG, .PNG, dan .WebP (100% diproses langsung di browser Anda)
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-workspace-soft text-[11px] font-mono text-workspace-muted border border-workspace-outline">
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
            <span>Format: JPEG · PNG · WEBP</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-2.5 rounded bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};

