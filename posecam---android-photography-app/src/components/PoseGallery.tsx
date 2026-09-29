import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, Camera, FileText, Loader2, Images, RotateCcw, UploadCloud, Plus } from 'lucide-react';
import { POSE_CATEGORIES, INITIAL_POSES } from '../data/poseCatalog';
import { PoseTemplate } from '../types';
import { photoStorage } from '../services/storage';
import { extractStandingPosesFromPDF, ExtractionProgress } from '../services/pdfPoseExtractor';

interface PoseGalleryProps {
  onBack: () => void;
  onSelectPose: (pose: PoseTemplate, launchCameraImmediately?: boolean) => void;
  selectedPoseId: string;
}

export const PoseGallery: React.FC<PoseGalleryProps> = ({
  onBack,
  onSelectPose,
  selectedPoseId,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Standing');
  const [customStandingPoses, setCustomStandingPoses] = useState<PoseTemplate[]>([]);
  const [customSittingPoses, setCustomSittingPoses] = useState<PoseTemplate[]>([]);
  const [customCouplePoses, setCustomCouplePoses] = useState<PoseTemplate[]>([]);
  const [extracting, setExtracting] = useState<boolean>(false);
  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress | null>(null);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved standing, sitting and couple poses from persistent IndexedDB
  useEffect(() => {
    photoStorage.getStandingPoses().then((saved) => {
      if (Array.isArray(saved) && saved.length > 0) {
        setCustomStandingPoses(saved);
      }
    });
    photoStorage.getSittingPoses().then((saved) => {
      if (Array.isArray(saved) && saved.length > 0) {
        setCustomSittingPoses(saved);
      }
    });
    photoStorage.getCouplePoses().then((saved) => {
      if (Array.isArray(saved) && saved.length > 0) {
        setCustomCouplePoses(saved);
      }
    });
  }, []);

  // Combine custom standing + sitting + couple poses with remaining initial poses
  const allPoses = React.useMemo(() => {
    const basePoses = INITIAL_POSES.filter((p) => {
      if (customSittingPoses.length > 0 && p.category === 'Sitting') return false;
      if (customCouplePoses.length > 0 && p.category === 'Couple') return false;
      return true;
    });
    return [...customStandingPoses, ...customSittingPoses, ...customCouplePoses, ...basePoses];
  }, [customStandingPoses, customSittingPoses, customCouplePoses]);

  const filteredPoses =
    activeCategory === 'All'
      ? allPoses
      : allPoses.filter((p) => p.category === activeCategory);

  // Natural numerical sorting function
  const sortFilesNaturally = (fileList: File[]): File[] => {
    return [...fileList].sort((a, b) => {
      const matchA = a.name.match(/(\d+)/);
      const matchB = b.name.match(/(\d+)/);
      const numA = matchA ? parseInt(matchA[1], 10) : 0;
      const numB = matchB ? parseInt(matchB[1], 10) : 0;
      if (numA !== numB) return numA - numB;
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });
  };

  const processPoseFiles = async (rawFiles: File[], overrideCategory?: 'Standing' | 'Sitting' | 'Couple') => {
    if (!rawFiles || rawFiles.length === 0) return;

    const targetCat: 'Standing' | 'Sitting' | 'Couple' =
      overrideCategory ||
      (activeCategory === 'Sitting' ? 'Sitting' : activeCategory === 'Couple' ? 'Couple' : 'Standing');
    const prefix = targetCat.toLowerCase();

    const fileList = sortFilesNaturally(rawFiles);

    const readAsDataUrl = (file: File): Promise<{ filename: string; dataUrl: string }> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ filename: file.name, dataUrl: reader.result as string });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    setExtracting(true);
    setExtractionProgress({ current: 0, total: fileList.length, status: `Reading ${targetCat} pose images...` });
    setImportNotice(null);

    try {
      const loaded: { filename: string; dataUrl: string }[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const item = await readAsDataUrl(fileList[i]);
        loaded.push(item);
        setExtractionProgress({
          current: i + 1,
          total: fileList.length,
          status: `Loading ${targetCat} image ${i + 1} of ${fileList.length} (${fileList[i].name})...`,
        });
      }

      // Convert strictly into numbered templates keeping original quality
      const finalizedPoses: PoseTemplate[] = loaded.map((item, idx) => {
        const num = String(idx + 1).padStart(2, '0');
        return {
          id: `${prefix}-${num}`,
          name: `${targetCat} ${num}`,
          category: targetCat,
          description: `${targetCat} pose template ${num}`,
          tip: `Align your posture with this ${targetCat.toLowerCase()} silhouette overlay.`,
          recommendedAngle: targetCat === 'Sitting' ? 'Waist to Eye Level • 1.0x' : 'Chest to Full Body • 1.0x',
          imageUrl: item.dataUrl,
          svgPath: `<image href="${item.dataUrl}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />`,
          viewBox: '0 0 200 400',
        };
      });

      if (targetCat === 'Sitting') {
        await photoStorage.saveSittingPoses(finalizedPoses);
        setCustomSittingPoses(finalizedPoses);
        setActiveCategory('Sitting');
        setImportNotice(`Loaded ${finalizedPoses.length} images into Sitting category (Sitting 01 – Sitting ${String(finalizedPoses.length).padStart(2, '0')}).`);
      } else if (targetCat === 'Couple') {
        await photoStorage.saveCouplePoses(finalizedPoses);
        setCustomCouplePoses(finalizedPoses);
        setActiveCategory('Couple');
        setImportNotice(`Loaded ${finalizedPoses.length} images into Couple category (Couple 01 – Couple ${String(finalizedPoses.length).padStart(2, '0')}).`);
      } else {
        await photoStorage.saveStandingPoses(finalizedPoses);
        setCustomStandingPoses(finalizedPoses);
        setActiveCategory('Standing');
        setImportNotice(`Loaded ${finalizedPoses.length} images into Standing category (Standing 01 – Standing ${String(finalizedPoses.length).padStart(2, '0')}).`);
      }

      if (finalizedPoses.length > 0) {
        onSelectPose(finalizedPoses[0], false);
      }
    } catch (err) {
      console.error('Failed reading images:', err);
      setImportNotice('Failed to process image files.');
    } finally {
      setExtracting(false);
      setExtractionProgress(null);
    }
  };

  const handleMultipleImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    catOverride?: 'Standing' | 'Sitting' | 'Couple'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processPoseFiles(Array.from(files), catOverride);
    e.target.value = '';
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length > 0) {
      await processPoseFiles(files);
    }
  };

  // PDF Extraction Handler
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetCat: 'Standing' | 'Sitting' | 'Couple' = 'Standing') => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const expectedCount = targetCat === 'Sitting' ? 18 : targetCat === 'Couple' ? 15 : 25;
    const prefix = targetCat.toLowerCase();

    setExtracting(true);
    setExtractionProgress({ current: 0, total: expectedCount, status: `Reading PDF for ${targetCat} poses...` });
    setImportNotice(null);

    try {
      const extracted = await extractStandingPosesFromPDF(file, (progress) => {
        setExtractionProgress(progress);
      });

      if (extracted.length > 0) {
        const finalizedPoses: PoseTemplate[] = extracted.map((pose, idx) => {
          const num = String(idx + 1).padStart(2, '0');
          return {
            ...pose,
            id: `${prefix}-${num}`,
            name: `${targetCat} ${num}`,
            category: targetCat,
          };
        });

        if (targetCat === 'Sitting') {
          await photoStorage.saveSittingPoses(finalizedPoses);
          setCustomSittingPoses(finalizedPoses);
          setActiveCategory('Sitting');
          setImportNotice(`Extracted and loaded ${finalizedPoses.length} sitting pose templates (Sitting 01 – Sitting ${String(finalizedPoses.length).padStart(2, '0')}).`);
        } else if (targetCat === 'Couple') {
          await photoStorage.saveCouplePoses(finalizedPoses);
          setCustomCouplePoses(finalizedPoses);
          setActiveCategory('Couple');
          setImportNotice(`Extracted and loaded ${finalizedPoses.length} couple pose templates (Couple 01 – Couple ${String(finalizedPoses.length).padStart(2, '0')}).`);
        } else {
          await photoStorage.saveStandingPoses(finalizedPoses);
          setCustomStandingPoses(finalizedPoses);
          setActiveCategory('Standing');
          setImportNotice(`Extracted and loaded ${finalizedPoses.length} standing pose templates (Standing 01 – Standing ${String(finalizedPoses.length).padStart(2, '0')}).`);
        }

        onSelectPose(finalizedPoses[0], false);
      } else {
        setImportNotice('No pages or pose templates could be extracted from this PDF.');
      }
    } catch (err) {
      console.error('PDF extraction failed:', err);
      setImportNotice('Failed to extract PDF poses. Please ensure file is a valid PDF.');
    } finally {
      setExtracting(false);
      setExtractionProgress(null);
    }
  };

  const handleClearStandingPoses = async () => {
    await photoStorage.clearStandingPoses();
    setCustomStandingPoses([]);
    setImportNotice('Cleared standing poses.');
    if (INITIAL_POSES.length > 0) {
      onSelectPose(INITIAL_POSES[0], false);
    }
  };

  const handleClearSittingPoses = async () => {
    await photoStorage.clearSittingPoses();
    setCustomSittingPoses([]);
    setImportNotice('Cleared sitting poses.');
    if (INITIAL_POSES.length > 0) {
      onSelectPose(INITIAL_POSES[0], false);
    }
  };

  const handleClearCouplePoses = async () => {
    await photoStorage.clearCouplePoses();
    setCustomCouplePoses([]);
    setImportNotice('Cleared couple poses.');
    if (INITIAL_POSES.length > 0) {
      onSelectPose(INITIAL_POSES[0], false);
    }
  };

  return (
    <div
      className={`flex-1 flex flex-col bg-neutral-950 text-white overflow-hidden select-none transition-colors ${
        isDragOver ? 'bg-neutral-900 border-2 border-dashed border-amber-500' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Top Header */}
      <div className="px-4 pt-3 pb-2 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-neutral-400 hover:text-white rounded-xl transition"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-base text-white">Pose Gallery</h1>
            <p className="text-[11px] text-neutral-400">Select a guide template for your camera</p>
          </div>
        </div>

        {/* Action Buttons: Add 25 Standing / 18 Sitting / Couple Images & PDF */}
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="upload-images-header"
            className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs px-2.5 py-1.5 rounded-xl cursor-pointer transition active:scale-95 shadow-sm"
            title={activeCategory === 'Sitting' ? 'Select 18 Sitting Pose Images' : activeCategory === 'Couple' ? 'Select 15 Couple Pose Images' : 'Select 25 Standing Pose Images'}
          >
            {extracting ? (
              <Loader2 size={13} className="animate-spin text-amber-400" />
            ) : (
              <Images size={13} className="text-amber-400" />
            )}
            <span className="text-[11px] font-semibold">
              {activeCategory === 'Sitting' ? 'Select 18 Images' : activeCategory === 'Couple' ? 'Select 15 Images' : 'Select 25 Images'}
            </span>
            <input
              id="upload-images-header"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={extracting}
              onChange={(e) => handleMultipleImagesUpload(e, activeCategory === 'Sitting' ? 'Sitting' : activeCategory === 'Couple' ? 'Couple' : 'Standing')}
            />
          </label>

          <label
            htmlFor="upload-pdf-poses-header"
            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs px-2.5 py-1.5 rounded-xl cursor-pointer transition text-neutral-300 active:scale-95"
            title={`Upload PDF with ${activeCategory === 'Sitting' ? '18 Sitting' : activeCategory === 'Couple' ? '15 Couple' : '25 Standing'} Poses`}
          >
            <FileText size={13} className="text-neutral-400" />
            <span className="text-[11px] font-medium">PDF</span>
            <input
              id="upload-pdf-poses-header"
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              disabled={extracting}
              onChange={(e) => handlePdfUpload(e, activeCategory === 'Sitting' ? 'Sitting' : activeCategory === 'Couple' ? 'Couple' : 'Standing')}
            />
          </label>
        </div>
      </div>

      {/* Extraction in progress banner */}
      {extracting && extractionProgress && (
        <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin text-amber-400" />
            <span>{extractionProgress.status}</span>
          </div>
          <span className="font-mono text-[11px] text-amber-300 font-bold">
            {extractionProgress.current} / {extractionProgress.total}
          </span>
        </div>
      )}

      {/* Status Notice */}
      {importNotice && !extracting && (
        <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-2 flex items-center justify-between text-xs text-neutral-300">
          <span>{importNotice}</span>
          <button
            onClick={() => setImportNotice(null)}
            className="text-[10px] text-neutral-400 hover:text-white ml-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Category Pills (Standing, Sitting, Couple) */}
      <div className="px-3 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-neutral-850">
        <button
          onClick={() => setActiveCategory('All')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
            activeCategory === 'All'
              ? 'bg-white text-black font-semibold'
              : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
          }`}
        >
          All Poses ({allPoses.length})
        </button>
        {POSE_CATEGORIES.map((category) => {
          const count = allPoses.filter((p) => p.category === category).length;
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                activeCategory === category
                  ? 'bg-white text-black font-semibold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              {category} ({count})
            </button>
          );
        })}
      </div>

      {/* Category Info Banner for Standing */}
      {activeCategory === 'Standing' && (
        <div className="px-4 py-2 bg-neutral-900/60 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] text-neutral-400">
            <span className="font-semibold text-white">Standing Category: </span>
            {filteredPoses.length} pose templates {filteredPoses.length > 0 && `(Standing 01 – Standing ${String(filteredPoses.length).padStart(2, '0')})`}
          </div>
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="upload-25-images-sub"
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1"
            >
              <Plus size={12} />
              <span>{filteredPoses.length > 0 ? 'Replace / Add 25 Images' : 'Select 25 Images'}</span>
              <input
                id="upload-25-images-sub"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={extracting}
                onChange={(e) => handleMultipleImagesUpload(e, 'Standing')}
              />
            </label>
            {customStandingPoses.length > 0 && (
              <button
                onClick={handleClearStandingPoses}
                className="text-[10px] text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition"
                title="Clear standing poses"
              >
                <RotateCcw size={10} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Category Info Banner for Sitting */}
      {activeCategory === 'Sitting' && (
        <div className="px-4 py-2 bg-neutral-900/60 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] text-neutral-400">
            <span className="font-semibold text-white">Sitting Category: </span>
            {filteredPoses.length} pose templates {customSittingPoses.length > 0 ? `(Sitting 01 – Sitting ${String(customSittingPoses.length).padStart(2, '0')})` : ''}
          </div>
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="upload-18-sitting-images-sub"
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1"
            >
              <Plus size={12} />
              <span>{customSittingPoses.length > 0 ? 'Replace / Add 18 Images' : 'Select 18 Images'}</span>
              <input
                id="upload-18-sitting-images-sub"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={extracting}
                onChange={(e) => handleMultipleImagesUpload(e, 'Sitting')}
              />
            </label>
            {customSittingPoses.length > 0 && (
              <button
                onClick={handleClearSittingPoses}
                className="text-[10px] text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition"
                title="Clear sitting poses"
              >
                <RotateCcw size={10} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Category Info Banner for Couple */}
      {activeCategory === 'Couple' && (
        <div className="px-4 py-2 bg-neutral-900/60 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] text-neutral-400">
            <span className="font-semibold text-white">Couple Category: </span>
            {filteredPoses.length} pose templates {customCouplePoses.length > 0 ? `(Couple 01 – Couple ${String(customCouplePoses.length).padStart(2, '0')})` : ''}
          </div>
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="upload-couple-images-sub"
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1"
            >
              <Plus size={12} />
              <span>{customCouplePoses.length > 0 ? 'Replace / Add 15 Images' : 'Select 15 Images'}</span>
              <input
                id="upload-couple-images-sub"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={extracting}
                onChange={(e) => handleMultipleImagesUpload(e, 'Couple')}
              />
            </label>
            {customCouplePoses.length > 0 && (
              <button
                onClick={handleClearCouplePoses}
                className="text-[10px] text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition"
                title="Clear couple poses"
              >
                <RotateCcw size={10} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {/* If Couple category has not yet uploaded custom poses, show the Couple callout banner */}
        {activeCategory === 'Couple' && customCouplePoses.length === 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-sm font-bold text-amber-300 flex items-center justify-center sm:justify-start gap-1.5">
                <Images size={16} />
                <span>Add 15 Couple Poses</span>
              </h3>
              <p className="text-xs text-neutral-300">
                Import 15 couple pose images to populate <span className="text-amber-200 font-semibold">Couple 01</span> through <span className="text-amber-200 font-semibold">Couple 15</span> for offline camera overlays.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <label
                htmlFor="couple-callout-upload-hero"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition shadow-sm"
              >
                <Images size={14} />
                <span>Select 15 Images</span>
                <input
                  id="couple-callout-upload-hero"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={extracting}
                  onChange={(e) => handleMultipleImagesUpload(e, 'Couple')}
                />
              </label>
            </div>
          </div>
        )}

        {/* If Sitting category has not yet uploaded 18 custom poses, show the 18 Sitting Images banner */}
        {activeCategory === 'Sitting' && customSittingPoses.length === 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-sm font-bold text-amber-300 flex items-center justify-center sm:justify-start gap-1.5">
                <Images size={16} />
                <span>Add 18 Sitting Poses</span>
              </h3>
              <p className="text-xs text-neutral-300">
                Import 18 sitting pose images to populate <span className="text-amber-200 font-semibold">Sitting 01</span> through <span className="text-amber-200 font-semibold">Sitting 18</span> for offline camera overlays.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <label
                htmlFor="sitting-callout-upload-hero"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition shadow-sm"
              >
                <Images size={14} />
                <span>Select 18 Images</span>
                <input
                  id="sitting-callout-upload-hero"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={extracting}
                  onChange={(e) => handleMultipleImagesUpload(e, 'Sitting')}
                />
              </label>
            </div>
          </div>
        )}

        {/* If Standing category is empty, show the dedicated 25-Image Dropzone & Import Hero */}
        {activeCategory === 'Standing' && filteredPoses.length === 0 ? (
          <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-6 bg-neutral-900/40 border border-dashed border-neutral-800 rounded-3xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <UploadCloud size={32} />
            </div>
            <div className="max-w-xs space-y-1">
              <h2 className="text-base font-bold text-white">Standing Pose Templates</h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Add your 25 standing pose images to populate <span className="text-amber-300 font-medium">Standing 01</span> through <span className="text-amber-300 font-medium">Standing 25</span>.
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Original image appearance and quality will be preserved 100% with real-time camera overlay controls.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <label
                htmlFor="hero-upload-25-images"
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition"
              >
                <Images size={16} />
                <span>Select 25 Images</span>
                <input
                  id="hero-upload-25-images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={extracting}
                  onChange={(e) => handleMultipleImagesUpload(e, 'Standing')}
                />
              </label>

              <label
                htmlFor="hero-upload-pdf"
                className="px-4 py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs flex items-center gap-2 cursor-pointer active:scale-95 transition"
              >
                <FileText size={15} />
                <span>Import from PDF</span>
                <input
                  id="hero-upload-pdf"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  disabled={extracting}
                  onChange={(e) => handlePdfUpload(e, 'Standing')}
                />
              </label>
            </div>
            <p className="text-[10px] text-neutral-500">Or drag and drop all 25 images directly into this window</p>
          </div>
        ) : (
          /* Grid of Pose Cards */
          <div className="grid grid-cols-2 gap-3">
            {filteredPoses.map((pose) => {
              const isSelected = pose.id === selectedPoseId;

              return (
                <div
                  key={pose.id}
                  id={`pose-card-${pose.id}`}
                  onClick={() => onSelectPose(pose, false)}
                  className={`bg-neutral-900/90 border rounded-2xl p-3 flex flex-col justify-between transition cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'border-white ring-2 ring-white/20 shadow-lg shadow-white/5'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {/* Selected Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-white text-black rounded-full p-1 shadow-md z-10">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}

                  {/* Category Tag */}
                  <div className="text-[10px] font-semibold tracking-wider uppercase text-neutral-400 mb-1">
                    {pose.category}
                  </div>

                  {/* Image / Vector Preview Box */}
                  <div className="w-full h-36 bg-neutral-950/80 rounded-xl flex items-center justify-center p-2 mb-2 border border-neutral-800/80 group-hover:bg-neutral-950 transition overflow-hidden">
                    {pose.imageUrl ? (
                      <img
                        src={pose.imageUrl}
                        alt={pose.name}
                        className="h-28 w-full object-contain pointer-events-none select-none transition group-hover:scale-105 duration-200"
                      />
                    ) : (
                      <svg
                        viewBox={pose.viewBox || '0 0 200 400'}
                        className={`h-28 w-20 transition duration-200 ${
                          isSelected ? 'text-amber-300' : 'text-neutral-300 group-hover:text-white'
                        }`}
                        dangerouslySetInnerHTML={{ __html: pose.svgPath }}
                      />
                    )}
                  </div>

                  {/* Pose Information */}
                  <div className="space-y-1 mb-2">
                    <h3 className="font-bold text-xs text-white leading-tight line-clamp-1">
                      {pose.name}
                    </h3>
                    <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {pose.description || pose.tip}
                    </p>
                  </div>

                  {/* Select & Open Camera Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPose(pose, true);
                    }}
                    className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 ${
                      isSelected
                        ? 'bg-white text-black'
                        : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-200'
                    }`}
                  >
                    <Camera size={12} />
                    <span>{isSelected ? 'Open Camera' : 'Select Pose'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
