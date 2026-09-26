import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/audio';
import { getFingerForKey } from '../../utils/fingerMap';
import { KeyboardVisualizer } from '../KeyboardVisualizer';
import { HandVisualizer } from '../HandVisualizer';

interface FallingItem {
  id: number;
  text: string;
  x: number; // percentage 5% to 85%
  y: number; // percentage 0% to 100%
  speed: number;
  color: string;
}

interface FallingLettersGameProps {
  highScore: number;
  onUpdateHighScore: (score: number) => void;
}

export const FallingLettersGame: React.FC<FallingLettersGameProps> = ({
  highScore,
  onUpdateHighScore,
}) => {
  // Game states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);

  // Speed controls: adjustable speed!
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [gameDifficulty, setGameDifficulty] = useState<'letters' | 'words'>('letters');

  // Falling objects
  const [items, setItems] = useState<FallingItem[]>([]);
  const nextItemId = useRef<number>(1);

  // Active target & laser blast effects
  const [currentTargetChar, setCurrentTargetChar] = useState<string>('');
  const [lastBlast, setLastBlast] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-defined vocabulary for falling items
  const letterPool = 'asdfjkl;qweruiopzxcvbnm';
  const wordPool = [
    'cat', 'dog', 'star', 'sun', 'moon', 'fast', 'play', 'game', 'hero',
    'fish', 'bird', 'lion', 'jump', 'cool', 'ship', 'code', 'book', 'fire',
  ];

  // Spawn an item
  const spawnItem = () => {
    let text = '';
    if (gameDifficulty === 'letters') {
      text = letterPool[Math.floor(Math.random() * letterPool.length)];
    } else {
      text = wordPool[Math.floor(Math.random() * wordPool.length)];
    }

    const newItem: FallingItem = {
      id: nextItemId.current++,
      text,
      x: 8 + Math.random() * 75,
      y: 0,
      speed: (0.35 + Math.random() * 0.25) * speedMultiplier,
      color: ['#38bdf8', '#4ade80', '#fbbf24', '#f472b6', '#a78bfa'][Math.floor(Math.random() * 5)],
    };

    setItems((prev) => [...prev, newItem]);
  };

  // Start game
  const handleStartGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setLives(3);
    setCombo(0);
    setMaxCombo(0);
    setItems([]);
    if (containerRef.current) {
      containerRef.current.focus();
    }
  };

  // Game loop tick
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    // Item spawner timer
    const spawnInterval = Math.max(1000, 2400 / speedMultiplier);
    const spawner = setInterval(() => {
      setItems((prev) => {
        if (prev.length < 5) {
          let text = '';
          if (gameDifficulty === 'letters') {
            text = letterPool[Math.floor(Math.random() * letterPool.length)];
          } else {
            text = wordPool[Math.floor(Math.random() * wordPool.length)];
          }
          const newItem: FallingItem = {
            id: nextItemId.current++,
            text,
            x: 8 + Math.random() * 75,
            y: 0,
            speed: (0.35 + Math.random() * 0.25) * speedMultiplier,
            color: ['#38bdf8', '#4ade80', '#fbbf24', '#f472b6', '#a78bfa'][Math.floor(Math.random() * 5)],
          };
          return [...prev, newItem];
        }
        return prev;
      });
    }, spawnInterval);

    // Frame movement ticker
    const ticker = setInterval(() => {
      setItems((prevItems) => {
        const nextItems: FallingItem[] = [];
        let lostLife = false;

        for (const item of prevItems) {
          const nextY = item.y + item.speed * 0.9;
          if (nextY >= 92) {
            // Hit ground!
            lostLife = true;
          } else {
            nextItems.push({ ...item, y: nextY });
          }
        }

        if (lostLife) {
          soundManager.playError();
          setCombo(0);
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setIsGameOver(true);
              setIsPlaying(false);
              return 0;
            }
            return nextL;
          });
        }

        return nextItems;
      });
    }, 50);

    return () => {
      clearInterval(spawner);
      clearInterval(ticker);
    };
  }, [isPlaying, isGameOver, speedMultiplier, gameDifficulty]);

  // Update target char for visual keyboard/hand hints based on lowest falling item
  useEffect(() => {
    if (items.length > 0) {
      // Find lowest item (highest y)
      const sorted = [...items].sort((a, b) => b.y - a.y);
      const lowest = sorted[0];
      if (lowest && lowest.text.length > 0) {
        setCurrentTargetChar(lowest.text[0]);
      }
    } else {
      setCurrentTargetChar('');
    }
  }, [items]);

  // Handle typing input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;
      if (e.key === ' ' || e.code === 'Space') e.preventDefault();

      const pressed = e.key.toLowerCase();

      // Check if matches the next expected letter of any falling item, prioritize lowest item
      setItems((prevItems) => {
        if (prevItems.length === 0) return prevItems;

        // Sort items by y descending (lowest first)
        const sorted = [...prevItems].sort((a, b) => b.y - a.y);
        const matchIdx = sorted.findIndex((it) => it.text.toLowerCase().startsWith(pressed));

        if (matchIdx !== -1) {
          const target = sorted[matchIdx];
          soundManager.playLaser();

          setLastBlast({ x: target.x, y: target.y });
          setTimeout(() => setLastBlast(null), 300);

          const newCombo = combo + 1;
          setCombo(newCombo);
          if (newCombo > maxCombo) setMaxCombo(newCombo);
          if (newCombo % 5 === 0) soundManager.playCombo(newCombo);

          const points = (gameDifficulty === 'letters' ? 10 : 30) + newCombo * 2;
          const newScore = score + points;
          setScore(newScore);
          if (newScore > highScore) {
            onUpdateHighScore(newScore);
          }

          // If word, remove first letter, if only 1 letter remains, destroy item
          if (target.text.length > 1) {
            const updated = { ...target, text: target.text.slice(1) };
            return prevItems.map((it) => (it.id === target.id ? updated : it));
          } else {
            // Destroyed item
            return prevItems.filter((it) => it.id !== target.id);
          }
        } else {
          // Missed keystroke
          soundManager.playError();
          setCombo(0);
          return prevItems;
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, combo, maxCombo, score, highScore, gameDifficulty]);

  const activeFinger = currentTargetChar ? getFingerForKey(currentTargetChar) : null;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="outline-none flex flex-col gap-5 max-w-5xl mx-auto px-3 sm:px-4 py-3"
    >
      {/* Top Controller: Speed adjustment and difficulty */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Speed Adjustment: Presets + Slider */}
        <div className="flex flex-col gap-2 min-w-[280px] flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span>⚡</span> 掉落速度调节 (Speed Control)
            </span>
            <span className="font-mono text-indigo-400 font-bold bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
              {speedMultiplier.toFixed(1)}x 速度
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.4"
              max="2.6"
              step="0.1"
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
              disabled={isPlaying}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {[
              { label: '🐢 慢速微风', val: 0.6 },
              { label: '🐰 标准节奏', val: 1.0 },
              { label: '🐆 极速飞奔', val: 1.6 },
              { label: '🚀 闪电超音', val: 2.2 },
            ].map((p) => (
              <button
                key={p.val}
                disabled={isPlaying}
                onClick={() => setSpeedMultiplier(p.val)}
                className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                  Math.abs(speedMultiplier - p.val) < 0.05
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Item Content: Letters vs Words */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-slate-400 font-medium">挑战模式：</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              disabled={isPlaying}
              onClick={() => setGameDifficulty('letters')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                gameDifficulty === 'letters'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              单字母突击 (推荐初学)
            </button>
            <button
              disabled={isPlaying}
              onClick={() => setGameDifficulty('words')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                gameDifficulty === 'words'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              趣味单词库 (连贯敲打)
            </button>
          </div>
        </div>

        {/* Game Stats Badge */}
        <div className="flex items-center gap-4 text-xs font-mono bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400">当前得分</span>
            <span className="text-base font-bold text-amber-400">{score}</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400">历史最高</span>
            <span className="text-base font-bold text-emerald-400">{highScore}</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400">护盾生命</span>
            <span className="text-sm font-bold text-rose-400">
              {'❤️'.repeat(lives) || '💔'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Arcade Canvas */}
      <div className="relative w-full h-[360px] sm:h-[400px] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between">
        {/* Starry Sky Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950 pointer-events-none"></div>

        {/* Floating meteor objects */}
        {isPlaying &&
          items.map((item) => (
            <div
              key={item.id}
              className="absolute transition-all duration-75 flex flex-col items-center"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
              }}
            >
              <div
                className="px-3.5 py-1.5 rounded-xl font-mono font-black text-lg md:text-xl shadow-lg border border-white/20 flex items-center justify-center animate-pulse"
                style={{
                  backgroundColor: item.color,
                  color: '#0f172a',
                  boxShadow: `0 0 16px ${item.color}`,
                }}
              >
                {item.text.toUpperCase()}
              </div>
              <div className="w-0.5 h-3 bg-white/20 -mt-1"></div>
            </div>
          ))}

        {/* Laser Blast animation */}
        {lastBlast && (
          <div
            className="absolute pointer-events-none w-10 h-10 -ml-5 -mt-5 rounded-full border-2 border-amber-300 bg-amber-400/40 animate-ping"
            style={{
              left: `${lastBlast.x}%`,
              top: `${lastBlast.y}%`,
            }}
          />
        )}

        {/* City Shield Base */}
        <div className="relative z-10 w-full mt-auto bg-slate-900/90 border-t-2 border-indigo-500/60 p-2.5 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping"></span>
            <span className="font-semibold text-white">城市防御阵线 (防守线)</span>
          </div>

          {combo > 2 && (
            <div className="font-mono font-bold text-orange-400 text-sm animate-bounce">
              🔥 {combo} 连击！
            </div>
          )}

          <div className="text-[11px] text-slate-400">
            字母触碰底线会扣除 1 点护盾
          </div>
        </div>

        {/* Start Game or Game Over Screen Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 z-20 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="text-center max-w-sm">
              <div className="text-4xl mb-3">{isGameOver ? '💥' : '🚀'}</div>
              <h3 className="text-xl font-bold text-white">
                {isGameOver ? '城市防线告急！' : '太空掉落字母保卫战'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-5">
                {isGameOver
                  ? `本次获得 ${score} 分！最高连击 ${maxCombo} 次。速度调慢一点再来？`
                  : '字母如陨石般落下，眼睛看屏幕，用标准指法敲出对应字母发射激光炮！'}
              </p>

              <button
                onClick={handleStartGame}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95"
              >
                {isGameOver ? '再来一局 (重新发射)' : '开始保卫战 🚀'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Hand & Keyboard assistance during game */}
      <div className="flex flex-col gap-4">
        <HandVisualizer activeFinger={activeFinger} targetKey={currentTargetChar} />
        <KeyboardVisualizer
          targetKey={currentTargetChar}
          isBlindShieldActive={false}
        />
      </div>
    </div>
  );
};
