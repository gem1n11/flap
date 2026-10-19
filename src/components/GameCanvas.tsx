import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import { BirdSkin, EnvironmentTheme, GameState, PhysicsConfig } from '../types/game';

interface GameCanvasProps {
  currentSkin: BirdSkin;
  currentTheme: EnvironmentTheme;
  physics: PhysicsConfig;
  assistMode: boolean;
  highScore: number;
  engineRef: React.MutableRefObject<GameEngine | null>;
  onScoreChange: (score: number) => void;
  onStateChange: (state: GameState) => void;
  onGameOver: (score: number, isNewHigh: boolean) => void;
  onMedalUnlocked: (medalName: string) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentSkin,
  currentTheme,
  physics,
  assistMode,
  highScore,
  engineRef,
  onScoreChange,
  onStateChange,
  onGameOver,
  onMedalUnlocked,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const initialWidth = container.clientWidth || 360;
    const initialHeight = container.clientHeight || 640;

    const engine = new GameEngine(
      canvas,
      {
        onScoreChange,
        onStateChange,
        onGameOver,
        onMedalUnlocked,
      },
      highScore
    );

    engine.resize(initialWidth, initialHeight);
    engineRef.current = engine;

    engine.setSkin(currentSkin);
    engine.setTheme(currentTheme);
    engine.setPhysics(physics);
    engine.setAssistMode(assistMode);
    engine.setHighScore(highScore);

    // Resize observer to adapt dynamically to every Android phone screen
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          engine.resize(width, height);
        }
      }
    });

    resizeObserver.observe(container);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        engine.handleFlap();
      } else if (e.code === 'Escape') {
        const state = engine.getState();
        if (state === 'PLAYING') {
          engine.pauseGame();
        } else if (state === 'PAUSED') {
          engine.resumeGame();
        }
      } else if (e.code === 'Enter') {
        const state = engine.getState();
        if (state === 'MENU' || state === 'GAME_OVER') {
          engine.handleFlap();
        }
      }
    };

    const handleWindowBlur = () => {
      if (engine.getState() === 'PLAYING') {
        engine.pauseGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleWindowBlur);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Sync props to engine
  useEffect(() => {
    if (engineRef.current) engineRef.current.setSkin(currentSkin);
  }, [currentSkin]);

  useEffect(() => {
    if (engineRef.current) engineRef.current.setTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    if (engineRef.current) engineRef.current.setPhysics(physics);
  }, [physics]);

  useEffect(() => {
    if (engineRef.current) engineRef.current.setAssistMode(assistMode);
  }, [assistMode]);

  useEffect(() => {
    if (engineRef.current) engineRef.current.setHighScore(highScore);
  }, [highScore]);

  // Click & Touch input handler on canvas
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (engineRef.current) {
      engineRef.current.handleFlap();
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className="relative w-full h-full max-w-md mx-auto overflow-hidden bg-slate-950 flex items-center justify-center select-none touch-none"
    >
      {/* Canvas stretches edge-to-edge across any portrait Android screen */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-pointer touch-none select-none"
        style={{
          imageRendering: 'crisp-edges',
        }}
      />
    </div>
  );
};
