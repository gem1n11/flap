import React from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { GameState } from '../types/game';

interface HUDProps {
  state: GameState;
  score: number;
  highScore: number;
  soundEnabled: boolean;
  assistMode: boolean;
  onPauseToggle: () => void;
  onSoundToggle: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  state,
  score,
  highScore,
  soundEnabled,
  assistMode,
  onPauseToggle,
  onSoundToggle,
}) => {
  if (state === 'MENU') return null;

  return (
    <div className="absolute inset-0 max-w-md mx-auto pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] select-none">
      {/* Top Status Perimeter Cluster */}
      <div className="flex items-center justify-between w-full">
        {/* Left: High score indicator & assist badge */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-white/70">
              Best
            </span>
            <span className="text-xs sm:text-sm font-bold font-display tabular-nums text-amber-300 drop-shadow-md">
              {highScore}
            </span>
          </div>

          {assistMode && (
            <span className="text-[9px] font-medium text-cyan-200 bg-cyan-950/70 border border-cyan-500/30 px-1.5 py-0.5 rounded">
              Assist
            </span>
          )}
        </div>

        {/* Center: Large Low-Occlusion Score Display */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[max(0.75rem,env(safe-area-inset-top))] flex flex-col items-center">
          <span className="text-4xl sm:text-5xl font-black font-display tabular-nums text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            {score}
          </span>
        </div>

        {/* Right: Quick Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={onSoundToggle}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-white/80 active:text-white bg-black/40 active:bg-black/60 border border-white/10 rounded-lg transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {(state === 'PLAYING' || state === 'PAUSED') && (
            <button
              onClick={onPauseToggle}
              aria-label={state === 'PAUSED' ? 'Resume game' : 'Pause game'}
              className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-white/80 active:text-white bg-black/40 active:bg-black/60 border border-white/10 rounded-lg transition-colors cursor-pointer"
            >
              {state === 'PAUSED' ? <Play size={16} /> : <Pause size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Ready State Floating Instruction */}
      {state === 'READY' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12">
          <div className="bg-black/50 border border-white/15 px-5 py-2.5 rounded-xl flex flex-col items-center shadow-lg">
            <span className="text-base sm:text-lg font-bold font-display text-white tracking-wide">
              Tap Anywhere to Fly
            </span>
            <span className="text-[11px] text-white/70 mt-0.5 font-body">
              Navigate between pipe conduits
            </span>
          </div>
        </div>
      )}

      {/* Paused State Overlay */}
      {state === 'PAUSED' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto bg-black/60 z-30 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col items-center max-w-xs w-full shadow-2xl">
            <h2 className="text-xl font-bold font-display text-white mb-1.5">Game Paused</h2>
            <p className="text-xs text-slate-400 mb-5 font-body text-center">
              Tap resume to continue your run.
            </p>

            <button
              onClick={onPauseToggle}
              className="w-full py-3 px-4 bg-amber-500 active:bg-amber-400 text-slate-950 font-bold font-display rounded-xl transition-all shadow-md cursor-pointer"
            >
              Resume Flight
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
