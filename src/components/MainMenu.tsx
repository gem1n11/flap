import React from 'react';
import { Play, Settings, Trophy, Sliders, Check, Lock } from 'lucide-react';
import { BirdSkin } from '../types/game';
import { BIRD_SKINS } from '../physics/constants';

interface MainMenuProps {
  highScore: number;
  currentSkin: BirdSkin;
  onSelectSkin: (skin: BirdSkin) => void;
  onStart: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onOpenPhysics: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  highScore,
  currentSkin,
  onSelectSkin,
  onStart,
  onOpenSettings,
  onOpenStats,
  onOpenPhysics,
}) => {
  return (
    <div className="absolute inset-0 max-w-md mx-auto z-20 flex flex-col justify-between p-3.5 sm:p-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] select-none pointer-events-none">
      {/* Top Bar with Brand & Best Score */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-white/70 font-semibold">
            Arcade Edition
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/80">
          <span className="text-[11px] text-white/60">Best</span>
          <span className="text-sm sm:text-base font-bold font-display tabular-nums text-amber-300">
            {highScore} pts
          </span>
        </div>
      </div>

      {/* Hero Centerpiece & Title Lockup */}
      <div className="flex flex-col items-center justify-center my-auto pointer-events-auto py-2">
        {/* Inline SVG Title Lockup */}
        <div className="mb-1 w-full flex justify-center">
          <svg
            className="w-56 sm:w-72 max-w-[85vw] h-auto drop-shadow-[0_6px_20px_rgba(0,0,0,0.5)]"
            viewBox="0 0 360 84"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M32 46C18 36 28 18 56 22C42 26 38 34 32 46Z"
              fill="#F59E0B"
            />
            <path
              d="M24 50C10 42 16 28 40 32C28 36 26 42 24 50Z"
              fill="#FBBF24"
            />
            <text
              x="52"
              y="48"
              fill="url(#titleGradient)"
              fontSize="44"
              fontWeight="900"
              fontFamily="Outfit, sans-serif"
              letterSpacing="2"
            >
              ZEPHYR
            </text>
            <text
              x="54"
              y="70"
              fill="#FEF08A"
              fontSize="14"
              fontWeight="700"
              fontFamily="Outfit, sans-serif"
              letterSpacing="6"
            >
              MODERN FLAP
            </text>
            <defs>
              <linearGradient id="titleGradient" x1="0" y1="10" x2="0" y2="55" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFFFF" />
                <stop offset="0.6" stopColor="#FDE047" />
                <stop offset="1" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <p className="text-[11px] sm:text-xs text-white/80 max-w-[260px] text-center mb-4 sm:mb-5 font-body">
          Responsive physics & procedural skies.
        </p>

        {/* Primary Start CTA */}
        <button
          onClick={onStart}
          className="group relative flex items-center justify-center gap-2.5 w-56 sm:w-64 py-3 sm:py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-400 active:from-amber-400 active:to-amber-300 text-slate-950 font-extrabold font-display text-base sm:text-lg rounded-2xl shadow-lg shadow-amber-500/30 transition-all cursor-pointer"
        >
          <Play size={18} className="fill-slate-950" />
          <span>START FLIGHT</span>
        </button>

        {/* Flat Single Control Hint Line */}
        <div className="mt-2.5 text-[10px] sm:text-[11px] text-white/70 font-medium tracking-wide">
          Tap anywhere or Space to Fly
        </div>
      </div>

      {/* Bottom Area: Skin Selector & Toolbar */}
      <div className="flex flex-col gap-2.5 pointer-events-auto w-full">
        {/* Avian Hangar / Skin Selector */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-2 sm:p-2.5">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">
              Avian Hangar
            </span>
            <span className="text-[10px] text-amber-300 font-medium">
              {currentSkin.name}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {BIRD_SKINS.map((skin) => {
              const isUnlocked = highScore >= skin.unlockScore;
              const isSelected = currentSkin.id === skin.id;

              return (
                <button
                  key={skin.id}
                  onClick={() => {
                    if (isUnlocked) onSelectSkin(skin);
                  }}
                  disabled={!isUnlocked}
                  title={isUnlocked ? skin.name : `Unlocks at ${skin.unlockScore} pts`}
                  className={`relative flex flex-col items-center justify-center p-1.5 rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400/20 border border-amber-400 shadow-xs'
                      : isUnlocked
                      ? 'bg-white/5 border border-white/10 active:bg-white/15'
                      : 'bg-black/30 border border-white/5 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full mb-1 shadow-inner flex items-center justify-center shrink-0"
                    style={{ backgroundColor: skin.bodyColor }}
                  >
                    {isSelected && <Check size={10} className="text-slate-950 font-bold" />}
                    {!isUnlocked && <Lock size={8} className="text-white/80" />}
                  </div>

                  <span className="text-[8px] sm:text-[9px] font-medium text-white/80 truncate w-full text-center">
                    {skin.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onOpenStats}
            className="flex items-center justify-center gap-1 py-2 px-2 text-[11px] font-semibold text-white/90 bg-white/10 active:bg-white/20 border border-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <Trophy size={13} className="text-amber-300 shrink-0" />
            <span className="truncate">Records</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-1 py-2 px-2 text-[11px] font-semibold text-white/90 bg-white/10 active:bg-white/20 border border-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <Settings size={13} className="text-slate-300 shrink-0" />
            <span className="truncate">Themes</span>
          </button>

          <button
            onClick={onOpenPhysics}
            className="flex items-center justify-center gap-1 py-2 px-2 text-[11px] font-semibold text-white/90 bg-white/10 active:bg-white/20 border border-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <Sliders size={13} className="text-cyan-300 shrink-0" />
            <span className="truncate">Physics</span>
          </button>
        </div>
      </div>
    </div>
  );
};
