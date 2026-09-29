import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Check,
  Sun,
  Sliders,
  Eye,
  RotateCcw,
  Zap,
  Split,
  ChevronsLeftRight,
} from 'lucide-react';
import { EnhanceSettings } from '../types';
import { backgroundEnhancer } from '../services/imageEnhancer';

interface BackgroundEnhancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawImageSrc: string;
  onApply: (enhancedDataUrl: string) => void;
}

const DEFAULT_SETTINGS: EnhanceSettings = {
  exposure: 15,
  warmth: 20,
  blur: 8,
  saturation: 15,
  vignette: 25,
};

export const BackgroundEnhancerModal: React.FC<BackgroundEnhancerModalProps> = ({
  isOpen,
  onClose,
  rawImageSrc,
  onApply,
}) => {
  const [settings, setSettings] = useState<EnhanceSettings>(DEFAULT_SETTINGS);
  const [enhancedPreviewUrl, setEnhancedPreviewUrl] = useState<string>(rawImageSrc);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'adjust' | 'presets'>('adjust');

  // Before / After split slider position (0 to 100%)
  const [splitPos, setSplitPos] = useState<number>(50);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingSplit = useRef<boolean>(false);

  // Re-run background enhancement when settings change (debounced)
  useEffect(() => {
    if (!isOpen || !rawImageSrc) return;

    let isMounted = true;
    setIsProcessing(true);
    setProgress(10);

    const timer = setTimeout(async () => {
      try {
        const result = await backgroundEnhancer.enhance(rawImageSrc, settings, (p) => {
          if (isMounted) setProgress(p);
        });
        if (isMounted) {
          setEnhancedPreviewUrl(result);
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Enhancement error:', err);
        if (isMounted) setIsProcessing(false);
      }
    }, 180);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, rawImageSrc, settings]);

  if (!isOpen) return null;

  // Split slider drag handling
  const handleSplitMove = (clientX: number) => {
    if (!splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percent = Math.round((x / rect.width) * 100);
    setSplitPos(percent);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleSplitMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSplit.current) {
      handleSplitMove(e.clientX);
    }
  };

  const handleApply = () => {
    onApply(enhancedPreviewUrl);
  };

  const applyPreset = (preset: Partial<EnhanceSettings>) => {
    setSettings((prev) => ({ ...prev, ...preset }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col text-white select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1 text-neutral-400 hover:text-white rounded-lg transition"
            aria-label="Cancel"
          >
            <X size={20} />
          </button>
          <div>
            <h2 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span>Enhance Background</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                Preserves Subject
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Improves background lighting & color; keeps person untouched
            </p>
          </div>
        </div>

        {/* Apply & Save Button */}
        <button
          id="btn-apply-enhancement"
          onClick={handleApply}
          disabled={isProcessing}
          className="flex items-center gap-1.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-md active:scale-95 disabled:opacity-50"
        >
          <Check size={14} strokeWidth={3} />
          <span>Apply</span>
        </button>
      </div>

      {/* Main Interactive Before / After Split Preview Canvas */}
      <div className="flex-1 relative bg-neutral-950 flex items-center justify-center p-2 overflow-hidden">
        <div
          ref={splitContainerRef}
          onMouseDown={() => (isDraggingSplit.current = true)}
          onMouseUp={() => (isDraggingSplit.current = false)}
          onMouseLeave={() => (isDraggingSplit.current = false)}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative max-w-sm w-full h-[52vh] rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 cursor-ew-resize select-none"
        >
          {/* Enhanced Image (Base / Right side) */}
          <img
            src={enhancedPreviewUrl}
            alt="Enhanced"
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />

          {/* Original "Before" Image (Clipped to left side of split slider) */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden bg-black"
            style={{ width: `${splitPos}%` }}
          >
            <img
              src={rawImageSrc}
              alt="Original Before"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              style={{
                width: splitContainerRef.current?.clientWidth || '100%',
                maxWidth: 'none',
              }}
            />
          </div>

          {/* Draggable Vertical Split Line */}
          <div
            className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
            style={{ left: `${splitPos}%` }}
          >
            {/* Center Handle Badge */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black shadow-lg flex items-center justify-center pointer-events-auto cursor-ew-resize">
              <ChevronsLeftRight size={16} />
            </div>
          </div>

          {/* "Before" & "After" Badges */}
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-neutral-300 pointer-events-none">
            Original Before
          </div>
          <div className="absolute top-3 right-3 bg-amber-500/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-black pointer-events-none">
            Enhanced Background
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-amber-300 flex items-center gap-2 border border-neutral-700 pointer-events-none">
              <Sparkles size={12} className="animate-spin" />
              <span>Refining background... ({progress}%)</span>
            </div>
          )}
        </div>
      </div>

      {/* Enhancement Controls Panel */}
      <div className="bg-neutral-900 border-t border-neutral-800 p-4 space-y-3">
        {/* Navigation Tabs (Sliders vs One-Click Presets) */}
        <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('adjust')}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition ${
                activeTab === 'adjust'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Custom Sliders
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition ${
                activeTab === 'presets'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Aesthetic Presets
            </button>
          </div>

          <button
            onClick={() => setSettings(DEFAULT_SETTINGS)}
            className="text-[11px] text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        </div>

        {/* Tab 1: Manual Sliders */}
        {activeTab === 'adjust' ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
            {/* Background Exposure */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-neutral-300">
                <span>Bg Lighting (Exposure)</span>
                <span className="font-mono text-amber-400">
                  {settings.exposure > 0 ? `+${settings.exposure}` : settings.exposure}
                </span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                value={settings.exposure}
                onChange={(e) =>
                  setSettings({ ...settings, exposure: parseInt(e.target.value) })
                }
                className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Background Warmth */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-neutral-300">
                <span>Color Warmth</span>
                <span className="font-mono text-amber-400">
                  {settings.warmth > 0 ? `+${settings.warmth}` : settings.warmth}
                </span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                value={settings.warmth}
                onChange={(e) =>
                  setSettings({ ...settings, warmth: parseInt(e.target.value) })
                }
                className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Depth Blur (Bokeh) */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-neutral-300">
                <span>Depth Blur (Bokeh)</span>
                <span className="font-mono text-amber-400">{settings.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                value={settings.blur}
                onChange={(e) =>
                  setSettings({ ...settings, blur: parseInt(e.target.value) })
                }
                className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Background Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-neutral-300">
                <span>Bg Saturation</span>
                <span className="font-mono text-amber-400">
                  {settings.saturation > 0 ? `+${settings.saturation}` : settings.saturation}
                </span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                value={settings.saturation}
                onChange={(e) =>
                  setSettings({ ...settings, saturation: parseInt(e.target.value) })
                }
                className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        ) : (
          /* Tab 2: Quick Aesthetic Presets */
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              {
                title: 'Golden Hour',
                settings: { exposure: 20, warmth: 30, blur: 10, saturation: 20, vignette: 25 },
              },
              {
                title: 'Cinematic',
                settings: { exposure: -10, warmth: -25, blur: 12, saturation: -10, vignette: 40 },
              },
              {
                title: 'Studio Soft',
                settings: { exposure: 15, warmth: 5, blur: 18, saturation: 5, vignette: 10 },
              },
              {
                title: 'Vibrant Pop',
                settings: { exposure: 10, warmth: 15, blur: 6, saturation: 35, vignette: 20 },
              },
            ].map((p) => (
              <button
                key={p.title}
                onClick={() => applyPreset(p.settings)}
                className="p-2 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 rounded-xl text-center transition active:scale-95"
              >
                <div className="text-[11px] font-bold text-neutral-200">{p.title}</div>
                <div className="text-[9px] text-neutral-400 mt-0.5">Quick Tune</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
