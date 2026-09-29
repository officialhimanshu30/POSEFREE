import { PoseTemplate } from '../types';

export const POSE_CATEGORIES = [
  'Standing',
  'Sitting',
  'Couple',
] as const;

export const INITIAL_POSES: PoseTemplate[] = [
  // --- SITTING ---
  {
    id: 'sit-1',
    name: 'Coffee Shop Relaxed',
    category: 'Sitting',
    description: 'Casual seated position leaning forward slightly over a table with arms relaxed.',
    tip: 'Place camera at table height for an intimate cafe aesthetic.',
    recommendedAngle: 'Table Height • 1.0x',
    viewBox: '0 0 200 400',
    svgPath: `
      <!-- Head -->
      <circle cx="100" cy="70" r="22" fill="none" stroke="currentColor" stroke-width="3.5" />
      <!-- Torso leaning forward -->
      <path d="M78 112 Q100 108 122 112 L116 205 Q100 208 84 205 Z" fill="none" stroke="currentColor" stroke-width="3.5" />
      <!-- Table surface line -->
      <line x1="20" y1="210" x2="180" y2="210" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2" opacity="0.6" />
      <!-- Arms resting on table / cup -->
      <path d="M78 112 L65 165 L88 208" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
      <path d="M122 112 L135 165 L112 208" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
      <!-- Thighs horizontal -->
      <path d="M86 205 L65 240 L65 340" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M114 205 L135 240 L135 340" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M65 340 L50 350 M135 340 L150 350" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
    `,
  },
  {
    id: 'sit-2',
    name: 'Chair Angle Cross',
    category: 'Sitting',
    description: 'Seated with knee crossed over, hands resting gently on top knee.',
    tip: 'Angle body 45 degrees relative to camera for slimming depth.',
    recommendedAngle: 'Knee Height • 1.2x',
    viewBox: '0 0 200 400',
    svgPath: `
      <!-- Head -->
      <circle cx="100" cy="65" r="22" fill="none" stroke="currentColor" stroke-width="3.5" />
      <!-- Torso upright -->
      <path d="M80 108 Q102 105 124 108 L118 198 Q102 200 82 198 Z" fill="none" stroke="currentColor" stroke-width="3.5" />
      <!-- Crossed arms on knee -->
      <path d="M80 108 L70 160 L102 215" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
      <path d="M124 108 L130 160 L105 215" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
      <!-- Crossed leg over resting leg -->
      <path d="M84 198 L80 250 L80 345" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
      <path d="M116 198 L100 220 L115 310" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M80 345 L70 355 M115 310 L125 320" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      <!-- Chair back hint -->
      <line x1="62" y1="120" x2="62" y2="280" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2" opacity="0.4" />
    `,
  },
  {
    id: 'sit-3',
    name: 'Stairs Casual Lounge',
    category: 'Sitting',
    description: 'Sitting on urban steps with knees elevated and leaning back on hands.',
    tip: 'Low angle shot looking slightly upward gives dramatic lifestyle presence.',
    recommendedAngle: 'Low Angle • 1.0x',
    viewBox: '0 0 200 400',
    svgPath: `
      <!-- Head -->
      <circle cx="95" cy="80" r="22" fill="none" stroke="currentColor" stroke-width="3.5" />
      <!-- Torso relaxed back -->
      <path d="M74 125 Q95 120 116 125 L110 215 Q95 218 78 215 Z" fill="none" stroke="currentColor" stroke-width="3.5" />
      <!-- Supporting arms behind -->
      <path d="M74 125 L50 180 L52 235" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
      <path d="M116 125 L140 180 L138 235" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
      <!-- Raised knees on steps -->
      <path d="M82 215 L68 250 L75 330" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M106 215 L124 240 L118 330" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      <!-- Step lines -->
      <line x1="20" y1="235" x2="180" y2="235" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.4" />
      <line x1="30" y1="330" x2="170" y2="330" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.4" />
    `,
  },

  // --- COUPLE ---
  {
    id: 'couple-1',
    name: 'Side-by-Side Lean',
    category: 'Couple',
    description: 'Two people standing closely together with shoulders gently touching and hands intertwined.',
    tip: 'Hold camera at chest height. Tilt heads slightly toward each other.',
    recommendedAngle: 'Chest Level • 1.0x',
    viewBox: '0 0 200 400',
    svgPath: `
      <!-- Partner A (Left) -->
      <circle cx="70" cy="65" r="18" fill="none" stroke="currentColor" stroke-width="3" />
      <path d="M52 98 Q70 94 88 98 L84 195 Q70 198 56 195 Z" fill="none" stroke="currentColor" stroke-width="3" />
      <path d="M56 195 L52 280 L48 365" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
      <path d="M80 195 L76 280 L72 365" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
      <!-- Partner A outer arm -->
      <path d="M52 98 L40 148 L42 205" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />

      <!-- Partner B (Right) -->
      <circle cx="130" cy="72" r="17" fill="none" stroke="currentColor" stroke-width="3" />
      <path d="M112 102 Q130 98 148 102 L144 195 Q130 198 116 195 Z" fill="none" stroke="currentColor" stroke-width="3" />
      <path d="M120 195 L124 280 L128 365" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
      <path d="M144 195 L148 280 L152 365" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
      <!-- Partner B outer arm -->
      <path d="M148 102 L160 148 L158 205" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />

      <!-- Center Joined Arms / Hand Hold -->
      <path d="M88 98 L98 145 L102 185" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      <path d="M112 102 L104 145 L102 185" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      <circle cx="102" cy="186" r="4" fill="currentColor" opacity="0.8" />
    `,
  },
  {
    id: 'couple-2',
    name: 'Romantic Forehead Touch',
    category: 'Couple',
    description: 'Couple facing each other with foreheads gently meeting in an intimate profile silhouette.',
    tip: 'Direct light from the side or back creates stunning profile highlights.',
    recommendedAngle: 'Eye Level • 1.2x',
    viewBox: '0 0 200 400',
    svgPath: `
      <!-- Head 1 Profile (Left) -->
      <ellipse cx="80" cy="80" rx="18" ry="20" fill="none" stroke="currentColor" stroke-width="3" />
      <!-- Head 2 Profile (Right) meeting at center -->
      <ellipse cx="120" cy="84" rx="17" ry="19" fill="none" stroke="currentColor" stroke-width="3" />
      <circle cx="100" cy="78" r="3" fill="currentColor" opacity="0.6" />

      <!-- Torso 1 -->
      <path d="M65 110 L68 210 L88 210 L84 110 Z" fill="none" stroke="currentColor" stroke-width="3" />
      <!-- Torso 2 -->
      <path d="M116 112 L112 210 L132 210 L135 112 Z" fill="none" stroke="currentColor" stroke-width="3" />

      <!-- Arms embracing / waist hold -->
      <path d="M65 110 L50 160 L114 175" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
      <path d="M135 112 L150 160 L86 175" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />

      <!-- Lower bodies -->
      <path d="M72 210 L70 290 L68 365" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
      <path d="M124 210 L126 290 L128 365" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
    `,
  },
  {
    id: 'couple-3',
    name: 'Back Hug Embrace',
    category: 'Couple',
    description: 'One partner standing behind the other with arms softly wrapped around shoulders/waist.',
    tip: 'Photographer stands at 3/4 angle to capture expressions of both subjects.',
    recommendedAngle: 'Waist-to-Chest • 1.0x',
    viewBox: '0 0 200 400',
    svgPath: `
      <!-- Rear partner head (taller, behind) -->
      <circle cx="112" cy="60" r="18" fill="none" stroke="currentColor" stroke-width="3" />
      <path d="M96 90 Q112 86 128 90 L124 175" fill="none" stroke="currentColor" stroke-width="3" />

      <!-- Front partner head -->
      <circle cx="92" cy="78" r="17" fill="none" stroke="currentColor" stroke-width="3.5" />
      <!-- Front partner torso -->
      <path d="M76 106 Q92 102 108 106 L104 200 Q90 204 78 200 Z" fill="none" stroke="currentColor" stroke-width="3.5" />

      <!-- Rear partner arms wrapping around front partner -->
      <path d="M128 90 L132 135 L88 152" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
      <path d="M96 90 L80 125 L102 152" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />

      <!-- Legs -->
      <path d="M82 200 L80 285 L78 365" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
      <path d="M100 200 L102 285 L104 365" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
      <path d="M122 175 L124 285 L126 365" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.6" />
    `,
  },
];
