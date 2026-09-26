import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Lesson, SoundEffectType } from '../../types';
import { LESSON_CATEGORIES } from '../../data/lessons';
import { getFingerForKey } from '../../utils/fingerMap';
import { soundManager } from '../../utils/audio';
import { HandVisualizer } from '../HandVisualizer';
import { KeyboardVisualizer } from '../KeyboardVisualizer';

interface AcademyModeProps {
  soundMode: SoundEffectType;
  onLessonComplete: (lessonId: string, wpm: number, accuracy: number) => void;
  completedLessonIds: string[];
}

export const AcademyMode: React.FC<AcademyModeProps> = ({
  onLessonComplete,
  completedLessonIds,
}) => {
  // Category and Lesson selection
  const [selectedCatId, setSelectedCatId] = useState<string>('home');
  const currentCategory = LESSON_CATEGORIES.find((c) => c.id === selectedCatId) || LESSON_CATEGORIES[0];
  const [currentLesson, setCurrentLesson] = useState<Lesson>(currentCategory.lessons[0]);

  // Custom text option
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customInputText, setCustomInputText] = useState<string>('');

  // Typing state
  const [charIndex, setCharIndex] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [charStatus, setCharStatus] = useState<('correct' | 'wrong' | 'pending')[]>([]);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [lastPressedKey, setLastPressedKey] = useState<string>('');

  // Blind shield setting
  const [isBlindShieldActive, setIsBlindShieldActive] = useState<boolean>(false);

  // Hidden input ref for capturing keystrokes reliably on both desktop and tablet
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // Target text
  const targetText = currentLesson.text;

  // Initialize or reset lesson
  const resetLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setCharIndex(0);
    setMistakes(0);
    setCharStatus(new Array(lesson.text.length).fill('pending'));
    setCombo(0);
    setMaxCombo(0);
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    setLastPressedKey('');
  };

  useEffect(() => {
    resetLesson(currentLesson);
  }, [currentLesson.id]);

  // Focus container on mount or reset
  useEffect(() => {
    if (inputContainerRef.current) {
      inputContainerRef.current.focus();
    }
  }, [currentLesson.id, isFinished]);

  // Current target key & finger
  const targetChar = charIndex < targetText.length ? targetText[charIndex] : '';
  const activeFinger = targetChar ? getFingerForKey(targetChar) : null;

  // Keydown listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return;

      // Ignore modifier keys by themselves
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
        return;
      }

      // Prevent page scrolling on Spacebar during typing practice
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
      }

      const inputChar = e.key;
      setLastPressedKey(inputChar);

      if (charIndex >= targetText.length) return;

      const expectedChar = targetText[charIndex];

      // Start timer on first keystroke
      const now = Date.now();
      const currentStart = startTime || now;
      if (!startTime) {
        setStartTime(now);
      }

      const isCorrect = inputChar === expectedChar;

      const updatedStatus = [...charStatus];
      if (isCorrect) {
        updatedStatus[charIndex] = 'correct';
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo > maxCombo) setMaxCombo(newCombo);

        soundManager.playKey();
        if (newCombo % 10 === 0 && newCombo > 0) {
          soundManager.playCombo(newCombo);
        }

        const nextIndex = charIndex + 1;
        setCharIndex(nextIndex);
        setCharStatus(updatedStatus);

        // Calculate live metrics
        const totalTyped = nextIndex;
        const totalErrors = mistakes;
        const currentAccuracy = Math.max(0, Math.round(((totalTyped - totalErrors) / totalTyped) * 100));
        setAccuracy(currentAccuracy);

        const elapsedMinutes = Math.max(0.01, (now - currentStart) / 60000);
        const wordsCount = nextIndex / 5;
        const currentWpm = Math.round(wordsCount / elapsedMinutes);
        setWpm(currentWpm);

        // Check completion
        if (nextIndex >= targetText.length) {
          setIsFinished(true);
          soundManager.playVictory();
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {
            // Ignore confetti failure in test environments
          }
          onLessonComplete(currentLesson.id, currentWpm, currentAccuracy);
        }
      } else {
        // Mistake
        soundManager.playError();
        updatedStatus[charIndex] = 'wrong';
        setMistakes((prev) => prev + 1);
        setCombo(0);
        setCharStatus(updatedStatus);

        const totalTyped = charIndex + 1;
        const currentAccuracy = Math.max(0, Math.round(((totalTyped - (mistakes + 1)) / totalTyped) * 100));
        setAccuracy(currentAccuracy);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [charIndex, mistakes, combo, maxCombo, startTime, targetText, charStatus, isFinished, currentLesson.id]);

  // Advance to next lesson
  const handleNextLesson = () => {
    const currentLessons = currentCategory.lessons;
    const currentIndex = currentLessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIndex !== -1 && currentIndex + 1 < currentLessons.length) {
      resetLesson(currentLessons[currentIndex + 1]);
    } else {
      // Advance category
      const catIndex = LESSON_CATEGORIES.findIndex((c) => c.id === selectedCatId);
      if (catIndex !== -1 && catIndex + 1 < LESSON_CATEGORIES.length) {
        const nextCat = LESSON_CATEGORIES[catIndex + 1];
        setSelectedCatId(nextCat.id);
        resetLesson(nextCat.lessons[0]);
      } else {
        resetLesson(currentLessons[0]);
      }
    }
  };

  const handleApplyCustomText = () => {
    if (!customInputText.trim()) return;
    const customLesson: Lesson = {
      id: `custom-${Date.now()}`,
      title: '自定义练习文本',
      category: 'custom',
      description: '练习你所输入的个性化文字或课文。',
      fingerFocus: '全指综合',
      targetAccuracy: 90,
      text: customInputText.trim().replace(/\s+/g, ' '),
    };
    setIsCustomMode(false);
    resetLesson(customLesson);
  };

  return (
    <div
      ref={inputContainerRef}
      tabIndex={0}
      className="outline-none flex flex-col gap-6 max-w-6xl mx-auto px-3 sm:px-4 py-4"
    >
      {/* Category selector row */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto scrollbar-none">
        {LESSON_CATEGORIES.map((cat) => {
          const isActive = !isCustomMode && selectedCatId === cat.id;
          const completedCount = cat.lessons.filter((l) => completedLessonIds.includes(l.id)).length;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setIsCustomMode(false);
                setSelectedCatId(cat.id);
                resetLesson(cat.lessons[0]);
              }}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{cat.name}</span>
              {completedCount > 0 && (
                <span className="text-[10px] bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 px-1.5 py-0.5 rounded-full">
                  {completedCount}/{cat.lessons.length}
                </span>
              )}
            </button>
          );
        })}

        {/* Custom text tab */}
        <button
          onClick={() => setIsCustomMode(true)}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            isCustomMode
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>✍️ 自定义课文</span>
        </button>
      </div>

      {/* Lesson Selector in current category */}
      {!isCustomMode && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">关卡选择：</span>
          <div className="flex items-center gap-1.5">
            {currentCategory.lessons.map((lesson, idx) => {
              const isSelected = currentLesson.id === lesson.id;
              const isDone = completedLessonIds.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  onClick={() => resetLesson(lesson)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-200 text-slate-900 shadow-sm font-semibold'
                      : isDone
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{isDone ? '✓' : idx + 1}</span>
                  <span>{lesson.title.split(' ')[1] || lesson.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Text Modal / Area */}
      {isCustomMode && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <span>✍️</span> 自定义输入练习课文
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            可以粘贴孩子学校的英文单词、短文故事或拼音句子，练习更有针对性！
          </p>
          <textarea
            value={customInputText}
            onChange={(e) => setCustomInputText(e.target.value)}
            placeholder="在此粘贴或输入练习文字 (支持英文及拼音)... 例如: Practice makes perfect. Everyday is a new beginning!"
            rows={4}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={handleApplyCustomText}
              disabled={!customInputText.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
            >
              开始练习这段文字
            </button>
          </div>
        </div>
      )}

      {/* Current Lesson Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <div className="text-xs text-indigo-400 font-semibold tracking-wider">
              {currentCategory.name}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              {currentLesson.title}
            </h2>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-[10px]">打字速度</span>
              <span className="text-base font-bold text-white">{wpm} <span className="text-[10px] text-slate-400">WPM</span></span>
            </div>
            <div className="w-px h-6 bg-slate-800"></div>
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-[10px]">正确率</span>
              <span className={`text-base font-bold ${accuracy >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {accuracy}%
              </span>
            </div>
            <div className="w-px h-6 bg-slate-800"></div>
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-[10px]">连击</span>
              <span className="text-base font-bold text-orange-400">
                {combo > 0 ? `🔥 ${combo}` : '0'}
              </span>
            </div>
          </div>
        </div>

        {/* Pedagogical Guidance Tip */}
        <p className="text-xs text-slate-300 mt-3 leading-relaxed">
          💡 <span className="font-semibold text-white">指导秘诀：</span>
          {currentLesson.description}
        </p>

        {/* Typing text arena */}
        <div className="mt-4 p-4 sm:p-5 bg-slate-950 rounded-xl border border-slate-800 min-h-[110px] flex flex-wrap items-center content-center leading-loose font-mono text-lg sm:text-xl md:text-2xl tracking-wide select-none">
          {targetText.split('').map((char, idx) => {
            const isCurrent = idx === charIndex;
            const status = charStatus[idx];

            let textClass = 'text-slate-500';
            let bgClass = '';

            if (status === 'correct') {
              textClass = 'text-emerald-400';
            } else if (status === 'wrong') {
              textClass = 'text-rose-400 bg-rose-950/60 rounded';
            }

            if (isCurrent) {
              textClass = 'text-white font-bold';
              bgClass = 'bg-indigo-600/90 text-white rounded ring-2 ring-indigo-400 px-0.5 animate-pulse';
            }

            return (
              <span
                key={idx}
                className={`relative inline-block transition-colors duration-100 ${textClass} ${bgClass}`}
              >
                {char === ' ' ? (
                  <span className={isCurrent ? 'underline' : 'opacity-30'}>␣</span>
                ) : (
                  char
                )}
              </span>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-150"
              style={{ width: `${Math.min(100, (charIndex / targetText.length) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {charIndex} / {targetText.length} 字符
          </span>
          <button
            onClick={() => resetLesson(currentLesson)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 transition-colors"
            title="重新练习本关"
          >
            ↺ 重练
          </button>
        </div>
      </div>

      {/* Interactive Hand Guidance */}
      <HandVisualizer activeFinger={activeFinger} targetKey={targetChar} />

      {/* Visual Keyboard with Blind Shield Toggle */}
      <KeyboardVisualizer
        targetKey={targetChar}
        pressedKey={lastPressedKey}
        isBlindShieldActive={isBlindShieldActive}
        onToggleBlindShield={() => setIsBlindShieldActive(!isBlindShieldActive)}
      />

      {/* Victory / Completion Modal */}
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 text-3xl flex items-center justify-center border border-emerald-500/30 mb-4 animate-bounce">
              🎉
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">太棒啦！关卡完成！</h3>
            <p className="text-xs text-slate-400 mt-1">你的手指正在形成神奇的盲打肌肉记忆！</p>

            {/* Stars */}
            <div className="flex justify-center gap-2 my-4 text-2xl">
              <span>⭐</span>
              <span>{accuracy >= 85 ? '⭐' : '☆'}</span>
              <span>{accuracy >= 95 ? '⭐' : '☆'}</span>
            </div>

            {/* Stat Grid */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 my-4 text-center">
              <div>
                <div className="text-[10px] text-slate-400">打字速度</div>
                <div className="text-base font-bold text-indigo-400 font-mono">{wpm} WPM</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">正确率</div>
                <div className="text-base font-bold text-emerald-400 font-mono">{accuracy}%</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">最高连击</div>
                <div className="text-base font-bold text-orange-400 font-mono">{maxCombo}</div>
              </div>
            </div>

            {/* Advice tailored to child */}
            <div className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-left mb-5">
              {accuracy >= 95 ? (
                <span>🌟 准度超神！完全掌握了此关指法，食指归位非常标准！</span>
              ) : accuracy >= 85 ? (
                <span>👍 很棒的成绩！稍微放慢一点点节奏，确保每次手指都按在对的键上。</span>
              ) : (
                <span>💪 别灰心！盲打初期最重要的是“十指各找各家”，再练一次一定更顺手！</span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => resetLesson(currentLesson)}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
              >
                再练一次 ↺
              </button>
              <button
                onClick={handleNextLesson}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors"
              >
                下一关卡 ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
