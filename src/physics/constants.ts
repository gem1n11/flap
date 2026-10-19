import { BirdSkin, EnvironmentTheme, PhysicsConfig } from '../types/game';

// Logical reference coordinate space
export const VIRTUAL_WIDTH = 400;
export const DEFAULT_VIRTUAL_HEIGHT = 640;
export const GROUND_HEIGHT = 76;

export function calculateVirtualDimensions(containerW: number, containerH: number) {
  const width = VIRTUAL_WIDTH;
  if (!containerW || !containerH) {
    return {
      width,
      height: DEFAULT_VIRTUAL_HEIGHT,
      playableHeight: DEFAULT_VIRTUAL_HEIGHT - GROUND_HEIGHT,
    };
  }
  const ratio = containerH / containerW;
  // Android portrait ratios typically range from 1.5 (budget/foldable) to 2.25 (tall 20:9/21:9)
  const clampedRatio = Math.max(1.4, Math.min(2.35, ratio));
  const height = Math.round(width * clampedRatio);
  return {
    width,
    height,
    playableHeight: height - GROUND_HEIGHT,
  };
}

export const DEFAULT_PHYSICS: PhysicsConfig = {
  gravity: 1100,            // px / s^2
  flapStrength: -340,       // px / s upward impulse
  maxFallSpeed: 520,        // terminal velocity px / s
  pipeSpeed: 145,           // px / s horizontal velocity
  gapSize: 138,             // vertical gap between pipe pair
  birdRadius: 14,           // fair collision radius
  dynamicMovingPipes: true, // enabled past score 15
};

export const PRACTICE_PHYSICS: PhysicsConfig = {
  gravity: 850,
  flapStrength: -290,
  maxFallSpeed: 380,
  pipeSpeed: 110,
  gapSize: 165,
  birdRadius: 12,
  dynamicMovingPipes: false,
};

export const HARDCORE_PHYSICS: PhysicsConfig = {
  gravity: 1300,
  flapStrength: -360,
  maxFallSpeed: 620,
  pipeSpeed: 175,
  gapSize: 120,
  birdRadius: 14,
  dynamicMovingPipes: true,
};

export const BIRD_SKINS: BirdSkin[] = [
  {
    id: 'classic-pip',
    name: 'Pip the Aviator',
    description: 'The plucky canary with leather aviator goggles and red scarf.',
    bodyColor: '#FBBF24',
    bellyColor: '#FEF3C7',
    wingColor: '#F59E0B',
    beakColor: '#EA580C',
    eyeColor: '#1E293B',
    gogglesColor: '#92400E',
    trailColor: '#FDE68A',
    unlockScore: 0,
  },
  {
    id: 'cyber-finch',
    name: 'Volt Cyber-Bird',
    description: 'Futuristic high-altitude drone bird with a glowing cyan visor.',
    bodyColor: '#06B6D4',
    bellyColor: '#E0F2FE',
    wingColor: '#0284C7',
    beakColor: '#38BDF8',
    eyeColor: '#FFFFFF',
    gogglesColor: '#0EA5E9',
    trailColor: '#67E8F9',
    unlockScore: 10,
  },
  {
    id: 'sol-phoenix',
    name: 'Sol Phoenix',
    description: 'Blazing ember-feathered bird forged from solar flares.',
    bodyColor: '#EF4444',
    bellyColor: '#FED7AA',
    wingColor: '#DC2626',
    beakColor: '#F97316',
    eyeColor: '#450A0A',
    gogglesColor: '#B91C1C',
    trailColor: '#F87171',
    unlockScore: 25,
  },
  {
    id: 'bubble-teal',
    name: 'Bubble Finch',
    description: 'Pastel dream bird that leaves soft shimmering bubble sparkles.',
    bodyColor: '#10B981',
    bellyColor: '#D1FAE5',
    wingColor: '#059669',
    beakColor: '#F472B6',
    eyeColor: '#064E3B',
    gogglesColor: '#EC4899',
    trailColor: '#A7F3D0',
    unlockScore: 50,
  },
  {
    id: 'night-owl',
    name: 'Obsidian Owl',
    description: 'Nocturnal stealth aviator with gleaming golden eyes.',
    bodyColor: '#334155',
    bellyColor: '#94A3B8',
    wingColor: '#1E293B',
    beakColor: '#FBBF24',
    eyeColor: '#FDE047',
    gogglesColor: '#475569',
    trailColor: '#CBD5E1',
    unlockScore: 75,
  },
];

export const ENVIRONMENT_THEMES: EnvironmentTheme[] = [
  {
    id: 'dawn-meadow',
    name: 'Dawn Meadow',
    skyGradient: ['#38BDF8', '#BAE6FD'],
    cloudColor: 'rgba(255, 255, 255, 0.75)',
    mountainColor: '#7DD3FC',
    hillColor: '#86EFAC',
    groundTopColor: '#4ADE80',
    groundBodyColor: '#D97706',
    pipeMainColor: '#22C55E',
    pipeLipColor: '#16A34A',
    pipeTrimColor: '#15803D',
    nightMode: false,
    unlockScore: 0,
  },
  {
    id: 'sunset-skyline',
    name: 'Sunset Skyline',
    skyGradient: ['#F97316', '#FDE047'],
    cloudColor: 'rgba(255, 237, 213, 0.65)',
    mountainColor: '#FB923C',
    hillColor: '#F43F5E',
    groundTopColor: '#BE185D',
    groundBodyColor: '#78350F',
    pipeMainColor: '#D97706',
    pipeLipColor: '#B45309',
    pipeTrimColor: '#78350F',
    nightMode: false,
    unlockScore: 15,
  },
  {
    id: 'cyber-neon',
    name: 'Midnight Cyber',
    skyGradient: ['#0B0F19', '#1E1B4B'],
    cloudColor: 'rgba(99, 102, 241, 0.3)',
    mountainColor: '#312E81',
    hillColor: '#4338CA',
    groundTopColor: '#06B6D4',
    groundBodyColor: '#0F172A',
    pipeMainColor: '#6366F1',
    pipeLipColor: '#4F46E5',
    pipeTrimColor: '#A855F7',
    nightMode: true,
    unlockScore: 35,
  },
  {
    id: 'starlight-aurora',
    name: 'Boreal Aurora',
    skyGradient: ['#030712', '#064E3B'],
    cloudColor: 'rgba(52, 211, 153, 0.35)',
    mountainColor: '#065F46',
    hillColor: '#047857',
    groundTopColor: '#10B981',
    groundBodyColor: '#064E3B',
    pipeMainColor: '#14B8A6',
    pipeLipColor: '#0D9488',
    pipeTrimColor: '#042F2E',
    nightMode: true,
    unlockScore: 60,
  },
];
