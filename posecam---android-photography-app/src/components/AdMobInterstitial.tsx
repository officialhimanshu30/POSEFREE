import React, { useEffect, useState } from 'react';
import { X, Sparkles, ExternalLink } from 'lucide-react';

interface AdMobInterstitialProps {
  isOpen: boolean;
  onClose: () => void;
  transitionReason?: string;
}

export const AdMobInterstitial: React.FC<AdMobInterstitialProps> = ({
  isOpen,
  onClose,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(5);
      setCanClose(false);
      return;
    }

    setSecondsRemaining(5);
    setCanClose(false);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="admob-interstitial-overlay"
      className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 text-white animate-in fade-in duration-200"
    >
      {/* Top Bar with Ad Badge and Close button */}
      <div className="w-full max-w-md flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-black text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider">
            Ad
          </span>
          <span className="text-xs text-neutral-400 font-medium">
            Google Mobile Ads
          </span>
        </div>

        {canClose ? (
          <button
            id="admob-interstitial-close-btn"
            onClick={onClose}
            className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold transition active:scale-95"
            aria-label="Close Ad"
          >
            <span>Close</span>
            <X size={14} />
          </button>
        ) : (
          <div className="bg-neutral-800/80 text-neutral-400 text-xs px-3 py-1.5 rounded-full font-mono flex items-center gap-1">
            <span>Skip in</span>
            <span className="text-white font-bold">{secondsRemaining}s</span>
          </div>
        )}
      </div>

      {/* Main Interstitial Creative Content (Simulating AdMob full screen interstitial) */}
      <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center my-6 text-center space-y-5 px-4">
        {/* Creative Graphic */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-sky-600 via-indigo-500 to-amber-500 p-0.5 shadow-2xl">
          <div className="w-full h-full bg-neutral-900 rounded-[22px] flex items-center justify-center">
            <Sparkles size={40} className="text-amber-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Studio Lens & Color Presets
          </h2>
          <p className="text-xs text-neutral-400 max-w-xs leading-relaxed mx-auto">
            Experience advanced mobile photography grading, portrait lighting adjustments, and background contrast enhancement.
          </p>
        </div>

        {/* CTA Button */}
        <a
          href="https://developers.google.com/admob/android/test-ads"
          target="_blank"
          rel="noreferrer"
          className="w-full py-3 bg-white text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-neutral-200 transition active:scale-[0.98] shadow-lg"
        >
          <span>Learn More</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Bottom Footer */}
      <div className="text-[11px] text-neutral-400 text-center pb-2">
        PoseCam • Pose Guide Photography
      </div>
    </div>
  );
};

