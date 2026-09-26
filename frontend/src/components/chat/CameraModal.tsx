import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, Upload, AlertCircle, Scan } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Data: string, mimeType: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

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
  }, []);

  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    stopStream();
    setErrorMsg(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
      setErrorMsg('Camera access is not supported on this browser or connection.');
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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasCamera(true);
    } catch (err: any) {
      console.warn('getUserMedia error, falling back:', err);
      // Try again with basic video constraints without facingMode requirement
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play();
        }
        setHasCamera(true);
      } catch (fallbackErr: any) {
        setHasCamera(false);
        setErrorMsg(
          fallbackErr.name === 'NotAllowedError'
            ? 'Camera permission was denied. Please allow camera access in your browser or upload an image below.'
            : 'Unable to start camera stream. You can capture or upload a photo directly using the button below.'
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
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsCapturing(true);

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64 = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
      onCapture(base64, 'image/jpeg');
      stopStream();
      onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
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
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-secondary/50 pt-safe">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                Camera Scan & Search
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Capture documents, math, handwritten notes, or objects
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[380px] bg-black flex items-center justify-center overflow-hidden">
          {errorMsg ? (
            <div className="p-6 text-center max-w-md space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
              <p className="text-sm text-foreground/90 leading-relaxed">{errorMsg}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-xs hover:opacity-90 shadow-md transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload Photo / Take with Mobile Camera
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

              {/* Viewfinder Target Overlays */}
              <div className="absolute inset-8 sm:inset-12 pointer-events-none border border-white/20 rounded-2xl flex flex-col justify-between p-3">
                {/* Top brackets */}
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-md" />
                  <div className="w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-md" />
                </div>

                {/* Center scan hint */}
                <div className="self-center flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white/90 text-xs font-mono">
                  <Scan className="w-3.5 h-3.5 text-primary animate-pulse" />
                  Align item inside frame
                </div>

                {/* Bottom brackets */}
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-md" />
                  <div className="w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-md" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Controls Footer */}
        <div className="p-4 bg-secondary/60 border-t border-border/50 flex items-center justify-between">
          {/* Fallback File/Mobile Photo button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground bg-secondary hover:bg-accent border border-border/60 transition-colors shadow-sm"
            title="Upload photo from disk or mobile gallery"
          >
            <Upload className="w-4 h-4 text-muted-foreground" />
            <span className="hidden sm:inline">Upload Photo</span>
          </button>

          {/* Central Shutter Capture Button */}
          <button
            type="button"
            onClick={handleCapture}
            disabled={!hasCamera || isCapturing}
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all shadow-lg ring-4 ring-primary/20"
            title="Capture & Scan Image"
          >
            <div className="w-10 h-10 rounded-full border-2 border-primary-foreground/90 flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary-foreground" />
            </div>
          </button>

          {/* Switch Camera (Front/Rear) */}
          <button
            type="button"
            onClick={toggleFacingMode}
            disabled={!hasCamera}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground bg-secondary hover:bg-accent border border-border/60 disabled:opacity-40 transition-colors shadow-sm"
            title="Switch front/rear camera"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
            <span className="hidden sm:inline">{facingMode === 'environment' ? 'Rear' : 'Front'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
