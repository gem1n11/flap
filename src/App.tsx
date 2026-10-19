import React, { useState, useEffect, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';
import { GameEngine } from './game/GameEngine';
import { BirdSkin, EnvironmentTheme, GameSettings, GameState, PlayerStats } from './types/game';
import {
  BIRD_SKINS,
  ENVIRONMENT_THEMES,
} from './physics/constants';
import {
  loadGameSettings,
  loadPlayerStats,
  saveGameSettings,
  savePlayerStats,
} from './utils/storage';
import { soundManager } from './audio/soundManager';

export default function App() {
  // Game State
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [score, setScore] = useState<number>(0);
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);

  // Persistence
  const [stats, setStats] = useState<PlayerStats>(loadPlayerStats);
  const [settings, setSettings] = useState<GameSettings>(loadGameSettings);

  // Active Modals
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [milestoneNotification, setMilestoneNotification] = useState<string | null>(null);

  // Engine ref
  const engineRef = useRef<GameEngine | null>(null);

  // Active Skin & Theme lookup
  const currentSkin: BirdSkin =
    BIRD_SKINS.find((s) => s.id === settings.skinId) || BIRD_SKINS[0];

  const currentTheme: EnvironmentTheme =
    ENVIRONMENT_THEMES.find((t) => t.id === settings.themeId) || ENVIRONMENT_THEMES[0];

  // Sync sound manager settings on startup and changes
  useEffect(() => {
    soundManager.setSoundEnabled(settings.soundEnabled);
    soundManager.setVolume(settings.volume);
  }, [settings.soundEnabled, settings.volume]);

  // Handle score updates
  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
  };

  // Handle game over event
  const handleGameOver = (finalScore: number, wasNewHigh: boolean) => {
    setIsNewHigh(wasNewHigh);

    // Update cumulative player stats
    setStats((prev) => {
      const updated: PlayerStats = {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        totalPipesCleared: prev.totalPipesCleared + finalScore,
        highScore: Math.max(prev.highScore, finalScore),
        medals: {
          bronze: prev.medals.bronze || finalScore >= 10,
          silver: prev.medals.silver || finalScore >= 25,
          gold: prev.medals.gold || finalScore >= 50,
          platinum: prev.medals.platinum || finalScore >= 100,
        },
      };
      savePlayerStats(updated);
      return updated;
    });
  };

  // Handle milestone unlock notification
  const handleMedalUnlocked = (medalName: string) => {
    setMilestoneNotification(medalName);
    setTimeout(() => {
      setMilestoneNotification(null);
    }, 3500);
  };

  // State transitions
  const handleStartGame = () => {
    soundManager.playClick();
    if (engineRef.current) {
      engineRef.current.startFromMenu();
    }
  };

  const handleRestart = () => {
    soundManager.playClick();
    if (engineRef.current) {
      engineRef.current.restartRun();
    }
  };

  const handleMainMenu = () => {
    soundManager.playClick();
    if (engineRef.current) {
      engineRef.current.openMenu();
    }
  };

  const handlePauseToggle = () => {
    soundManager.playClick();
    if (engineRef.current) {
      if (gameState === 'PLAYING') {
        engineRef.current.pauseGame();
      } else if (gameState === 'PAUSED') {
        engineRef.current.resumeGame();
      }
    }
  };

  const handleSoundToggle = () => {
    const nextVal = !settings.soundEnabled;
    const updated = { ...settings, soundEnabled: nextVal };
    setSettings(updated);
    saveGameSettings(updated);
    soundManager.setSoundEnabled(nextVal);
  };

  const handleSelectSkin = (skin: BirdSkin) => {
    soundManager.playClick();
    const updated = { ...settings, skinId: skin.id };
    setSettings(updated);
    saveGameSettings(updated);
  };

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    saveGameSettings(newSettings);
  };

  return (
    <div className="relative w-full h-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-slate-950 flex items-center justify-center font-body overscroll-none touch-none select-none">
      {/* Isolated 60fps Game Canvas */}
      <GameCanvas
        currentSkin={currentSkin}
        currentTheme={currentTheme}
        physics={settings.physics}
        assistMode={settings.assistMode}
        highScore={stats.highScore}
        engineRef={engineRef}
        onScoreChange={handleScoreChange}
        onStateChange={setGameState}
        onGameOver={handleGameOver}
        onMedalUnlocked={handleMedalUnlocked}
      />

      {/* Low-Occlusion HUD Overlay */}
      <HUD
        state={gameState}
        score={score}
        highScore={stats.highScore}
        soundEnabled={settings.soundEnabled}
        assistMode={settings.assistMode}
        onPauseToggle={handlePauseToggle}
        onSoundToggle={handleSoundToggle}
      />

      {/* Main Menu Overlay */}
      {gameState === 'MENU' && (
        <MainMenu
          highScore={stats.highScore}
          currentSkin={currentSkin}
          onSelectSkin={handleSelectSkin}
          onStart={handleStartGame}
          onOpenSettings={() => {
            soundManager.playClick();
            setShowSettings(true);
          }}
          onOpenStats={() => {
            soundManager.playClick();
            setShowStats(true);
          }}
          onOpenPhysics={() => {
            soundManager.playClick();
            setShowSettings(true);
          }}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          score={score}
          highScore={stats.highScore}
          isNewHigh={isNewHigh}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Settings & Physics Lab Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          highScore={stats.highScore}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Statistics & Flight Log Modal */}
      {showStats && (
        <StatsModal
          stats={stats}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* In-Game Milestone Notification Toast */}
      {milestoneNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
          <div className="bg-amber-400 text-slate-950 px-4 py-2 rounded-xl font-bold font-display text-xs shadow-xl flex items-center gap-2 border border-amber-300">
            <span>UNLOCKED:</span>
            <span>{milestoneNotification}</span>
          </div>
        </div>
      )}
    </div>
  );
}
