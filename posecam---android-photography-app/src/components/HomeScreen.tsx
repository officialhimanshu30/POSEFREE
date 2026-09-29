import React, { useState } from 'react';
import { Camera, LayoutGrid, Image as ImageIcon, Sparkles, ShieldCheck, User as UserIcon } from 'lucide-react';
import { AdMobBanner } from './AdMobBanner';
import { PoseTemplate } from '../types';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

interface HomeScreenProps {
  onTakePhoto: () => void;
  onOpenGallery: () => void;
  onOpenMyPhotos: () => void;
  selectedPose: PoseTemplate;
  photosCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onTakePhoto,
  onOpenGallery,
  onOpenMyPhotos,
  selectedPose,
  photosCount,
}) => {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  return (
    <div className="flex-1 flex flex-col justify-between p-5 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white shadow-lg shadow-black/40">
            <Camera size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white">
              PoseCam
            </h1>
            <p className="text-xs text-neutral-400">Pose Guide Photography</p>
          </div>
        </div>

        {/* Actions: Account & Pose Gallery */}
        <div className="flex items-center gap-2">
          {/* Firebase Auth Account Button */}
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-1.5 bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 text-xs px-2.5 py-2 rounded-xl transition shadow-sm active:scale-95"
            title={user ? `Signed in as ${user.displayName || user.email || 'User'}` : 'Sign In'}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-4 h-4 rounded-full object-cover" />
            ) : (
              <UserIcon size={14} className={user ? 'text-amber-400' : 'text-neutral-400'} />
            )}
            <span className="font-semibold text-xs max-w-[65px] truncate">
              {user ? (user.displayName?.split(' ')[0] || 'Account') : 'Sign In'}
            </span>
          </button>

          {/* Pose Gallery Shortcut */}
          <button
            onClick={onOpenGallery}
            className="flex items-center gap-1.5 bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 text-xs px-3 py-2 rounded-xl transition shadow-sm active:scale-95"
            title="Browse Pose Gallery"
          >
            <LayoutGrid size={15} className="text-amber-400" />
            <span className="font-semibold text-xs">Poses</span>
          </button>
        </div>
      </header>

      {/* Hero Visual Card showing Current Active Pose Overlay */}
      <div className="my-auto py-4">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          {/* Subtle background ambient light */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Active Pose Header Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                {selectedPose.category}
              </span>
              <span className="text-xs text-neutral-400 truncate max-w-[150px]">
                {selectedPose.name}
              </span>
            </div>
            <button
              onClick={onOpenGallery}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition"
            >
              <span>Change</span>
            </button>
          </div>

          {/* Vector Silhouette Guide Preview Box */}
          <div
            onClick={onTakePhoto}
            className="w-full h-44 bg-neutral-950/70 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-3 relative cursor-pointer group hover:border-neutral-700 transition"
          >
            {/* Guide Silhouette */}
            {selectedPose.imageUrl ? (
              <img
                src={selectedPose.imageUrl}
                alt={selectedPose.name}
                className="h-36 w-full object-contain pointer-events-none select-none transition group-hover:scale-105 duration-300"
              />
            ) : (
              <svg
                viewBox={selectedPose.viewBox || '0 0 200 400'}
                className="h-36 w-28 text-white/90 group-hover:text-amber-300 transition duration-300"
                dangerouslySetInnerHTML={{ __html: selectedPose.svgPath }}
              />
            )}

            <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-[11px] text-neutral-400 bg-neutral-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-neutral-800">
              <span className="truncate">{selectedPose.tip}</span>
              <span className="text-[10px] text-neutral-300 font-mono shrink-0 ml-1">
                {selectedPose.recommendedAngle || 'Eye Level'}
              </span>
            </div>
          </div>

          {/* Quick info badges */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-neutral-400">
            <div className="flex items-center gap-1.5 bg-neutral-950/60 p-2 rounded-xl border border-neutral-800/80">
              <Sparkles size={13} className="text-amber-400 shrink-0" />
              <span>Transparent overlay guide</span>
            </div>
            <div className="flex items-center gap-1.5 bg-neutral-950/60 p-2 rounded-xl border border-neutral-800/80">
              <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
              <span>Real camera photo capture</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Actions */}
      <div className="space-y-3 pb-3">
        {/* 1. Take Photo Button (Primary) */}
        <button
          id="btn-take-photo-primary"
          onClick={onTakePhoto}
          className="w-full h-14 bg-white hover:bg-neutral-100 active:scale-[0.98] text-neutral-950 font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-white/10 transition"
        >
          <Camera size={22} className="text-black" />
          <span className="text-base tracking-tight">Take Photo</span>
        </button>

        {/* 2. Pose Gallery & 3. My Photos Buttons Grid */}
        <div className="grid grid-cols-2 gap-3">
          <button
            id="btn-pose-gallery"
            onClick={onOpenGallery}
            className="h-13 bg-neutral-900 hover:bg-neutral-850 active:scale-[0.98] border border-neutral-800 rounded-2xl flex items-center justify-center gap-2.5 text-neutral-100 font-semibold text-sm transition"
          >
            <LayoutGrid size={18} className="text-amber-400" />
            <span>Pose Gallery</span>
          </button>

          <button
            id="btn-my-photos"
            onClick={onOpenMyPhotos}
            className="h-13 bg-neutral-900 hover:bg-neutral-850 active:scale-[0.98] border border-neutral-800 rounded-2xl flex items-center justify-center gap-2.5 text-neutral-100 font-semibold text-sm transition relative"
          >
            <ImageIcon size={18} className="text-sky-400" />
            <span>My Photos</span>
            {photosCount > 0 && (
              <span className="bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ml-0.5">
                {photosCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 4. AdMob Banner Ad at Bottom of Home Screen */}
      <div className="pt-2">
        <AdMobBanner />
      </div>

      {/* Firebase Authentication Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};
