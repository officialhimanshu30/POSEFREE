import React from 'react';
import { ExternalLink } from 'lucide-react';

export const AdMobBanner: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Banner Container matching standard 320x50 / adaptive mobile banner */}
      <div
        id="admob-banner-container"
        className="w-full max-w-[360px] h-[52px] bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1 flex items-center justify-between text-xs text-neutral-300 shadow-sm relative overflow-hidden"
      >
        {/* AdMob Banner Creative */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Ad
              </span>
              <span className="font-semibold text-neutral-200 text-xs truncate max-w-[150px]">
                Google Mobile Ads
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 truncate">
              Test Advertisement
            </span>
          </div>
        </div>

        {/* Action Link */}
        <a
          href="https://developers.google.com/admob/android/test-ads"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition active:scale-95"
        >
          <span>Visit</span>
          <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
};

