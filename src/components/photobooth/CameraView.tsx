import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  Sparkles,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CapturedPhoto, CameraStatus } from '../../types';
import { soundFx } from '../../lib/audio-fx';

interface CameraViewProps {
  onPhotosCaptured: (photos: CapturedPhoto[]) => void;
  targetCount: 3 | 4;
  onTargetCountChange: (count: 3 | 4) => void;
  onCameraStatusChange?: (status: CameraStatus) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onPhotosCaptured,
  targetCount,
  onTargetCountChange,
  onCameraStatusChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Shutter & Sequence State
  const [isCapturingSequence, setIsCapturingSequence] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0);
  const [flashActive, setFlashActive] = useState(false);
  const [tempCapturedList, setTempCapturedList] = useState<CapturedPhoto[]>([]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setPermissionError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC API is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      onCameraStatusChange?.('streaming');
    } catch (err: unknown) {
      console.warn('Camera access issue:', err);
      setIsCameraActive(false);
      onCameraStatusChange?.('permission-denied');
      setPermissionError(
        'Kamera tidak dapat diakses atau izin ditolak. Anda dapat menggunakan mode unggah foto di bawah.'
      );
    }
  }, [facingMode, onCameraStatusChange]);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    onCameraStatusChange?.('inactive');
  }, [onCameraStatusChange]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture single frame from live video
  const grabVideoFrame = (): CapturedPhoto | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Flip horizontal if selfie/user camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    return {
      id: Math.random().toString(36).substring(2, 9),
      dataUrl,
      width: canvas.width,
      height: canvas.height,
    };
  };

  // Execute sequence capture
  const startMultiShot = () => {
    if (isCapturingSequence || !isCameraActive) return;
    setIsCapturingSequence(true);
    setCurrentShotIndex(0);
    setTempCapturedList([]);

    const runSequenceForIndex = (shotIdx: number, accumulated: CapturedPhoto[]) => {
      let counter = 3;
      setCountdown(counter);
      if (soundEnabled) soundFx.playBeep(false);

      const interval = setInterval(() => {
        counter--;
        if (counter > 0) {
          setCountdown(counter);
          if (soundEnabled) soundFx.playBeep(false);
        } else {
          clearInterval(interval);
          setCountdown(0);
          if (soundEnabled) soundFx.playBeep(true);

          // Screen Flash effect
          setFlashActive(true);
          if (soundEnabled) soundFx.playShutter();

          setTimeout(() => {
            const photo = grabVideoFrame();
            setFlashActive(false);
            setCountdown(null);

            if (photo) {
              const nextAccumulated = [...accumulated, photo];
              setTempCapturedList(nextAccumulated);

              if (shotIdx + 1 < targetCount) {
                setCurrentShotIndex(shotIdx + 1);
                // Pause 1.2s before next countdown
                setTimeout(() => {
                  runSequenceForIndex(shotIdx + 1, nextAccumulated);
                }, 1200);
              } else {
                // Done with all shots!
                setIsCapturingSequence(false);
                onPhotosCaptured(nextAccumulated);
              }
            } else {
              setIsCapturingSequence(false);
            }
          }, 150);
        }
      }, 1000);
    };

    runSequenceForIndex(0, []);
  };

  // Fallback Upload Mode
  const handleUploadFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files).slice(0, targetCount);

    const readers = files.map((file) => {
      return new Promise<CapturedPhoto>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            resolve({
              id: Math.random().toString(36).substring(2, 9),
              dataUrl: reader.result as string,
              width: img.width,
              height: img.height,
            });
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((photos) => {
      onPhotosCaptured(photos);
    });
  };

  return (
    <div className="bg-workspace-elevated rounded-lg border border-workspace-outline shadow-subtle overflow-hidden">
      {/* Top Controller Bar */}
      <div className="px-4 py-3 border-b border-workspace-outline flex items-center justify-between bg-workspace-soft/50">
        <div className="flex items-center space-x-2">
          <Camera className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-workspace-foreground">
            Live Viewfinder & Shutter
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Target Shot Count Selector (3 vs 4) */}
          <div className="flex items-center bg-workspace rounded border border-workspace-outline p-0.5 text-xs font-mono">
            <button
              onClick={() => onTargetCountChange(3)}
              disabled={isCapturingSequence}
              className={`px-2.5 py-1 rounded transition-colors ${
                targetCount === 3
                  ? 'bg-primary text-white font-bold'
                  : 'text-workspace-muted hover:text-workspace-foreground'
              }`}
            >
              3 Shots
            </button>
            <button
              onClick={() => onTargetCountChange(4)}
              disabled={isCapturingSequence}
              className={`px-2.5 py-1 rounded transition-colors ${
                targetCount === 4
                  ? 'bg-primary text-white font-bold'
                  : 'text-workspace-muted hover:text-workspace-foreground'
              }`}
            >
              4 Shots
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Matikan suara' : 'Aktifkan suara'}
            className="p-1.5 rounded border border-workspace-outline bg-workspace text-workspace-muted hover:text-workspace-foreground"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Switch Camera Button */}
          <button
            onClick={toggleCameraFacing}
            disabled={!isCameraActive || isCapturingSequence}
            title="Ganti Kamera Depan / Belakang"
            className="p-1.5 rounded border border-workspace-outline bg-workspace text-workspace-muted hover:text-workspace-foreground disabled:opacity-40"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Viewfinder Screen */}
      <div className="relative aspect-[4/3] max-h-[460px] bg-black flex items-center justify-center overflow-hidden">
        {/* Flash Overlay */}
        <div
          className={`absolute inset-0 bg-white z-40 pointer-events-none transition-opacity duration-150 ${
            flashActive ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Big Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="text-8xl sm:text-9xl font-extrabold text-white font-mono drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] animate-bounce">
              {countdown === 0 ? 'SMILE!' : countdown}
            </div>
            <div className="mt-4 px-4 py-1.5 rounded-full bg-primary text-white font-mono text-xs uppercase tracking-widest font-semibold shadow-raised">
              Capturing Shot {currentShotIndex + 1} of {targetCount}
            </div>
          </div>
        )}

        {/* Video Element */}
        {isCameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
        ) : (
          /* Camera Inactive / Permission Denied Placeholder */
          <div className="p-8 text-center text-white/70 space-y-3 max-w-md">
            <Camera className="w-12 h-12 text-white/30 mx-auto" />
            <p className="text-xs text-white/60">
              {permissionError || 'Kamera sedang dinonaktifkan atau tidak tersedia.'}
            </p>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-primary hover:bg-primary-strong text-white text-xs font-semibold rounded shadow-raised transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Akses Kamera Lagi</span>
            </button>
          </div>
        )}

        {/* Multi-shot Progress Strip in Viewfinder */}
        {isCapturingSequence && (
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between bg-black/60 backdrop-blur-md px-3 py-2 rounded-md border border-white/10 text-white text-xs font-mono">
            <span>Rangkaian Foto:</span>
            <div className="flex gap-1.5">
              {Array.from({ length: targetCount }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-6 h-6 rounded flex items-center justify-center border text-[10px] font-bold ${
                    idx < tempCapturedList.length
                      ? 'bg-status-success border-status-success text-white'
                      : idx === currentShotIndex
                      ? 'bg-primary border-primary text-white animate-pulse'
                      : 'bg-white/10 border-white/20 text-white/40'
                  }`}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Shutter & Upload Actions */}
      <div className="p-4 bg-workspace-surface flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-workspace-outline">
        {/* Upload Fallback Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUploadFiles}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isCapturingSequence}
          className="w-full sm:w-auto px-4 py-2.5 rounded border border-workspace-outline bg-workspace-elevated hover:bg-workspace-soft text-workspace-foreground text-xs font-medium flex items-center justify-center space-x-2 transition-colors disabled:opacity-40"
        >
          <Upload className="w-4 h-4 text-primary" />
          <span>Upload Foto ({targetCount} Files)</span>
        </button>

        {/* Main Big Shutter Button */}
        <button
          onClick={startMultiShot}
          disabled={!isCameraActive || isCapturingSequence}
          className="w-full sm:w-auto flex-1 max-w-sm h-12 bg-primary hover:bg-primary-strong active:bg-primary-focus text-white font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center space-x-2 shadow-raised disabled:opacity-40 disabled:cursor-not-allowed group"
        >
          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span>
            {isCapturingSequence
              ? `Capturing ${currentShotIndex + 1}/${targetCount}...`
              : `Mulai Sesi Photobooth (${targetCount} Shots)`}
          </span>
        </button>
      </div>
    </div>
  );
};
