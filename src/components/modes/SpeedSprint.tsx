import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/audio';
import { getFingerForKey } from '../../utils/fingerMap';
import { FingerId } from '../../types';
import { HandVisualizer } from '../HandVisualizer';
import { KeyboardVisualizer } from '../KeyboardVisualizer';

const SPRINT_PASSAGES = [
  'Typing with ten fingers is just like playing the piano with beautiful harmony. Always keep your hands relaxed and feel the little bumps on F and J keys.',
  'Courage does not always roar. Sometimes courage is the quiet voice at the end of the day saying I will try again tomorrow and do my very best.',
  'Every great computer programmer and tech superhero started by learning touch typing. Practice ten minutes every day and you will fly across the keyboard.',
  'When you look at the screen instead of looking down at your fingers your brain builds powerful muscle memory that lasts a lifetime.',
];

export const SpeedSprint: React.FC = () => {
  const [passage, setPassage] = useState<string>(SPRINT_PASSAGES[0]);
  const [charIndex, setCharIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [errors, setErrors] = useState<number>(0);
  const [fingerErrorMap, setFingerErrorMap] = useState<Record<FingerId, number>>({
    'left-pinky': 0,
    'left-ring': 0,
    'left-middle': 0,
    'left-index': 0,
    'thumb': 0,
    'right-index': 0,
    'right-middle': 0,
    'right-ring': 0,
    'right-pinky': 0,
  });

  const [isBlindShieldActive, setIsBlindShieldActive] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const startTest = () => {
    const randomPassage = SPRINT_PASSAGES[Math.floor(Math.random() * SPRINT_PASSAGES.length)];
    setPassage(randomPassage);
    setCharIndex(0);
    setErrors(0);
    setTimeLeft(60);
    setIsActive(true);
    setIsFinished(false);
    setFingerErrorMap({
      'left-pinky': 0,
      'left-ring': 0,
      'left-middle': 0,
      'left-index': 0,
      'thumb': 0,
      'right-index': 0,
      'right-middle': 0,
      'right-ring': 0,
      'right-pinky': 0,
    });
    if (containerRef.current) {
      containerRef.current.focus();
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!isActive || isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsFinished(true);
          setIsActive(false);
          soundManager.playVictory();
          try {
            confetti({ particleCount: 70, spread: 60 });
          } catch {
            // Ignore in tests
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isFinished]);

  // Key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive || isFinished) return;
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;
      if (e.key === ' ' || e.code === 'Space') e.preventDefault();

      const expected = passage[charIndex];
      const finger = getFingerForKey(expected);

      if (e.key === expected) {
        soundManager.playKey();
        const next = charIndex + 1;
        setCharIndex(next);
        if (next >= passage.length) {
          // Loop or extend text
          setPassage((p) => p + ' ' + SPRINT_PASSAGES[Math.floor(Math.random() * SPRINT_PASSAGES.length)]);
        }
      } else {
        soundManager.playError();
        setErrors((err) => err + 1);
        setFingerErrorMap((prev) => ({
          ...prev,
          [finger.id]: (prev[finger.id] || 0) + 1,
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isFinished, charIndex, passage]);

  // Metrics
  const elapsedSec = 60 - timeLeft;
  const minutes = Math.max(0.01, elapsedSec / 60);
  const words = charIndex / 5;
  const wpm = Math.round(words / minutes);
  const totalTyped = charIndex + errors;
  const accuracy = totalTyped > 0 ? Math.round(((totalTyped - errors) / totalTyped) * 100) : 100;

  const targetChar = charIndex < passage.length ? passage[charIndex] : '';
  const activeFinger = targetChar ? getFingerForKey(targetChar) : null;

  // Weak finger diagnosis
  const worstFinger = Object.entries(fingerErrorMap).sort((a, b) => b[1] - a[1])[0];

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="outline-none flex flex-col gap-6 max-w-5xl mx-auto px-3 sm:px-4 py-3"
    >
      {/* HUD Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-indigo-400 font-semibold tracking-wide">
            60秒限时测评
          </div>
          <h2 className="text-lg font-bold text-white">1分钟综合盲打极速测试</h2>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400">剩余时间</span>
            <span className={`text-base font-bold ${timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
              ⏱️ {timeLeft}s
            </span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400">实时 WPM</span>
            <span className="text-base font-bold text-indigo-400">{wpm}</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400">正确率</span>
            <span className="text-base font-bold text-emerald-400">{accuracy}%</span>
          </div>
        </div>
      </div>

      {/* Main Typing Passage */}
      <div className="relative bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden min-h-[220px] flex flex-col justify-center">
        {!isActive && !isFinished ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">⏱️</div>
            <h3 className="text-xl font-bold text-white">准备好测试你的盲打段位了吗？</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
              点击下方按钮开始60秒倒计时。深呼吸，双手指尖放平在 F 和 J 定位键上，眼睛平视屏幕！
            </p>
            <button
              onClick={startTest}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              开始1分钟测试 🚀
            </button>
          </div>
        ) : isFinished ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-2xl font-bold text-white">测评报告出炉！</h3>
            <p className="text-xs text-slate-400 mt-1">恭喜完成 60 秒极速盲测！</p>

            <div className="grid grid-cols-3 gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800 max-w-md mx-auto my-5 text-center">
              <div>
                <div className="text-[10px] text-slate-400">最终速度</div>
                <div className="text-xl font-bold text-indigo-400 font-mono">{wpm} WPM</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">打字字数</div>
                <div className="text-xl font-bold text-white font-mono">{charIndex} 字</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">正确率</div>
                <div className="text-xl font-bold text-emerald-400 font-mono">{accuracy}%</div>
              </div>
            </div>

            {/* Smart child diagnosis */}
            <div className="max-w-md mx-auto text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-left text-slate-300 mb-5 space-y-1.5">
              <div className="font-semibold text-white">🩺 智能指法诊断建议：</div>
              {worstFinger && worstFinger[1] > 0 ? (
                <div>
                  • 你的 <span className="text-amber-400 font-bold">{worstFinger[0]}</span> 出现了 {worstFinger[1]} 次失误，建议在“指法学院”针对性练练对应键位哦。
                </div>
              ) : (
                <div>• 零失误！手指按键非常沉稳精准，盲打基本功极为扎实！</div>
              )}
              <div>
                • {wpm >= 40 ? '🚀 你的打字速度已媲美成年人办公标准！' : wpm >= 20 ? '✨ 表现很棒！超过了同龄初学者平均水平！' : '🌱 刚起步阶段，坚持十指不低头，一周后速度会翻倍！'}
              </div>
            </div>

            <button
              onClick={startTest}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              重新测试一次 ↺
            </button>
          </div>
        ) : (
          <div className="font-mono text-lg sm:text-xl leading-loose select-none">
            {passage.split('').map((c, idx) => {
              const isPast = idx < charIndex;
              const isCur = idx === charIndex;
              return (
                <span
                  key={idx}
                  className={
                    isPast
                      ? 'text-emerald-400'
                      : isCur
                      ? 'bg-indigo-600 text-white rounded px-0.5 animate-pulse font-bold'
                      : 'text-slate-500'
                  }
                >
                  {c === ' ' ? '␣' : c}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Hand & Keyboard Guidance */}
      <HandVisualizer activeFinger={activeFinger} targetKey={targetChar} />
      <KeyboardVisualizer
        targetKey={targetChar}
        isBlindShieldActive={isBlindShieldActive}
        onToggleBlindShield={() => setIsBlindShieldActive(!isBlindShieldActive)}
      />
    </div>
  );
};
