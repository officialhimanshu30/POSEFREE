import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Download,
  Share2,
  Check,
  ArrowLeft,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { BackgroundEnhancerModal } from './BackgroundEnhancerModal';
import { photoStorage } from '../services/storage';
import { adMobManager } from '../services/adMobConfig';
import { PhotoRecord } from '../types';

interface PhotoResultScreenProps {
  photoDataUrl: string;
  photoWidth: number;
  photoHeight: number;
  poseName?: string;
  poseId?: string;
  onRetake: () => void;
  onHome: () => void;
  onTriggerInterstitial: (reason: string) => void;
}

export const PhotoResultScreen: React.FC<PhotoResultScreenProps> = ({
  photoDataUrl,
  photoWidth,
  photoHeight,
  poseName,
  poseId,
  onRetake,
  onHome,
  onTriggerInterstitial,
}) => {
  const [currentImage, setCurrentImage] = useState<string>(photoDataUrl);
  const [isEnhanced, setIsEnhanced] = useState<boolean>(false);
  const [showEnhancerModal, setShowEnhancerModal] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Save photo locally to IndexedDB & Trigger file download
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const photoRecord: PhotoRecord = {
        id: 'photo_' + Date.now(),
        dataUrl: currentImage,
        timestamp: Date.now(),
        poseId,
        poseName: poseName || 'Standard Shot',
        enhanced: isEnhanced,
        width: photoWidth,
        height: photoHeight,
      };

      // 1. Save to local device storage (IndexedDB)
      await photoStorage.savePhoto(photoRecord);

      // 2. Download file to local storage system
      const link = document.createElement('a');
      link.href = currentImage;
      link.download = `PoseCam_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSavedSuccess(true);
      setIsSaving(false);

      // Trigger natural AdMob interstitial transition
      if (adMobManager.shouldShowInterstitial()) {
        onTriggerInterstitial('Photo Saved to Local Storage');
      }
    } catch (err) {
      console.error('Failed to save photo', err);
      setIsSaving(false);
    }
  };

  // Share photo using Web Share API or copy
  const handleShare = async () => {
    try {
      if (navigator.share) {
        // Convert dataUrl to blob
        const res = await fetch(currentImage);
        const blob = await res.blob();
        const file = new File([blob], 'PoseCam_Photo.jpg', { type: 'image/jpeg' });

        await navigator.share({
          title: 'My PoseCam Photo',
          text: `Captured with PoseCam (${poseName || 'Pose Guide'})!`,
          files: [file],
        });
      } else {
        // Fallback: copy dataUrl link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setShareToast('Link copied to clipboard!');
        setTimeout(() => setShareToast(null), 2500);
      }
    } catch {
      // User cancelled share or not supported
      setShareToast('Share completed');
      setTimeout(() => setShareToast(null), 2000);
    }
  };

  // Called when background enhancement is applied from the modal
  const handleApplyEnhancement = (enhancedUrl: string) => {
    setCurrentImage(enhancedUrl);
    setIsEnhanced(true);
    setShowEnhancerModal(false);

    // Natural transition: Interstitial Ad after completing photo editing/enhancement
    if (adMobManager.shouldShowInterstitial()) {
      onTriggerInterstitial('Background Enhancement Applied');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-950 text-white select-none overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-neutral-850 flex items-center justify-between">
        <button
          onClick={onHome}
          className="flex items-center gap-1.5 text-neutral-400 hover:text-white text-xs font-semibold p-1 -ml-1 transition"
        >
          <ArrowLeft size={18} />
          <span>Home</span>
        </button>

        <div className="text-center">
          <h2 className="text-sm font-bold text-white">Photo Preview</h2>
          <span className="text-[10px] text-neutral-400">
            {isEnhanced ? 'Enhanced Background' : 'Raw Capture'}
          </span>
        </div>

        <div className="w-12" /> {/* balance spacing */}
      </div>

      {/* Main Captured Photo Display */}
      <div className="flex-1 relative bg-black flex items-center justify-center p-3 overflow-hidden">
        <div className="relative max-w-sm w-full h-[58vh] rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 flex items-center justify-center bg-neutral-950">
          <img
            src={currentImage}
            alt="Captured Result"
            className="w-full h-full object-contain"
          />

          {/* Enhancement Badge */}
          {isEnhanced && (
            <div className="absolute top-3 right-3 bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <Sparkles size={11} />
              <span>Background Enhanced</span>
            </div>
          )}

          {/* Pose Tag */}
          {poseName && (
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md border border-neutral-700/60 text-neutral-300 text-[10px] px-2.5 py-1 rounded-lg">
              Pose: {poseName}
            </div>
          )}
        </div>

        {/* Share / Saved Toast */}
        {shareToast && (
          <div className="absolute top-6 bg-neutral-800/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-medium border border-neutral-700 shadow-xl animate-in fade-in duration-150">
            {shareToast}
          </div>
        )}
      </div>

      {/* Action Buttons Bar: Retake, Enhance Background, Save, Share */}
      <div className="bg-neutral-900 border-t border-neutral-800 p-4 space-y-2.5">
        {/* Primary Row: Enhance Background + Save */}
        <div className="grid grid-cols-2 gap-3">
          {/* Enhance Background Button */}
          <button
            id="btn-enhance-background"
            onClick={() => setShowEnhancerModal(true)}
            className="h-13 bg-neutral-800 hover:bg-neutral-750 active:scale-[0.98] border border-neutral-700 rounded-2xl flex items-center justify-center gap-2 text-neutral-100 font-semibold text-xs transition"
          >
            <Sparkles size={16} className="text-amber-400" />
            <span>Enhance Background</span>
          </button>

          {/* Save Button */}
          <button
            id="btn-save-photo"
            onClick={handleSave}
            disabled={isSaving}
            className={`h-13 active:scale-[0.98] rounded-2xl flex items-center justify-center gap-2 font-bold text-xs transition shadow-md ${
              savedSuccess
                ? 'bg-emerald-500 text-black'
                : 'bg-white hover:bg-neutral-200 text-black'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check size={16} strokeWidth={3} />
                <span>Saved to Photos</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Save to Device</span>
              </>
            )}
          </button>
        </div>

        {/* Secondary Row: Retake + Share */}
        <div className="grid grid-cols-2 gap-3">
          {/* Retake Button */}
          <button
            id="btn-retake-photo"
            onClick={onRetake}
            className="h-11 bg-neutral-900 hover:bg-neutral-850 active:scale-[0.98] border border-neutral-800 rounded-xl flex items-center justify-center gap-2 text-neutral-300 font-medium text-xs transition"
          >
            <RotateCcw size={15} />
            <span>Retake</span>
          </button>

          {/* Share Button */}
          <button
            id="btn-share-photo"
            onClick={handleShare}
            className="h-11 bg-neutral-900 hover:bg-neutral-850 active:scale-[0.98] border border-neutral-800 rounded-xl flex items-center justify-center gap-2 text-neutral-300 font-medium text-xs transition"
          >
            <Share2 size={15} className="text-sky-400" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Background Enhancer Modal */}
      <BackgroundEnhancerModal
        isOpen={showEnhancerModal}
        onClose={() => setShowEnhancerModal(false)}
        rawImageSrc={photoDataUrl}
        onApply={handleApplyEnhancement}
      />
    </div>
  );
};
