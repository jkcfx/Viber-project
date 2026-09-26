import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/audio';
import { getFingerForKey } from '../../utils/fingerMap';
import { HandVisualizer } from '../HandVisualizer';
import { KeyboardVisualizer } from '../KeyboardVisualizer';

interface RacerGameProps {
  onWin: () => void;
  racerWins: number;
}

export const RacerGame: React.FC<RacerGameProps> = ({ onWin, racerWins }) => {
  // Racer sentences (fun racing and superhero phrases)
  const tracks = [
    'the fast red car zooms down the highway with incredible speed and turbo power',
    'super hero racers never look down at the steering wheel to keep total focus',
    'practice touch typing everyday to become the champion of the speed tournament',
    'ten fingers work together like ten tiny turbo engines on the keyboard track',
  ];

  const [trackText, setTrackText] = useState<string>(tracks[0]);
  const [botWpm, setBotWpm] = useState<number>(25); // Adjustable bot speed!
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player' | 'bot' | null>(null);

  // Player state
  const [playerIndex, setPlayerIndex] = useState<number>(0);
  const [playerStartTime, setPlayerStartTime] = useState<number | null>(null);
  const [playerWpm, setPlayerWpm] = useState<number>(0);

  // Bot progress (0 to trackText.length)
  const [botProgress, setBotProgress] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const resetRace = () => {
    const nextTrack = tracks[Math.floor(Math.random() * tracks.length)];
    setTrackText(nextTrack);
    setPlayerIndex(0);
    setBotProgress(0);
    setPlayerStartTime(null);
    setPlayerWpm(0);
    setIsFinished(false);
    setWinner(null);
    setIsPlaying(false);
  };

  const startRace = () => {
    resetRace();
    setIsPlaying(true);
    setPlayerStartTime(Date.now());
    if (containerRef.current) {
      containerRef.current.focus();
    }
  };

  // Bot progression loop
  useEffect(() => {
    if (!isPlaying || isFinished) return;

    // Characters per minute = botWpm * 5. Characters per millisecond = (botWpm * 5) / 60000
    const charsPerMs = (botWpm * 5) / 60000;
    const intervalMs = 100;
    const charsPerTick = charsPerMs * intervalMs;

    const timer = setInterval(() => {
      setBotProgress((prev) => {
        const next = prev + charsPerTick;
        if (next >= trackText.length) {
          // Bot crossed finish line!
          setIsFinished(true);
          setIsPlaying(false);
          setWinner('bot');
          soundManager.playError();
          return trackText.length;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, isFinished, botWpm, trackText.length]);

  // Player typing event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isFinished) return;
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;
      if (e.key === ' ' || e.code === 'Space') e.preventDefault();

      const char = e.key;
      const expected = trackText[playerIndex];

      if (char === expected) {
        soundManager.playKey();
        const next = playerIndex + 1;
        setPlayerIndex(next);

        // Update player WPM
        if (playerStartTime) {
          const elapsedMins = (Date.now() - playerStartTime) / 60000;
          const currentWords = next / 5;
          setPlayerWpm(Math.round(currentWords / Math.max(0.01, elapsedMins)));
        }

        // Check if player won!
        if (next >= trackText.length) {
          setIsFinished(true);
          setIsPlaying(false);
          setWinner('player');
          soundManager.playVictory();
          try {
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.6 },
            });
          } catch {
            // Ignore confetti in tests
          }
          onWin();
        }
      } else {
        soundManager.playError();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFinished, playerIndex, trackText, playerStartTime]);

  const targetChar = playerIndex < trackText.length ? trackText[playerIndex] : '';
  const activeFinger = targetChar ? getFingerForKey(targetChar) : null;

  const playerPercent = Math.min(100, (playerIndex / trackText.length) * 100);
  const botPercent = Math.min(100, (botProgress / trackText.length) * 100);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="outline-none flex flex-col gap-6 max-w-5xl mx-auto px-3 sm:px-4 py-3"
    >
      {/* Bot speed control panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-[280px] flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span>🤖</span> 电脑对手挑战车速 (Rival Speed)
            </span>
            <span className="font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              {botWpm} WPM (字/分)
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="80"
            step="5"
            value={botWpm}
            onChange={(e) => setBotWpm(parseInt(e.target.value))}
            disabled={isPlaying}
            className="w-full accent-cyan-500 cursor-pointer"
          />

          <div className="flex items-center gap-1.5">
            {[
              { label: '🦥 慢速树懒 (15 WPM)', val: 15 },
              { label: '🐨 萌萌考拉 (25 WPM)', val: 25 },
              { label: '🐰 飞跃白兔 (40 WPM)', val: 40 },
              { label: '🐆 极速猎豹 (60 WPM)', val: 60 },
            ].map((p) => (
              <button
                key={p.val}
                disabled={isPlaying}
                onClick={() => setBotWpm(p.val)}
                className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                  botWpm === p.val
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Total Trophy count */}
        <div className="flex items-center gap-4 text-xs font-mono bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400">你的当前时速</span>
            <span className="text-base font-bold text-indigo-400">{playerWpm} WPM</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400">冠军奖杯</span>
            <span className="text-base font-bold text-amber-400 flex items-center gap-1">
              <span>🏆</span> {racerWins} 场
            </span>
          </div>
        </div>
      </div>

      {/* Race Track Arena */}
      <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        {/* Track Lines */}
        <div className="flex flex-col gap-6">
          {/* Lane 1: Player Kart */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-300 mb-1.5">
              <span className="flex items-center gap-1">
                <span>🏎️</span> 你的超级战车 (选手)
              </span>
              <span className="font-mono text-slate-400">{Math.round(playerPercent)}%</span>
            </div>

            <div className="relative h-14 bg-slate-900 rounded-2xl border border-slate-800 flex items-center px-2 overflow-hidden">
              {/* Lane dashed mark */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-dashed border-slate-700/60 pointer-events-none" />

              {/* Finish line */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-[repeating-linear-gradient(45deg,#000,#000_6px,#fff_6px,#fff_12px)] opacity-60 flex items-center justify-center">
                <span className="text-xs font-black text-slate-900 bg-white/90 px-0.5 rounded rotate-90">
                  FINISH
                </span>
              </div>

              {/* Player Kart */}
              <div
                className="absolute transition-all duration-100 ease-out flex items-center gap-1 z-10"
                style={{ left: `calc(${playerPercent * 0.88}% + 8px)` }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 shadow-lg shadow-indigo-500/50 flex items-center justify-center text-xl animate-pulse">
                  🏎️
                </div>
                {playerWpm > 0 && (
                  <span className="text-[10px] font-mono font-bold bg-indigo-950 border border-indigo-700 text-indigo-300 px-1.5 py-0.5 rounded shadow">
                    {playerWpm} WPM
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Lane 2: Bot Rival */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-300 mb-1.5">
              <span className="flex items-center gap-1">
                <span>🤖</span> 赛车对手 (目标 {botWpm} WPM)
              </span>
              <span className="font-mono text-slate-400">{Math.round(botPercent)}%</span>
            </div>

            <div className="relative h-14 bg-slate-900 rounded-2xl border border-slate-800 flex items-center px-2 overflow-hidden">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-dashed border-slate-700/60 pointer-events-none" />

              {/* Finish line */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-[repeating-linear-gradient(45deg,#000,#000_6px,#fff_6px,#fff_12px)] opacity-60 flex items-center justify-center">
                <span className="text-xs font-black text-slate-900 bg-white/90 px-0.5 rounded rotate-90">
                  FINISH
                </span>
              </div>

              {/* Bot Kart */}
              <div
                className="absolute transition-all duration-100 ease-out flex items-center gap-1 z-10"
                style={{ left: `calc(${botPercent * 0.88}% + 8px)` }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 shadow-lg shadow-cyan-500/50 flex items-center justify-center text-xl">
                  🚗
                </div>
                <span className="text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-700 text-cyan-300 px-1.5 py-0.5 rounded shadow">
                  {botWpm} WPM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live track text to type */}
        <div className="mt-6 p-4 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-lg sm:text-xl tracking-wide select-none leading-relaxed">
          {trackText.split('').map((char, idx) => {
            const isDone = idx < playerIndex;
            const isCur = idx === playerIndex;
            return (
              <span
                key={idx}
                className={
                  isDone
                    ? 'text-emerald-400'
                    : isCur
                    ? 'bg-indigo-600 text-white rounded px-0.5 animate-pulse font-bold ring-2 ring-indigo-400'
                    : 'text-slate-500'
                }
              >
                {char === ' ' ? '␣' : char}
              </span>
            );
          })}
        </div>

        {/* Start / Finish overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 z-20 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="text-center max-w-sm">
              <div className="text-4xl mb-3">
                {isFinished ? (winner === 'player' ? '🏆' : '🥈') : '🏁'}
              </div>
              <h3 className="text-xl font-bold text-white">
                {isFinished
                  ? winner === 'player'
                    ? '冲线夺冠！胜利属于你！'
                    : '差一点点，电脑对手率先撞线！'
                  : '打字赛车大奖赛'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-5">
                {isFinished
                  ? winner === 'player'
                    ? `你的速度达到了 ${playerWpm} WPM！盲打十指发力，轻松超越对手！`
                    : '对手稍胜一筹。可以调节对手速度为更平缓档位，继续挑战！'
                  : '每敲对一个字母，你的战车就会疾驰向前！十指盲打，冲向终点！'}
              </p>

              <button
                onClick={startRace}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
              >
                {isFinished ? '再来一局极速狂飙 🏎️' : '点火发车！开始比赛 🏎️'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hand & Keyboard Guidance */}
      <HandVisualizer activeFinger={activeFinger} targetKey={targetChar} />
      <KeyboardVisualizer targetKey={targetChar} isBlindShieldActive={false} />
    </div>
  );
};
