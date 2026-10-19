export type GameState = 'MENU' | 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface BirdSkin {
  id: string;
  name: string;
  description: string;
  bodyColor: string;
  bellyColor: string;
  wingColor: string;
  beakColor: string;
  eyeColor: string;
  gogglesColor?: string;
  trailColor: string;
  unlockScore: number;
}

export interface EnvironmentTheme {
  id: string;
  name: string;
  skyGradient: [string, string];
  cloudColor: string;
  mountainColor: string;
  hillColor: string;
  groundTopColor: string;
  groundBodyColor: string;
  pipeMainColor: string;
  pipeLipColor: string;
  pipeTrimColor: string;
  nightMode: boolean;
  unlockScore: number;
}

export interface PhysicsConfig {
  gravity: number;
  flapStrength: number;
  maxFallSpeed: number;
  pipeSpeed: number;
  gapSize: number;
  birdRadius: number;
  dynamicMovingPipes: boolean;
}

export interface PipePair {
  id: number;
  x: number;
  topHeight: number;
  bottomY: number;
  gap: number;
  width: number;
  passed: boolean;
  scored: boolean;
  isMoving: boolean;
  verticalOffset: number;
  verticalSpeed: number;
  minOffset: number;
  maxOffset: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  shape: 'circle' | 'feather' | 'star' | 'dust';
  rotation: number;
  vRot: number;
}

export interface PlayerStats {
  highScore: number;
  gamesPlayed: number;
  totalPipesCleared: number;
  totalFlaps: number;
  longestRunTime: number; // in seconds
  medals: {
    bronze: boolean;   // 10+
    silver: boolean;   // 25+
    gold: boolean;     // 50+
    platinum: boolean; // 100+
  };
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  themeId: string;
  skinId: string;
  assistMode: boolean; // wider gaps, gentle ghost guide
  physics: PhysicsConfig;
}
