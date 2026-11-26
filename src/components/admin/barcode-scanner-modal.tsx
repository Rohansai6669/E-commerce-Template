'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Camera, X, RefreshCw, Zap, Volume2, VolumeX, Barcode, Check, Search } from 'lucide-react';
import { toast } from 'sonner';

interface BarcodeScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcodeValue: string) => void;
  title?: string;
  description?: string;
  placeholder?: string;
}

// Crisp beep sound using Web Audio API
function playScanBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5 tone
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Ignore audio permission restrictions
  }
}

export function BarcodeScannerModal({
  open,
  onOpenChange,
  onScan,
  title = 'Barcode & SKU Scanner',
  description = 'Scan item barcodes or enter SKU to verify and dispatch.',
  placeholder = 'Enter barcode or SKU...',
}: BarcodeScannerModalProps) {
  const [cameraActive, setCameraActive] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [manualCode, setManualCode] = React.useState('');
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [torchOn, setTorchOn] = React.useState(false);
  const [facingMode, setFacingMode] = React.useState<'environment' | 'user'>('environment');
  const [lastScanned, setLastScanned] = React.useState<string | null>(null);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const scanIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Focus input automatically when modal opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    } else {
      stopCamera();
      setManualCode('');
      setLastScanned(null);
    }
  }, [open]);

  // Hardware barcode scanner wedge listener (detects fast keystrokes ending in Enter)
  React.useEffect(() => {
    if (!open) return;

    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is actively typing in a standard input, let default typing happen
      if (e.target instanceof HTMLInputElement && e.target !== inputRef.current) {
        return;
      }

      const now = Date.now();
      if (now - lastKeyTime > 100) {
        buffer = ''; // Reset if gap between keys is too long for a barcode gun
      }
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          e.preventDefault();
          handleScannedCode(buffer.trim());
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, soundEnabled]);

  const handleScannedCode = React.useCallback(
    (code: string) => {
      const cleanCode = code.trim();
      if (!cleanCode) return;

      if (soundEnabled) {
        playScanBeep();
      }
      setLastScanned(cleanCode);
      onScan(cleanCode);
      toast.success(`Scanned: ${cleanCode}`);

      // Short vibration if on mobile device
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(60);
        } catch {}
      }
    },
    [onScan, soundEnabled]
  );

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        startBarcodeDetection();
      }
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setCameraError(err.message || 'Unable to access camera. Please allow camera permissions or type barcode manually.');
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  // Barcode Detection loop using BarcodeDetector API if available
  const startBarcodeDetection = () => {
    if (typeof window === 'undefined' || !(window as any).BarcodeDetector) {
      return;
    }

    try {
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'qr_code', 'upc_a', 'upc_e'],
      });

      let isDetecting = false;
      scanIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || isDetecting || !cameraActive) return;
        if (videoRef.current.readyState < 2) return;

        isDetecting = true;
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const firstBarcode = barcodes[0].rawValue;
            if (firstBarcode && firstBarcode !== lastScanned) {
              handleScannedCode(firstBarcode);
            }
          }
        } catch {
          // Ignore detection frame dropped
        } finally {
          isDetecting = false;
        }
      }, 250);
    } catch {
      // BarcodeDetector initialization fallback
    }
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch {
        toast.info('Flashlight is not supported by this device.');
      }
    }
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    setTimeout(() => {
      startCamera();
    }, 200);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScannedCode(manualCode.trim());
      setManualCode('');
      inputRef.current?.focus();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white border-slate-200 shadow-2xl">
        <DialogHeader className="p-5 border-b border-slate-100 bg-slate-50/70">
          <DialogTitle className="text-base font-extrabold text-slate-950 uppercase font-heading flex items-center gap-2">
            <Barcode className="w-5 h-5 text-slate-900" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-sans">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 flex flex-col gap-4">
          {/* Camera Viewport Container */}
          <div className="relative w-full aspect-video sm:aspect-4/3 bg-slate-950 rounded-lg overflow-hidden flex flex-col items-center justify-center border border-slate-800">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Laser scanline animation */}
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />

                {/* Corner Targeting Reticle */}
                <div className="absolute inset-8 pointer-events-none border border-white/20 rounded">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                </div>

                {/* Top overlay controls */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition cursor-pointer"
                    title="Toggle Flashlight"
                  >
                    <Zap className={`w-4 h-4 ${torchOn ? 'text-amber-400' : 'text-white'}`} />
                  </button>
                  <button
                    type="button"
                    onClick={switchCamera}
                    className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition cursor-pointer"
                    title="Switch Camera"
                  >
                    <RefreshCw className="w-4 h-4 text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSoundEnabled((prev) => !prev)}
                    className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition cursor-pointer"
                    title="Toggle Audio Beep"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>

                <div className="absolute bottom-3 inset-x-0 text-center">
                  <span className="bg-black/70 text-white text-[11px] font-mono px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
                    Align Barcode or SKU in box
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Camera Scanner Offline
                  </span>
                  <span className="text-[11px] text-slate-400 max-w-xs">
                    Use your device camera or connect a handheld USB/Bluetooth scanner gun.
                  </span>
                </div>

                {cameraError && (
                  <span className="text-[10px] text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-1 rounded max-w-xs">
                    {cameraError}
                  </span>
                )}

                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Start Camera</span>
                </button>
              </div>
            )}
          </div>

          {/* Last Scanned Chip */}
          {lastScanned && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between text-xs animate-in fade-in-50">
              <div className="flex items-center gap-2 text-emerald-900">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Last Scanned: <strong className="font-mono text-emerald-950">{lastScanned}</strong>
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>
          )}

          {/* Manual Input & Barcode Gun Target */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 transition uppercase"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded text-xs font-bold uppercase tracking-wider transition disabled:opacity-40 cursor-pointer"
            >
              Verify
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
            <span>Hardware scanner: scan anytime</span>
            {cameraActive && (
              <button
                type="button"
                onClick={stopCamera}
                className="text-slate-500 hover:text-slate-900 font-bold underline cursor-pointer"
              >
                Close Camera
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default BarcodeScannerModal;
