import React from 'react';
import { RotateCcw, Home, Award, Sparkles } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewHigh: boolean;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewHigh,
  onRestart,
  onMainMenu,
}) => {
  // Medal calculation
  let medalName = 'Unranked';
  let medalColor = 'text-slate-500';
  let medalBg = 'bg-slate-800/40 border-slate-700/50';

  if (score >= 100) {
    medalName = 'Platinum Legend';
    medalColor = 'text-cyan-300';
    medalBg = 'bg-cyan-950/40 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]';
  } else if (score >= 50) {
    medalName = 'Golden Horizon';
    medalColor = 'text-amber-400';
    medalBg = 'bg-amber-950/40 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]';
  } else if (score >= 25) {
    medalName = 'Silver Ace';
    medalColor = 'text-slate-200';
    medalBg = 'bg-slate-800/60 border-slate-400/40';
  } else if (score >= 10) {
    medalName = 'Bronze Aviator';
    medalColor = 'text-amber-600';
    medalBg = 'bg-amber-950/30 border-amber-700/40';
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3.5 sm:p-5 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-7 max-w-xs sm:max-w-sm w-full max-h-[90dvh] overflow-y-auto shadow-2xl flex flex-col items-center">
        {/* Header Title */}
        <span className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 font-semibold mb-0.5">
          Flight Terminated
        </span>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-white mb-4 sm:mb-5">
          GAME OVER
        </h2>

        {/* Score Card Box */}
        <div className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-5 mb-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="text-xs font-medium text-slate-400">Score</span>
            <span className="text-3xl font-black font-display tabular-nums text-white">
              {score}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-400">Best Record</span>
              {isNewHigh && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 animate-pulse">
                  <Sparkles size={12} />
                  <span>NEW!</span>
                </div>
              )}
            </div>
            <span className="text-xl font-bold font-display tabular-nums text-amber-300">
              {highScore}
            </span>
          </div>

          {/* Medal Tier */}
          <div className={`flex items-center justify-between p-2.5 rounded-xl border ${medalBg} transition-all mt-1`}>
            <div className="flex items-center gap-2">
              <Award size={18} className={medalColor} />
              <span className="text-xs font-medium text-slate-300">Medal Tier</span>
            </div>
            <span className={`text-xs font-bold font-display ${medalColor}`}>
              {medalName}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold font-display text-base rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <RotateCcw size={18} />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={onMainMenu}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white/90 font-medium text-sm rounded-xl border border-white/10 transition-colors cursor-pointer"
          >
            <Home size={16} />
            <span>Main Menu</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 mt-4">
          Press Space or Enter to restart immediately
        </span>
      </div>
    </div>
  );
};
