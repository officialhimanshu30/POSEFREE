import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trash2, Download, Share2, Sparkles, Camera, X } from 'lucide-react';
import { PhotoRecord } from '../types';
import { photoStorage } from '../services/storage';

interface MyPhotosScreenProps {
  onBack: () => void;
  onTakePhoto: () => void;
}

export const MyPhotosScreen: React.FC<MyPhotosScreenProps> = ({
  onBack,
  onTakePhoto,
}) => {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activePhoto, setActivePhoto] = useState<PhotoRecord | null>(null);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const data = await photoStorage.getAllPhotos();
      setPhotos(data);
    } catch (err) {
      console.error('Failed to load local photos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('Delete this photo from local device storage?')) return;
    await photoStorage.deletePhoto(id);
    if (activePhoto?.id === id) setActivePhoto(null);
    loadPhotos();
  };

  const handleDownload = (photo: PhotoRecord, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const link = document.createElement('a');
    link.href = photo.dataUrl;
    link.download = `PoseCam_${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (photo: PhotoRecord, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      if (navigator.share) {
        const res = await fetch(photo.dataUrl);
        const blob = await res.blob();
        const file = new File([blob], 'PoseCam_Photo.jpg', { type: 'image/jpeg' });
        await navigator.share({
          title: 'My PoseCam Photo',
          files: [file],
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch {
      // ignore cancelled
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-950 text-white select-none overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-neutral-850 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 text-neutral-400 hover:text-white rounded-lg transition"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-base text-white">My Photos</h1>
            <p className="text-[11px] text-neutral-400">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'} stored locally
            </p>
          </div>
        </div>

        <button
          onClick={onTakePhoto}
          className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs px-2.5 py-1.5 rounded-xl transition text-neutral-200 active:scale-95"
        >
          <Camera size={13} className="text-amber-400" />
          <span>New Photo</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="h-48 flex items-center justify-center text-xs text-neutral-500">
            Loading local photos...
          </div>
        ) : photos.length === 0 ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500">
              <Camera size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">No Photos Captured Yet</h3>
              <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                Pick a pose from the gallery, line yourself up with the transparent guide, and take your first photo!
              </p>
            </div>
            <button
              onClick={onTakePhoto}
              className="px-5 py-2.5 bg-white text-black font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-neutral-200 transition active:scale-95 shadow-lg shadow-white/5"
            >
              <Camera size={15} />
              <span>Open Camera</span>
            </button>
          </div>
        ) : (
          /* Grid of Captured Photos */
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                className="aspect-[3/4] bg-neutral-900 rounded-xl overflow-hidden relative cursor-pointer group border border-neutral-800/80 hover:border-neutral-600 transition"
              >
                <img
                  src={photo.dataUrl}
                  alt="Captured Photo"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />

                {/* Enhanced Indicator */}
                {photo.enhanced && (
                  <div className="absolute top-1.5 right-1.5 bg-amber-400 text-black p-0.5 rounded-full shadow-sm">
                    <Sparkles size={10} />
                  </div>
                )}

                {/* Hover overlay with quick actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition duration-200">
                  <button
                    onClick={(e) => handleDownload(photo, e)}
                    className="p-1.5 bg-neutral-900/80 hover:bg-black rounded-lg text-white transition"
                    title="Download"
                  >
                    <Download size={13} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(photo.id, e)}
                    className="p-1.5 bg-red-950/80 hover:bg-red-900 rounded-lg text-red-300 transition"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 animate-in fade-in duration-150">
          {/* Lightbox Header */}
          <div className="flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-white text-sm">
                {activePhoto.poseName || 'Captured Photo'}
              </div>
              <div className="text-[11px] text-neutral-400">
                {new Date(activePhoto.timestamp).toLocaleDateString()} •{' '}
                {new Date(activePhoto.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>

            <button
              onClick={() => setActivePhoto(null)}
              className="p-2 bg-neutral-800 text-neutral-300 hover:text-white rounded-full transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Lightbox Center Image */}
          <div className="flex-1 flex items-center justify-center p-2 my-2 overflow-hidden">
            <img
              src={activePhoto.dataUrl}
              alt="Full Preview"
              className="max-h-[68vh] max-w-full rounded-2xl object-contain shadow-2xl border border-neutral-800"
            />
          </div>

          {/* Lightbox Bottom Actions */}
          <div className="flex items-center justify-center gap-4 py-2 border-t border-neutral-850">
            <button
              onClick={() => handleDownload(activePhoto)}
              className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs px-4 py-2.5 rounded-xl font-medium transition"
            >
              <Download size={14} />
              <span>Download</span>
            </button>

            <button
              onClick={() => handleShare(activePhoto)}
              className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs px-4 py-2.5 rounded-xl font-medium transition"
            >
              <Share2 size={14} className="text-sky-400" />
              <span>Share</span>
            </button>

            <button
              onClick={() => handleDelete(activePhoto.id)}
              className="flex items-center gap-1.5 bg-red-950/60 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs px-4 py-2.5 rounded-xl font-medium transition"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
