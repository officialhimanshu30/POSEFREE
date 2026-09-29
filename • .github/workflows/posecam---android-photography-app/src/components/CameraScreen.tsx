import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Camera,
  RefreshCw,
  Clock,
  Eye,
  EyeOff,
  Sliders,
  SlidersHorizontal,
  RotateCcw,
  RotateCw,
  Maximize2,
  Grid,
  Zap,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { PoseTemplate, TimerOption } from '../types';

interface CameraScreenProps {
  pose: PoseTemplate;
  onBack: () => void;
  onPhotoCaptured: (dataUrl: string, width: number, height: number) => void;
  onOpenGallery: () => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  pose,
  onBack,
  onPhotoCaptured,
  onOpenGallery,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Camera settings
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Pose overlay controls
  // Existing opacity slider: 20–80%, default 35%
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.35);
  const [overlayVisible, setOverlayVisible] = useState<boolean>(true);
  const [guideColor, setGuideColor] = useState<string>('#FFFFFF');
  const [showAdjustDrawer, setShowAdjustDrawer] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);

  // Real-time pose overlay transform state: drag (move), pinch (resize/zoom), 2-finger rotate
  const [transform, setTransform] = useState<{
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
  });

  // Reset transform to default when pose changes
  useEffect(() => {
    setTransform({ x: 0, y: 0, scale: 1, rotation: 0 });
  }, [pose.id]);

  const isCustomTransformed =
    Math.abs(transform.x) > 3 ||
    Math.abs(transform.y) > 3 ||
    Math.abs(transform.scale - 1) > 0.03 ||
    Math.abs(transform.rotation) > 2;

  const resetTransform = () => {
    setTransform({ x: 0, y: 0, scale: 1, rotation: 0 });
  };

  // Touch gesture handling refs: 1 finger drag, 2 fingers pinch & rotate
  const touchStartRef = useRef<{
    startX: number;
    startY: number;
    initialDist: number;
    initialScale: number;
    initialAngle: number;
    initialRotation: number;
    startMidX: number;
    startMidY: number;
  }>({
    startX: 0,
    startY: 0,
    initialDist: 0,
    initialScale: 1,
    initialAngle: 0,
    initialRotation: 0,
    startMidX: 0,
    startMidY: 0,
  });

  const isDraggingMouse = useRef<boolean>(false);
  const mouseStartRef = useRef<{ x: number; y: number; initialX: number; initialY: number }>({
    x: 0,
    y: 0,
    initialX: 0,
    initialY: 0,
  });

  // Touch gesture handling: 1 finger drag, 2 fingers pinch & rotate
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!overlayVisible) return;
    if (e.touches.length === 1) {
      touchStartRef.current.startX = e.touches[0].clientX - transform.x;
      touchStartRef.current.startY = e.touches[0].clientY - transform.y;
    } else if (e.touches.length >= 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const angle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;

      touchStartRef.current.initialDist = dist || 1;
      touchStartRef.current.initialScale = transform.scale;
      touchStartRef.current.initialAngle = angle;
      touchStartRef.current.initialRotation = transform.rotation;
      touchStartRef.current.startMidX = midX - transform.x;
      touchStartRef.current.startMidY = midY - transform.y;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!overlayVisible) return;
    if (e.touches.length === 1) {
      const newX = e.touches[0].clientX - touchStartRef.current.startX;
      const newY = e.touches[0].clientY - touchStartRef.current.startY;
      setTransform((prev) => ({ ...prev, x: newX, y: newY }));
    } else if (e.touches.length >= 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const angle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;

      // Pinch zoom
      const scaleFactor = dist / touchStartRef.current.initialDist;
      const newScale = Math.min(3.0, Math.max(0.4, touchStartRef.current.initialScale * scaleFactor));

      // Two-finger rotate
      const angleDiff = angle - touchStartRef.current.initialAngle;
      const newRotation = touchStartRef.current.initialRotation + angleDiff;

      // Move with midpoint
      const newX = midX - touchStartRef.current.startMidX;
      const newY = midY - touchStartRef.current.startMidY;

      setTransform({
        x: newX,
        y: newY,
        scale: newScale,
        rotation: newRotation,
      });
    }
  };

  // Mouse gestures for desktop testing
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !overlayVisible) return;
    isDraggingMouse.current = true;
    mouseStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: transform.x,
      initialY: transform.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingMouse.current || !overlayVisible) return;
    const dx = e.clientX - mouseStartRef.current.x;
    const dy = e.clientY - mouseStartRef.current.y;
    setTransform((prev) => ({
      ...prev,
      x: mouseStartRef.current.initialX + dx,
      y: mouseStartRef.current.initialY + dy,
    }));
  };

  const handleMouseUp = () => {
    isDraggingMouse.current = false;
  };

  // Mouse wheel to zoom pose overlay on desktop
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!overlayVisible) return;
    const factor = e.deltaY < 0 ? 1.06 : 0.94;
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(3.0, Math.max(0.4, prev.scale * factor)),
    }));
  };

  // Timer controls
  const [timerDuration, setTimerDuration] = useState<TimerOption>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [shutterFlash, setShutterFlash] = useState<boolean>(false);

  // Beep sound generator using Web Audio API for timer feedback
  const playBeep = (freq = 800, duration = 0.1) => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext might be blocked until user gesture, safe to ignore
    }
  };

  // Start Camera Stream
  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      setPermissionError(null);

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasPermission(true);
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      const message = err instanceof Error ? err.message : 'Camera access denied';
      setPermissionError(message);
      setHasPermission(false);
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode, startCamera]);

  // Flip Camera (Front / Back)
  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
  };

  // Cycle Timer: Off -> 3s -> 5s -> Off
  const cycleTimer = () => {
    if (timerDuration === 0) setTimerDuration(3);
    else if (timerDuration === 3) setTimerDuration(5);
    else setTimerDuration(0);
  };

  // Actual Photo Capture function
  // CRITICAL REQUIREMENT: "The pose overlay is only a visual guide. It must NOT modify the captured image."
  const captureRawPhoto = () => {
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 120);
    playBeep(1200, 0.2);

    const video = videoRef.current;
    if (!video || !hasPermission) {
      // Fallback capture simulation for preview environments without hardware camera
      simulatePhotoCapture();
      return;
    }

    try {
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;

      // Offscreen canvas solely containing the optical camera feed
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // If front camera, mirror horizontally just like selfie camera preview
      if (facingMode === 'user') {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      onPhotoCaptured(dataUrl, width, height);
    } catch (e) {
      console.error('Failed to capture canvas frame', e);
      simulatePhotoCapture();
    }
  };

  // Fallback simulator if browser camera is not physically connected or permission denied
  const simulatePhotoCapture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1440;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw realistic portrait backdrop
    const grad = ctx.createLinearGradient(0, 0, 0, 1440);
    grad.addColorStop(0, '#2b3542');
    grad.addColorStop(0.5, '#1e242c');
    grad.addColorStop(1, '#111418');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1440);

    // Warm ambient background sunlight
    const sunGrad = ctx.createRadialGradient(850, 250, 50, 850, 250, 450);
    sunGrad.addColorStop(0, 'rgba(255, 200, 100, 0.4)');
    sunGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, 1080, 1440);

    // Simulated person silhouette / subject representing the user
    ctx.fillStyle = '#1c1f24';
    ctx.beginPath();
    ctx.arc(540, 450, 180, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22272e';
    ctx.beginPath();
    ctx.moveTo(220, 1440);
    ctx.quadraticCurveTo(320, 750, 540, 750);
    ctx.quadraticCurveTo(760, 750, 860, 1440);
    ctx.closePath();
    ctx.fill();

    // Subtle skin/clothing accent
    ctx.fillStyle = '#c89578';
    ctx.beginPath();
    ctx.arc(540, 470, 120, 0, Math.PI * 2);
    ctx.fill();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    onPhotoCaptured(dataUrl, 1080, 1440);
  };

  // Trigger Capture or start Timer countdown
  const handleShutterClick = () => {
    if (isCapturing) return;

    if (timerDuration > 0) {
      setIsCapturing(true);
      setCountdown(timerDuration);
      playBeep(600, 0.1);

      let currentSec = timerDuration;
      const interval = setInterval(() => {
        currentSec -= 1;
        if (currentSec > 0) {
          setCountdown(currentSec);
          playBeep(600, 0.1);
        } else {
          clearInterval(interval);
          setCountdown(null);
          setIsCapturing(false);
          captureRawPhoto();
        }
      }, 1000);
    } else {
      captureRawPhoto();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-black text-white relative overflow-hidden select-none">
      {/* Top Camera Controls Bar */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 active:scale-95 transition"
          aria-label="Back to home"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Selected Pose Pill */}
        <button
          onClick={onOpenGallery}
          className="flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 px-3 py-1.5 rounded-full text-xs text-neutral-200 hover:border-neutral-500 transition active:scale-95"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-semibold truncate max-w-[120px]">{pose.name}</span>
          <span className="text-[10px] text-neutral-400">Change</span>
        </button>

        {/* Top Control Icons (Timer & Grid) */}
        <div className="flex items-center gap-2">
          {/* Timer Button */}
          <button
            id="camera-timer-btn"
            onClick={cycleTimer}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition active:scale-95 ${
              timerDuration > 0
                ? 'bg-amber-400 text-black shadow-md'
                : 'bg-black/50 backdrop-blur-md text-white hover:bg-black/70'
            }`}
            title="Self Timer (Off / 3s / 5s)"
          >
            {timerDuration === 0 ? <Clock size={18} /> : `${timerDuration}s`}
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition active:scale-95 ${
              showGrid
                ? 'bg-white text-black'
                : 'bg-black/50 backdrop-blur-md text-white hover:bg-black/70'
            }`}
            title="Rule of Thirds Grid"
          >
            <Grid size={18} />
          </button>
        </div>
      </div>

      {/* Camera Viewport Area */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden bg-neutral-950 touch-none select-none cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Live Camera Video Feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover pointer-events-none ${
            facingMode === 'user' ? '-scale-x-100' : ''
          }`}
        />

        {/* Permission Denied / Fallback Message */}
        {hasPermission === false && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-neutral-950/90 backdrop-blur-md space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">Camera Notice</h3>
              <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                {permissionError || 'Camera stream is unavailable in this environment.'}
              </p>
              <p className="text-[11px] text-amber-300 pt-1">
                You can still test pose overlay positioning, timers, and capture below!
              </p>
            </div>
            <button
              onClick={() => startCamera(facingMode)}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            >
              <RefreshCw size={14} />
              <span>Retry Camera</span>
            </button>
          </div>
        )}

        {/* Rule of Thirds Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3 border border-white/20">
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-r border-b border-white/20" />
            <div className="border-b border-white/20" />
            <div className="border-r border-white/20" />
            <div className="border-r border-white/20" />
            <div />
          </div>
        )}

        {/* ========================================================================= */}
        {/* SEMI-TRANSPARENT POSE OVERLAY GUIDE                                       */}
        {/* Real-time adjustable: Drag = move, Pinch = resize/zoom, Rotate = 2 fingers */}
        {/* The overlay is ONLY a visual guide and NEVER affects the captured photo.  */}
        {/* ========================================================================= */}
        {overlayVisible && (
          <div
            id="pose-guide-overlay-layer"
            className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center transition-opacity duration-150 overflow-hidden"
            style={{ opacity: overlayOpacity }}
          >
            <div
              className="w-full h-full flex items-center justify-center will-change-transform"
              style={{
                transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
                transformOrigin: 'center center',
              }}
            >
              {pose.imageUrl ? (
                <img
                  src={pose.imageUrl}
                  alt={pose.name}
                  className="w-full h-full max-h-[85vh] object-contain select-none pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                />
              ) : (
                <svg
                  viewBox={pose.viewBox || '0 0 200 400'}
                  className="w-full h-full max-h-[85vh] p-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                  style={{ color: guideColor }}
                  dangerouslySetInnerHTML={{ __html: pose.svgPath }}
                />
              )}
            </div>
          </div>
        )}

        {/* Floating Quick Reset Pose Button */}
        {isCustomTransformed && overlayVisible && (
          <button
            id="btn-quick-reset-pose"
            onClick={resetTransform}
            className="absolute top-16 left-4 z-30 bg-neutral-900/90 hover:bg-neutral-800 backdrop-blur-md border border-neutral-700/80 text-neutral-200 hover:text-white px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition shadow-lg active:scale-95 cursor-pointer"
            title="Reset pose position, size and rotation"
          >
            <RotateCcw size={12} className="text-amber-400" />
            <span>Reset Pose</span>
          </button>
        )}

        {/* Large Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none">
            <div className="text-8xl font-black text-amber-400 animate-ping duration-1000 drop-shadow-2xl">
              {countdown}
            </div>
          </div>
        )}

        {/* Shutter Flash Animation */}
        {shutterFlash && (
          <div className="absolute inset-0 z-50 bg-white pointer-events-none animate-out fade-out duration-150" />
        )}

        {/* Pose Adjustment & Opacity Drawer */}
        {showAdjustDrawer && (
          <div className="absolute bottom-28 inset-x-4 sm:inset-x-6 z-30 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700 rounded-3xl p-4 shadow-2xl space-y-3 animate-in slide-in-from-bottom-3 duration-200">
            {/* Header: Title & Reset Button */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-amber-400" />
                <span className="font-bold text-xs text-white">Adjust Pose Guide</span>
              </div>
              <button
                id="btn-reset-pose-transform"
                onClick={resetTransform}
                disabled={!isCustomTransformed}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl font-semibold transition active:scale-95 ${
                  isCustomTransformed
                    ? 'bg-neutral-800 hover:bg-neutral-750 text-amber-300 border border-amber-500/30 shadow-sm cursor-pointer'
                    : 'text-neutral-500 opacity-40 cursor-not-allowed'
                }`}
                title="Reset position, scale, and rotation to default"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* Gesture Tip */}
            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl px-2.5 py-1.5 text-[10px] text-neutral-400 flex items-center justify-between">
              <span>Drag to move • Pinch to zoom • 2-finger rotate</span>
              {isCustomTransformed && (
                <span className="text-amber-400 font-mono text-[9px] font-bold uppercase tracking-wider">
                  Adjusted
                </span>
              )}
            </div>

            {/* 1. Existing Opacity Slider: 20–80%, default 35% */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <Sliders size={13} className="text-neutral-400" />
                  <span>Guide Opacity (20%–80%)</span>
                </span>
                <span className="font-mono text-amber-400 font-bold">
                  {Math.round(overlayOpacity * 100)}%
                </span>
              </div>
              <input
                id="slider-guide-opacity"
                type="range"
                min="0.2"
                max="0.8"
                step="0.05"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* 2. Size / Zoom Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <Maximize2 size={13} className="text-neutral-400" />
                  <span>Size / Zoom</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTransform((prev) => ({ ...prev, scale: Math.max(0.4, prev.scale - 0.1) }))}
                    className="w-5 h-5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 text-xs flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-amber-400 font-bold min-w-[36px] text-right">
                    {Math.round(transform.scale * 100)}%
                  </span>
                  <button
                    onClick={() => setTransform((prev) => ({ ...prev, scale: Math.min(2.5, prev.scale + 0.1) }))}
                    className="w-5 h-5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 text-xs flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                id="slider-guide-size"
                type="range"
                min="0.4"
                max="2.5"
                step="0.05"
                value={transform.scale}
                onChange={(e) =>
                  setTransform((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))
                }
                className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* 3. Rotation Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <RotateCw size={13} className="text-neutral-400" />
                  <span>Rotation</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTransform((prev) => ({ ...prev, rotation: (prev.rotation - 15) % 360 }))}
                    className="px-1.5 h-5 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] text-neutral-300 font-mono"
                  >
                    -15°
                  </button>
                  <span className="font-mono text-amber-400 font-bold min-w-[36px] text-right">
                    {Math.round(transform.rotation)}°
                  </span>
                  <button
                    onClick={() => setTransform((prev) => ({ ...prev, rotation: (prev.rotation + 15) % 360 }))}
                    className="px-1.5 h-5 bg-neutral-800 hover:bg-neutral-700 rounded text-[10px] text-neutral-300 font-mono"
                  >
                    +15°
                  </button>
                </div>
              </div>
              <input
                id="slider-guide-rotation"
                type="range"
                min="-180"
                max="180"
                step="2"
                value={Math.round(transform.rotation)}
                onChange={(e) =>
                  setTransform((prev) => ({ ...prev, rotation: parseInt(e.target.value) }))
                }
                className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Color Tint Choices for Contrast */}
            <div className="flex items-center justify-between pt-1 border-t border-neutral-800">
              <span className="text-[11px] text-neutral-400">Guide Color:</span>
              <div className="flex items-center gap-2">
                {[
                  { label: 'White', color: '#FFFFFF' },
                  { label: 'Neon Yellow', color: '#FACC15' },
                  { label: 'Cyan', color: '#38BDF8' },
                  { label: 'Coral', color: '#F43F5E' },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setGuideColor(c.color)}
                    style={{ backgroundColor: c.color }}
                    className={`w-5 h-5 rounded-full transition ${
                      guideColor === c.color ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-70'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Camera Action Bar */}
      <div className="h-28 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-around px-4 z-30">
        {/* Toggle Overlay Visibility */}
        <button
          id="btn-toggle-overlay-visibility"
          onClick={() => setOverlayVisible(!overlayVisible)}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition active:scale-95 ${
            overlayVisible
              ? 'bg-neutral-800 text-amber-400 border border-neutral-700'
              : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
          }`}
          title={overlayVisible ? 'Hide Pose Guide' : 'Show Pose Guide'}
        >
          {overlayVisible ? <Eye size={19} /> : <EyeOff size={19} />}
        </button>

        {/* Small "Adjust" control/button */}
        <button
          id="btn-adjust-pose"
          onClick={() => setShowAdjustDrawer(!showAdjustDrawer)}
          className={`h-11 px-3 rounded-full flex items-center gap-1.5 transition active:scale-95 text-xs font-semibold ${
            showAdjustDrawer || isCustomTransformed
              ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
              : 'bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-750'
          }`}
          title="Adjust Pose (Drag to move, Pinch to zoom, Rotate)"
        >
          <SlidersHorizontal size={15} />
          <span>Adjust</span>
        </button>

        {/* Capture Shutter Button */}
        <div className="relative">
          <button
            id="camera-shutter-btn"
            onClick={handleShutterClick}
            disabled={isCapturing}
            className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 shadow-2xl active:scale-90 transition group cursor-pointer disabled:opacity-50"
            aria-label="Capture Photo"
          >
            <div className="w-full h-full rounded-full bg-white group-hover:bg-neutral-200 transition" />
          </button>
        </div>

        {/* Opacity / Settings Drawer Toggle */}
        <button
          id="btn-opacity-slider"
          onClick={() => setShowAdjustDrawer(!showAdjustDrawer)}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition active:scale-95 ${
            showAdjustDrawer
              ? 'bg-white text-black'
              : 'bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-750'
          }`}
          title="Adjust Guide Opacity"
        >
          <Sliders size={19} />
        </button>

        {/* Flip Camera (Front / Rear) */}
        <button
          id="camera-flip-btn"
          onClick={toggleCameraFacing}
          className="w-11 h-11 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white hover:bg-neutral-700 active:scale-95 transition"
          title="Switch Front/Rear Camera"
        >
          <RefreshCw size={19} />
        </button>
      </div>
    </div>
  );
};
