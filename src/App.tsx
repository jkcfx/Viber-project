import React, { useState, useEffect } from 'react';
import { GameMode, SoundEffectType } from './types';
import { Navbar } from './components/Navbar';
import { AcademyMode } from './components/modes/AcademyMode';
import { FallingLettersGame } from './components/modes/FallingLettersGame';
import { RacerGame } from './components/modes/RacerGame';
import { SpeedSprint } from './components/modes/SpeedSprint';
import { GuideModal } from './components/GuideModal';
import { BadgeModal } from './components/BadgeModal';
import { soundManager } from './utils/audio';

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('academy');
  const [soundMode, setSoundMode] = useState<SoundEffectType>('mechanical');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState<boolean>(false);

  // Persistent stats in localStorage
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('typing_completed_lessons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('typing_unlocked_badges');
      return saved ? JSON.parse(saved) : ['badge-first-lesson'];
    } catch {
      return ['badge-first-lesson'];
    }
  });

  const [fallingHighScore, setFallingHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('typing_falling_highscore');
      return saved ? parseInt(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [racerWins, setRacerWins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('typing_racer_wins');
      return saved ? parseInt(saved) : 0;
    } catch {
      return 0;
    }
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('typing_completed_lessons', JSON.stringify(completedLessons));
  }, [completedLessons]);

  useEffect(() => {
    localStorage.setItem('typing_unlocked_badges', JSON.stringify(unlockedBadges));
  }, [unlockedBadges]);

  useEffect(() => {
    localStorage.setItem('typing_falling_highscore', fallingHighScore.toString());
  }, [fallingHighScore]);

  useEffect(() => {
    localStorage.setItem('typing_racer_wins', racerWins.toString());
  }, [racerWins]);

  // Handle lesson completion
  const handleLessonComplete = (lessonId: string, _wpm: number, accuracy: number) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons((prev) => [...prev, lessonId]);
    }

    // Award badges
    const newBadges = [...unlockedBadges];
    if (!newBadges.includes('badge-first-lesson')) {
      newBadges.push('badge-first-lesson');
    }
    if (lessonId === 'home-1' && !newBadges.includes('badge-fj-detective')) {
      newBadges.push('badge-fj-detective');
    }
    if (accuracy >= 98 && !newBadges.includes('badge-combo-master')) {
      newBadges.push('badge-combo-master');
    }
    setUnlockedBadges(newBadges);
  };

  // Handle high score in falling letters game
  const handleUpdateFallingHighScore = (newScore: number) => {
    setFallingHighScore(newScore);
    if (newScore >= 500 && !unlockedBadges.includes('badge-falling-hero')) {
      setUnlockedBadges((prev) => [...prev, 'badge-falling-hero']);
    }
  };

  // Handle win in racer game
  const handleRacerWin = () => {
    setRacerWins((w) => w + 1);
    if (!unlockedBadges.includes('badge-racer-champ')) {
      setUnlockedBadges((prev) => [...prev, 'badge-racer-champ']);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* 3-Zone Top Navigation */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          soundManager.playKey();
        }}
        soundMode={soundMode}
        onSoundChange={(s) => setSoundMode(s)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenBadges={() => setIsBadgesOpen(true)}
        badgeCount={unlockedBadges.length}
      />

      {/* Hero encouragement banner for child */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/80 px-4 py-4 sm:py-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
                🦸
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  快打小超人 · 告别二指禅训练营
                </h1>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  十指标准指法
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                双手指尖找准 F 与 J 定位凸点，眼睛看屏幕不低头，你也能像同学一样飞速盲打！
              </p>
            </div>
          </div>

          {/* Quick stats and guide quick-jump */}
          <div className="flex items-center gap-3 self-end md:self-auto text-xs">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400">已攻克关卡：</span>
              <span className="font-mono font-bold text-emerald-400">
                {completedLessons.length} 关
              </span>
            </div>

            <button
              onClick={() => setIsGuideOpen(true)}
              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-xl transition-colors font-semibold flex items-center gap-1.5"
            >
              <span>👀</span>
              <span>新手必看口诀</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Arena */}
      <main className="flex-1 py-4">
        {currentMode === 'academy' && (
          <AcademyMode
            soundMode={soundMode}
            onLessonComplete={handleLessonComplete}
            completedLessonIds={completedLessons}
          />
        )}

        {currentMode === 'falling' && (
          <FallingLettersGame
            highScore={fallingHighScore}
            onUpdateHighScore={handleUpdateFallingHighScore}
          />
        )}

        {currentMode === 'racer' && (
          <RacerGame onWin={handleRacerWin} racerWins={racerWins} />
        )}

        {currentMode === 'sprint' && <SpeedSprint />}
      </main>

      {/* Quiet educational footer compliant with Section 1B */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>快打小超人 · 专为少儿打造的十指盲打练习应用</span>
          <span>按键时请保持手掌自然悬浮，指腹轻巧着落</span>
        </div>
      </footer>

      {/* Modals */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <BadgeModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
        unlockedBadgeIds={unlockedBadges}
      />
    </div>
  );
}
