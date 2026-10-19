import React from 'react';
import { X, Volume2, VolumeX, Eye, Palette, Sliders, RotateCcw } from 'lucide-react';
import { EnvironmentTheme, GameSettings, PhysicsConfig } from '../types/game';
import {
  ENVIRONMENT_THEMES,
  DEFAULT_PHYSICS,
  PRACTICE_PHYSICS,
  HARDCORE_PHYSICS,
} from '../physics/constants';

interface SettingsModalProps {
  settings: GameSettings;
  highScore: number;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  highScore,
  onUpdateSettings,
  onClose,
}) => {
  const handleSoundToggle = () => {
    onUpdateSettings({
      ...settings,
      soundEnabled: !settings.soundEnabled,
    });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    onUpdateSettings({
      ...settings,
      volume: vol,
    });
  };

  const handleSelectTheme = (theme: EnvironmentTheme) => {
    onUpdateSettings({
      ...settings,
      themeId: theme.id,
    });
  };

  const handleAssistToggle = () => {
    onUpdateSettings({
      ...settings,
      assistMode: !settings.assistMode,
    });
  };

  const handlePhysicsChange = (key: keyof PhysicsConfig, value: number | boolean) => {
    onUpdateSettings({
      ...settings,
      physics: {
        ...settings.physics,
        [key]: value,
      },
    });
  };

  const handleApplyPreset = (preset: PhysicsConfig) => {
    onUpdateSettings({
      ...settings,
      physics: { ...preset },
    });
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm sm:max-w-md w-full max-h-[88dvh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders size={17} className="text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold font-display text-white">Settings & Audio</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 font-body text-sm">
          {/* Section 1: Audio Controls */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Volume2 size={15} />
              <span>Audio Synthesis</span>
            </h3>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">Sound Effects</span>
                <button
                  onClick={handleSoundToggle}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    settings.soundEnabled
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {settings.soundEnabled ? 'Enabled' : 'Muted'}
                </button>
              </div>

              {settings.soundEnabled && (
                <div className="flex items-center gap-3">
                  <VolumeX size={16} className="text-slate-500 shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.volume}
                    onChange={handleVolumeChange}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <Volume2 size={16} className="text-slate-400 shrink-0" />
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Environment Themes */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Palette size={15} />
              <span>Sky & Atmosphere Themes</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {ENVIRONMENT_THEMES.map((theme) => {
                const isUnlocked = highScore >= theme.unlockScore;
                const isSelected = settings.themeId === theme.id;

                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      if (isUnlocked) handleSelectTheme(theme);
                    }}
                    disabled={!isUnlocked}
                    className={`flex flex-col p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/10'
                        : isUnlocked
                        ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/40'
                        : 'border-slate-800/40 bg-slate-950/20 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {/* Sky mini preview */}
                    <div
                      className="h-10 w-full rounded-lg mb-2 shadow-inner"
                      style={{
                        background: `linear-gradient(to bottom, ${theme.skyGradient[0]}, ${theme.skyGradient[1]})`,
                      }}
                    />
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-xs text-white">
                        {theme.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] text-amber-400 font-bold">Active</span>
                      )}
                      {!isUnlocked && (
                        <span className="text-[10px] text-slate-500">{theme.unlockScore} pts</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Assist & Practice Mode */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Eye size={15} />
              <span>Flight Assistance</span>
            </h3>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="font-medium text-white block">Assist & Practice Mode</span>
                <span className="text-xs text-slate-400">
                  Wider pipe gaps (+30px) and a subtle trajectory aim guide.
                </span>
              </div>
              <button
                onClick={handleAssistToggle}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ml-4 ${
                  settings.assistMode
                    ? 'bg-cyan-400 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.assistMode ? 'Active' : 'Off'}
              </button>
            </div>
          </div>

          {/* Section 4: Physics Lab */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sliders size={15} />
                <span>Physics Lab & Tuning</span>
              </h3>
              <button
                onClick={() => handleApplyPreset(DEFAULT_PHYSICS)}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset Defaults</span>
              </button>
            </div>

            {/* Presets */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => handleApplyPreset(DEFAULT_PHYSICS)}
                className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
              >
                Classic
              </button>
              <button
                onClick={() => handleApplyPreset(PRACTICE_PHYSICS)}
                className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
              >
                Gentle
              </button>
              <button
                onClick={() => handleApplyPreset(HARDCORE_PHYSICS)}
                className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
              >
                Hardcore
              </button>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
              {/* Gravity */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Gravity</span>
                  <span className="font-mono tabular-nums text-white">
                    {settings.physics.gravity} px/s²
                  </span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="1600"
                  step="50"
                  value={settings.physics.gravity}
                  onChange={(e) => handlePhysicsChange('gravity', parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Flap Strength */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Flap Impulse</span>
                  <span className="font-mono tabular-nums text-white">
                    {Math.abs(settings.physics.flapStrength)} px/s
                  </span>
                </div>
                <input
                  type="range"
                  min="220"
                  max="460"
                  step="10"
                  value={Math.abs(settings.physics.flapStrength)}
                  onChange={(e) => handlePhysicsChange('flapStrength', -parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Pipe Gap */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Pipe Gap Size</span>
                  <span className="font-mono tabular-nums text-white">
                    {settings.physics.gapSize} px
                  </span>
                </div>
                <input
                  type="range"
                  min="110"
                  max="180"
                  step="5"
                  value={settings.physics.gapSize}
                  onChange={(e) => handlePhysicsChange('gapSize', parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Moving Obstacles Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-xs">Dynamic Moving Pipes (at score 12+)</span>
                <input
                  type="checkbox"
                  checked={settings.physics.dynamicMovingPipes}
                  onChange={(e) => handlePhysicsChange('dynamicMovingPipes', e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-display rounded-xl transition-colors cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
