import { GameSettings, PlayerStats } from '../types/game';
import { DEFAULT_PHYSICS } from '../physics/constants';

const STATS_KEY = 'zephyr_player_stats_v1';
const SETTINGS_KEY = 'zephyr_game_settings_v1';

export const DEFAULT_STATS: PlayerStats = {
  highScore: 0,
  gamesPlayed: 0,
  totalPipesCleared: 0,
  totalFlaps: 0,
  longestRunTime: 0,
  medals: {
    bronze: false,
    silver: false,
    gold: false,
    platinum: false,
  },
};

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: false,
  volume: 0.75,
  themeId: 'dawn-meadow',
  skinId: 'classic-pip',
  assistMode: false,
  physics: { ...DEFAULT_PHYSICS },
};

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      medals: {
        ...DEFAULT_STATS.medals,
        ...(parsed.medals || {}),
      },
    };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function savePlayerStats(stats: PlayerStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // Storage quota or privacy mode error ignored
  }
}

export function loadGameSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      physics: {
        ...DEFAULT_PHYSICS,
        ...(parsed.physics || {}),
      },
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveGameSettings(settings: GameSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage errors ignored
  }
}
