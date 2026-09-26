import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, Upload, AlertCircle, Scan, Check } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Data: string, mimeType: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setHasCamera(false);
  }, []);

  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    stopStream();
    setErrorMsg(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Camera access is not supported by your browser or connection. Please upload an image below.');
      return;
    }

    const isPortrait = window.innerHeight > window.innerWidth;
    const idealWidth = isPortrait ? 1080 : 1920;
    const idealHeight = isPortrait ? 1920 : 1080;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: idealWidth },
          height: { ideal: idealHeight },
        },
        audio: false,
      });

      streamRef.current = stream;
      setHasCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play().catch((err) => {
          console.warn('Autoplay notice (safe to ignore):', err);
        });
      }
    } catch (err: any) {
      console.warn('Primary camera stream error, attempting fallback:', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        setHasCamera(true);

        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.muted = true;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play().catch((e) => console.warn('Fallback play notice:', e));
        }
      } catch (fallbackErr: any) {
        setHasCamera(false);
        setErrorMsg(
          fallbackErr.name === 'NotAllowedError'
            ? 'Camera permission was denied. Please allow camera permissions in your browser or use the button below to take a photo.'
            : 'Camera could not be started directly. Tap below to capture with your device camera.'
        );
      }
    }
  }, [stopStream]);

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, startCamera, stopStream]);

  const handleCapture = () => {
    if (isCapturing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Trigger visual camera shutter flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    if (!video || !canvas) {
      // If video ref is missing, trigger native file/camera input
      fileInputRef.current?.click();
      return;
    }

    setIsCapturing(true);

    try {
      const width = video.videoWidth > 0 ? video.videoWidth : (video.clientWidth || 1280);
      const height = video.videoHeight > 0 ? video.videoHeight : (video.clientHeight || 720);
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        const base64 = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');

        setTimeout(() => {
          onCapture(base64, 'image/jpeg');
          stopStream();
          onClose();
          setIsCapturing(false);
        }, 150);
        return;
      }
    } catch (e) {
      console.error('Snapshot capture error:', e);
      fileInputRef.current?.click();
    }
    setIsCapturing(false);
  };

  const handleFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.replace(/^data:image\/[a-z]+;base64,/, '');
      onCapture(base64, file.type || 'image/jpeg');
      stopStream();
      onClose();
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      {/* Hidden canvas for snapshot rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden native camera/file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileFallback}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      <div className="relative w-full h-[100dvh] sm:h-auto sm:max-w-xl bg-card border-0 sm:border border-white/10 rounded-none sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[100dvh] sm:max-h-[90vh]">
        {/* Shutter White Flash Feedback */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-150 opacity-90" />
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-secondary/70 backdrop-blur-md z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                Camera Scan & Search
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Point at math, text, diagrams, or objects
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            title="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area (Tapping anywhere on video also triggers capture) */}
        <div
          onClick={handleCapture}
          className="relative flex-1 min-h-[320px] sm:min-h-[400px] bg-black flex items-center justify-center overflow-hidden cursor-pointer group"
          title="Click or tap anywhere to capture photo"
        >
          {errorMsg ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="p-6 text-center max-w-md space-y-4 cursor-default"
            >
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
              <p className="text-sm text-foreground/90 leading-relaxed">{errorMsg}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Open Device Camera / Upload Photo
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Reticle Framing Overlays */}
              <div className="absolute inset-8 sm:inset-12 pointer-events-none border border-white/20 rounded-2xl flex flex-col justify-between p-3.5">
                {/* Top brackets */}
                <div className="flex justify-between">
                  <div className="w-7 h-7 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg shadow-sm" />
                  <div className="w-7 h-7 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg shadow-sm" />
                </div>

                {/* Center scan hint banner */}
                <div className="self-center flex items-center gap-2 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-white text-xs font-mono shadow-md">
                  <Scan className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Tap screen or click button to capture</span>
                </div>

                {/* Bottom brackets */}
                <div className="flex justify-between">
                  <div className="w-7 h-7 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg shadow-sm" />
                  <div className="w-7 h-7 border-b-2 border-r-2 border-cyan-400 rounded-br-lg shadow-sm" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Controls Footer with Unmistakable Capture Button */}
        <div className="p-4 bg-secondary/80 border-t border-white/10 flex items-center justify-between gap-2 z-20">
          {/* Switch Camera (Front/Rear) */}
          <button
            type="button"
            onClick={toggleFacingMode}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-foreground bg-secondary hover:bg-accent border border-white/10 transition-colors shadow-xs cursor-pointer active:scale-95"
            title="Switch front/rear camera"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">{facingMode === 'environment' ? 'Rear' : 'Front'}</span>
          </button>

          {/* Large Unmistakable Shutter Capture Button */}
          <button
            type="button"
            onClick={handleCapture}
            className="flex-1 max-w-xs mx-auto py-3.5 px-6 rounded-full bg-white hover:bg-white/95 text-black font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all ring-4 ring-cyan-400/40 cursor-pointer"
            title="Click here to capture image"
          >
            <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-white shrink-0">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
            <span>CLICK TO CAPTURE</span>
          </button>

          {/* Upload / Native Mobile Camera Fallback button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-foreground bg-secondary hover:bg-accent border border-white/10 transition-colors shadow-xs cursor-pointer active:scale-95"
            title="Upload photo from disk or phone camera"
          >
            <Upload className="w-4 h-4 text-muted-foreground" />
            <span className="hidden sm:inline">Upload</span>
          </button>
        </div>
      </div>
    </div>
  );
};
