import React from 'react';
import { GameMode, SoundEffectType } from '../types';
import { soundManager } from '../utils/audio';

interface NavbarProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  soundMode: SoundEffectType;
  onSoundChange: (sound: SoundEffectType) => void;
  onOpenGuide: () => void;
  onOpenBadges: () => void;
  badgeCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  soundMode,
  onSoundChange,
  onOpenGuide,
  onOpenBadges,
  badgeCount,
}) => {
  const navItems: { mode: GameMode; label: string; icon: string }[] = [
    { mode: 'academy', label: '指法闯关学院', icon: '🎓' },
    { mode: 'falling', label: '太空掉落大战', icon: '🚀' },
    { mode: 'racer', label: '赛车大奖赛', icon: '🏎️' },
    { mode: 'sprint', label: '1分钟极速盲测', icon: '⚡' },
  ];

  const handleSoundCycle = () => {
    const list: SoundEffectType[] = ['mechanical', 'bubble', 'typewriter', 'mute'];
    const idx = list.indexOf(soundMode);
    const next = list[(idx + 1) % list.length];
    onSoundChange(next);
    soundManager.setMode(next);
    if (next !== 'mute') {
      soundManager.playKey();
    }
  };

  const getSoundLabel = (s: SoundEffectType) => {
    switch (s) {
      case 'mechanical':
        return '机械轴音';
      case 'bubble':
        return '萌萌气泡';
      case 'typewriter':
        return '复古打字机';
      case 'mute':
        return '静音';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectMode('academy')}
          className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center text-white text-base shadow-sm">
            ⌨️
          </span>
          <span className="bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            快打小超人
          </span>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const isActive = currentMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => onSelectMode(item.mode)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle Button */}
          <button
            onClick={handleSoundCycle}
            className="px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="点击切换打字音效"
          >
            <span>{soundMode === 'mute' ? '🔇' : '🔊'}</span>
            <span className="hidden sm:inline">{getSoundLabel(soundMode)}</span>
          </button>

          {/* Touch Typing Guide Modal Button */}
          <button
            onClick={onOpenGuide}
            className="px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
            title="盲打秘籍与坐姿指法"
          >
            <span>📖</span>
            <span className="hidden sm:inline">指法宝典</span>
          </button>

          {/* Badges / Achievements Button */}
          <button
            onClick={onOpenBadges}
            className="px-3 py-1.5 text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="查看已解锁成就"
          >
            <span>🏆</span>
            <span className="font-semibold">{badgeCount}</span>
            <span className="hidden sm:inline">勋章</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-slate-800/60 bg-slate-950 gap-1 scrollbar-none">
        {navItems.map((item) => {
          const isActive = currentMode === item.mode;
          return (
            <button
              key={item.mode}
              onClick={() => onSelectMode(item.mode)}
              className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-1 ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
