import { PhotoRecord, PoseTemplate } from '../types';

const DB_NAME = 'PoseCamDB';
const STORE_NAME = 'photos';
const POSES_STORE_NAME = 'standing_poses';
const DB_VERSION = 2;

class LocalPhotoStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains(POSES_STORE_NAME)) {
          db.createObjectStore(POSES_STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  public async savePhoto(photo: PhotoRecord): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(photo);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback to localStorage for compatibility
      const existing = this.getLocalStoragePhotos();
      const filtered = existing.filter((p) => p.id !== photo.id);
      filtered.unshift(photo);
      try {
        localStorage.setItem('posecam_photos', JSON.stringify(filtered.slice(0, 15)));
      } catch (err) {
        console.warn('Storage quota exceeded', err);
      }
    }
  }

  public async getAllPhotos(): Promise<PhotoRecord[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('timestamp');
        const req = index.openCursor(null, 'prev'); // Most recent first
        const photos: PhotoRecord[] = [];

        req.onsuccess = () => {
          const cursor = req.result;
          if (cursor) {
            photos.push(cursor.value);
            cursor.continue();
          } else {
            resolve(photos);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.getLocalStoragePhotos();
    }
  }

  public async deletePhoto(id: string): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const photos = this.getLocalStoragePhotos().filter((p) => p.id !== id);
      localStorage.setItem('posecam_photos', JSON.stringify(photos));
    }
  }

  // --- Persistent Standing Poses in IndexedDB (handles 25+ uncompressed high-res images) ---
  public async saveStandingPoses(poses: PoseTemplate[]): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(POSES_STORE_NAME, 'readwrite');
        const store = tx.objectStore(POSES_STORE_NAME);
        // Clear only standing poses
        const req = store.getAll();
        req.onsuccess = () => {
          const all = req.result as PoseTemplate[];
          const nonStanding = all.filter((p) => p.category !== 'Standing');
          store.clear();
          for (const p of nonStanding) {
            store.put(p);
          }
          for (const p of poses) {
            store.put(p);
          }
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('IndexedDB saveStandingPoses failed, fallback to localStorage', err);
      try {
        localStorage.setItem('posecam_standing_poses', JSON.stringify(poses));
      } catch (lsErr) {
        console.warn('LocalStorage quota also exceeded for images', lsErr);
      }
    }
  }

  public async getStandingPoses(): Promise<PoseTemplate[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(POSES_STORE_NAME, 'readonly');
        const store = tx.objectStore(POSES_STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result as PoseTemplate[]).filter((p) => p.category === 'Standing');
          if (Array.isArray(list) && list.length > 0) {
            resolve(list);
          } else {
            resolve(this.getLocalStorageStandingPoses());
          }
        };
        req.onerror = () => resolve(this.getLocalStorageStandingPoses());
      });
    } catch {
      return this.getLocalStorageStandingPoses();
    }
  }

  public async clearStandingPoses(): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(POSES_STORE_NAME, 'readwrite');
        const store = tx.objectStore(POSES_STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const all = req.result as PoseTemplate[];
          const remaining = all.filter((p) => p.category !== 'Standing');
          store.clear();
          for (const p of remaining) {
            store.put(p);
          }
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem('posecam_standing_poses');
      localStorage.removeItem('posecam_standing_pdf_poses');
    } catch {
      // ignore
    }
  }

  // --- Persistent Sitting Poses in IndexedDB (handles 18 uncompressed images) ---
  public async saveSittingPoses(poses: PoseTemplate[]): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(POSES_STORE_NAME, 'readwrite');
        const store = tx.objectStore(POSES_STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const all = req.result as PoseTemplate[];
          const nonSitting = all.filter((p) => p.category !== 'Sitting');
          store.clear();
          for (const p of nonSitting) {
            store.put(p);
          }
          for (const p of poses) {
            store.put(p);
          }
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('IndexedDB saveSittingPoses failed, fallback to localStorage', err);
      try {
        localStorage.setItem('posecam_sitting_poses', JSON.stringify(poses));
      } catch (lsErr) {
        console.warn('LocalStorage quota exceeded for sitting poses', lsErr);
      }
    }
  }

  public async getSittingPoses(): Promise<PoseTemplate[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(POSES_STORE_NAME, 'readonly');
        const store = tx.objectStore(POSES_STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result as PoseTemplate[]).filter((p) => p.category === 'Sitting');
          if (Array.isArray(list) && list.length > 0) {
            resolve(list);
          } else {
            resolve(this.getLocalStorageSittingPoses());
          }
        };
        req.onerror = () => resolve(this.getLocalStorageSittingPoses());
      });
    } catch {
      return this.getLocalStorageSittingPoses();
    }
  }

  public async clearSittingPoses(): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(POSES_STORE_NAME, 'readwrite');
        const store = tx.objectStore(POSES_STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const all = req.result as PoseTemplate[];
          const remaining = all.filter((p) => p.category !== 'Sitting');
          store.clear();
          for (const p of remaining) {
            store.put(p);
          }
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem('posecam_sitting_poses');
    } catch {
      // ignore
    }
  }

  // --- Persistent Couple Poses in IndexedDB ---
  public async saveCouplePoses(poses: PoseTemplate[]): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(POSES_STORE_NAME, 'readwrite');
        const store = tx.objectStore(POSES_STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const all = req.result as PoseTemplate[];
          const nonCouple = all.filter((p) => p.category !== 'Couple');
          store.clear();
          for (const p of nonCouple) {
            store.put(p);
          }
          for (const p of poses) {
            store.put(p);
          }
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('IndexedDB saveCouplePoses failed, fallback to localStorage', err);
      try {
        localStorage.setItem('posecam_couple_poses', JSON.stringify(poses));
      } catch (lsErr) {
        console.warn('LocalStorage quota exceeded for couple poses', lsErr);
      }
    }
  }

  public async getCouplePoses(): Promise<PoseTemplate[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(POSES_STORE_NAME, 'readonly');
        const store = tx.objectStore(POSES_STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result as PoseTemplate[]).filter((p) => p.category === 'Couple');
          if (Array.isArray(list) && list.length > 0) {
            resolve(list);
          } else {
            resolve(this.getLocalStorageCouplePoses());
          }
        };
        req.onerror = () => resolve(this.getLocalStorageCouplePoses());
      });
    } catch {
      return this.getLocalStorageCouplePoses();
    }
  }

  public async clearCouplePoses(): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(POSES_STORE_NAME, 'readwrite');
        const store = tx.objectStore(POSES_STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const all = req.result as PoseTemplate[];
          const remaining = all.filter((p) => p.category !== 'Couple');
          store.clear();
          for (const p of remaining) {
            store.put(p);
          }
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem('posecam_couple_poses');
    } catch {
      // ignore
    }
  }

  private getLocalStorageCouplePoses(): PoseTemplate[] {
    try {
      const raw = localStorage.getItem('posecam_couple_poses');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private getLocalStorageSittingPoses(): PoseTemplate[] {
    try {
      const raw = localStorage.getItem('posecam_sitting_poses');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private getLocalStorageStandingPoses(): PoseTemplate[] {
    try {
      const raw = localStorage.getItem('posecam_standing_poses') || localStorage.getItem('posecam_standing_pdf_poses');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private getLocalStoragePhotos(): PhotoRecord[] {
    try {
      const raw = localStorage.getItem('posecam_photos');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export const photoStorage = new LocalPhotoStorage();
