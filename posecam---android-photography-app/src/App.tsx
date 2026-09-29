import React, { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { PoseGallery } from './components/PoseGallery';
import { CameraScreen } from './components/CameraScreen';
import { PhotoResultScreen } from './components/PhotoResultScreen';
import { MyPhotosScreen } from './components/MyPhotosScreen';
import { AdMobInterstitial } from './components/AdMobInterstitial';
import { INITIAL_POSES } from './data/poseCatalog';
import { PoseTemplate, AppScreen } from './types';
import { photoStorage } from './services/storage';
import { adMobManager } from './services/adMobConfig';
import { Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [selectedPose, setSelectedPose] = useState<PoseTemplate>(INITIAL_POSES[0]);
  const [capturedPhotoData, setCapturedPhotoData] = useState<{
    dataUrl: string;
    width: number;
    height: number;
  } | null>(null);

  const [photosCount, setPhotosCount] = useState<number>(0);

  // AdMob Interstitial State (shown ONLY at natural transitions)
  const [interstitialOpen, setInterstitialOpen] = useState<boolean>(false);
  const [interstitialReason, setInterstitialReason] = useState<string>('Operation Complete');

  // Device frame view toggle (Mobile frame vs full screen)
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);

  // Refresh photos count on mount and screen change, and initialize with Standing 01 if available
  useEffect(() => {
    photoStorage.getAllPhotos().then((list) => setPhotosCount(list.length));
    photoStorage.getStandingPoses().then((standingList) => {
      if (standingList && standingList.length > 0) {
        setSelectedPose(standingList[0]);
      }
    });
  }, [currentScreen]);

  const handleSelectPose = (pose: PoseTemplate, launchCameraImmediately = false) => {
    setSelectedPose(pose);
    if (launchCameraImmediately) {
      setCurrentScreen('camera');
    } else {
      setCurrentScreen('home');
    }
  };

  const handlePhotoCaptured = (dataUrl: string, width: number, height: number) => {
    setCapturedPhotoData({ dataUrl, width, height });
    setCurrentScreen('result');
  };

  const handleTriggerInterstitial = (reason: string) => {
    setInterstitialReason(reason);
    setInterstitialOpen(true);
    adMobManager.recordInterstitialShown();
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center relative font-sans text-neutral-100 overflow-hidden">
      {/* Top Device Switcher Toolbar (for quick desktop preview switching) */}
      <div className="absolute top-2 right-4 z-40 hidden sm:flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 px-3 py-1.5 rounded-full text-xs text-neutral-400">
        <span className="text-[11px]">View Mode:</span>
        <button
          onClick={() => setIsMobileFrame(true)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition ${
            isMobileFrame ? 'bg-white text-black font-semibold' : 'hover:text-white'
          }`}
        >
          <Smartphone size={12} />
          <span>Mobile View</span>
        </button>
        <button
          onClick={() => setIsMobileFrame(false)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition ${
            !isMobileFrame ? 'bg-white text-black font-semibold' : 'hover:text-white'
          }`}
        >
          <Monitor size={12} />
          <span>Full View</span>
        </button>
      </div>

      {/* Main Container / Mobile Device Frame */}
      <main
        id="app-main-viewport"
        className={`w-full flex flex-col bg-neutral-950 relative overflow-hidden transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-[430px] h-[100dvh] sm:h-[890px] sm:rounded-[44px] sm:border-[8px] sm:border-neutral-800 sm:shadow-[0_0_50px_rgba(0,0,0,0.8)]'
            : 'w-full h-[100dvh]'
        }`}
      >
        {/* Device Status Bar */}
        <div className="w-full h-8 bg-black shrink-0 flex items-center justify-between px-6 text-[11px] text-neutral-400 font-medium select-none z-40">
          <span>9:41</span>
          {/* Camera punch-hole simulation */}
          <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-neutral-800 -mt-0.5" />
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* View Routing */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {currentScreen === 'home' && (
            <HomeScreen
              onTakePhoto={() => setCurrentScreen('camera')}
              onOpenGallery={() => setCurrentScreen('gallery')}
              onOpenMyPhotos={() => setCurrentScreen('photos')}
              selectedPose={selectedPose}
              photosCount={photosCount}
            />
          )}

          {currentScreen === 'gallery' && (
            <PoseGallery
              onBack={() => setCurrentScreen('home')}
              onSelectPose={handleSelectPose}
              selectedPoseId={selectedPose.id}
            />
          )}

          {currentScreen === 'camera' && (
            <CameraScreen
              pose={selectedPose}
              onBack={() => setCurrentScreen('home')}
              onPhotoCaptured={handlePhotoCaptured}
              onOpenGallery={() => setCurrentScreen('gallery')}
            />
          )}

          {currentScreen === 'result' && capturedPhotoData && (
            <PhotoResultScreen
              photoDataUrl={capturedPhotoData.dataUrl}
              photoWidth={capturedPhotoData.width}
              photoHeight={capturedPhotoData.height}
              poseName={selectedPose.name}
              poseId={selectedPose.id}
              onRetake={() => setCurrentScreen('camera')}
              onHome={() => setCurrentScreen('home')}
              onTriggerInterstitial={handleTriggerInterstitial}
            />
          )}

          {currentScreen === 'photos' && (
            <MyPhotosScreen
              onBack={() => setCurrentScreen('home')}
              onTakePhoto={() => setCurrentScreen('camera')}
            />
          )}
        </div>

        {/* Gesture Bar */}
        <div className="w-full h-4 bg-black shrink-0 flex items-center justify-center select-none z-40">
          <div className="w-32 h-1 bg-neutral-600 rounded-full" />
        </div>
      </main>

      {/* AdMob Interstitial Ad (Natural Transition) */}
      <AdMobInterstitial
        isOpen={interstitialOpen}
        onClose={() => setInterstitialOpen(false)}
        transitionReason={interstitialReason}
      />
    </div>
  );
}
