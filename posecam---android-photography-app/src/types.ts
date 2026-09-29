export type PoseCategory = 'Standing' | 'Sitting' | 'Couple';

export interface PoseTemplate {
  id: string;
  name: string;
  category: PoseCategory;
  description: string;
  tip: string;
  svgPath: string; // SVG path or SVG elements string representing the pose silhouette
  viewBox?: string;
  recommendedAngle?: string;
  imageUrl?: string;
}

export interface PhotoRecord {
  id: string;
  dataUrl: string;
  timestamp: number;
  poseId?: string;
  poseName?: string;
  enhanced?: boolean;
  width: number;
  height: number;
}

export type TimerOption = 0 | 3 | 5;

export interface CameraState {
  facingMode: 'user' | 'environment';
  timer: TimerOption;
  overlayOpacity: number; // 0 to 1
  overlayVisible: boolean;
  guideColor: string;
  showGrid: boolean;
}

export interface EnhanceSettings {
  exposure: number;   // -50 to +50
  warmth: number;     // -50 to +50
  blur: number;       // 0 to 30px
  saturation: number; // -50 to +50
  vignette: number;   // 0 to 100
}

export type AppScreen = 'home' | 'gallery' | 'camera' | 'result' | 'photos' | 'android-project';
