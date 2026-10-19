import React from 'react';
import { X, Trophy, Award, Flame, Compass, Target, CheckCircle2, Lock } from 'lucide-react';
import { PlayerStats } from '../types/game';

interface StatsModalProps {
  stats: PlayerStats;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose }) => {
  const achievements = [
    {
      id: 'first_flight',
      title: 'First Flight',
      desc: 'Take off on your maiden sky voyage',
      unlocked: stats.gamesPlayed >= 1,
      icon: Compass,
    },
    {
      id: 'bronze_aviator',
      title: 'Bronze Aviator',
      desc: 'Achieve a score of 10 or higher',
      unlocked: stats.highScore >= 10,
      icon: Award,
    },
    {
      id: 'silver_ace',
      title: 'Silver Ace',
      desc: 'Navigate safely past 25 pipes in one run',
      unlocked: stats.highScore >= 25,
      icon: Award,
    },
    {
      id: 'golden_horizon',
      title: 'Golden Horizon',
      desc: 'Reach a majestic score of 50',
      unlocked: stats.highScore >= 50,
      icon: Award,
    },
    {
      id: 'platinum_legend',
      title: 'Platinum Legend',
      desc: 'Surpass 100 pipes — master of the skies',
      unlocked: stats.highScore >= 100,
      icon: Trophy,
    },
    {
      id: 'centurion',
      title: 'Century Navigator',
      desc: 'Clear 100 cumulative pipes across all runs',
      unlocked: stats.totalPipesCleared >= 100,
      icon: Target,
    },
    {
      id: 'sky_veteran',
      title: 'Endurance Aviator',
      desc: 'Accumulate over 500 wing flaps',
      unlocked: stats.totalFlaps >= 500,
      icon: Flame,
    },
  ];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm sm:max-w-md w-full max-h-[88dvh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Trophy size={17} className="text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold font-display text-white">Records & Flight Log</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 font-body text-sm">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Highest Score
              </span>
              <span className="text-3xl font-black font-display tabular-nums text-amber-300">
                {stats.highScore}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">Single run record</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Total Flights
              </span>
              <span className="text-3xl font-black font-display tabular-nums text-white">
                {stats.gamesPlayed}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">Missions launched</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Pipes Cleared
              </span>
              <span className="text-3xl font-black font-display tabular-nums text-cyan-300">
                {stats.totalPipesCleared}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">Cumulative passages</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Total Flaps
              </span>
              <span className="text-3xl font-black font-display tabular-nums text-emerald-300">
                {stats.totalFlaps}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">Wings thrust</span>
            </div>
          </div>

          {/* Achievements Checklist */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Aviator Milestones
            </h3>

            <div className="space-y-2">
              {achievements.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      item.unlocked
                        ? 'bg-slate-950/60 border-slate-700/80'
                        : 'bg-slate-950/20 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl ${
                          item.unlocked
                            ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        <IconComponent size={16} />
                      </div>
                      <div>
                        <span
                          className={`font-semibold text-xs block ${
                            item.unlocked ? 'text-white' : 'text-slate-400'
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="text-[11px] text-slate-400">{item.desc}</span>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {item.unlocked ? (
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      ) : (
                        <Lock size={14} className="text-slate-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
