import React from 'react';
import { FINGER_DEFINITIONS, KEYBOARD_ROWS } from '../utils/fingerMap';
import { FingerId } from '../types';

interface KeyboardVisualizerProps {
  targetKey: string;
  pressedKey?: string;
  isBlindShieldActive: boolean;
  onToggleBlindShield?: () => void;
}

export const KeyboardVisualizer: React.FC<KeyboardVisualizerProps> = ({
  targetKey,
  pressedKey,
  isBlindShieldActive,
  onToggleBlindShield,
}) => {
  // Normalize comparison
  const normalize = (k: string) => {
    if (!k) return '';
    if (k === ' ') return ' ';
    return k.toLowerCase();
  };

  const normTarget = normalize(targetKey);
  const normPressed = normalize(pressedKey || '');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl select-none">
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">标准 87/104 键盘指法分布</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">各手指颜色一一对应</span>
        </div>

        {onToggleBlindShield && (
          <button
            onClick={onToggleBlindShield}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
              isBlindShieldActive
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
            title="开启后键帽字符隐藏，强迫眼睛看屏幕，快速炼成真正盲打"
          >
            <span className="text-sm">{isBlindShieldActive ? '🙈' : '👀'}</span>
            <span>盲打护眼遮罩: {isBlindShieldActive ? '已开启 (字母隐藏)' : '关闭 (显示字符)'}</span>
          </button>
        )}
      </div>

      {/* Keyboard Grid */}
      <div className="flex flex-col gap-1.5 max-w-4xl mx-auto overflow-x-auto p-1">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1.5 justify-center min-w-[620px]">
            {row.map((item) => {
              const fingerDef = FINGER_DEFINITIONS[item.finger];
              const isTarget =
                normTarget === item.key.toLowerCase() ||
                (normTarget === ' ' && item.key === ' ') ||
                (item.shiftLabel && normTarget === item.shiftLabel);
              const isPressed =
                normPressed === item.key.toLowerCase() ||
                (normPressed === ' ' && item.key === ' ');

              return (
                <div
                  key={item.code}
                  className={`relative flex flex-col items-center justify-center rounded-lg border text-xs font-mono transition-all duration-150 ${
                    item.width || 'w-11 md:w-12'
                  } h-11 md:h-12 shadow-sm ${
                    isTarget
                      ? 'bg-indigo-600/90 border-white text-white shadow-lg ring-2 ring-indigo-400 -translate-y-0.5 z-10 animate-bounce'
                      : isPressed
                      ? 'bg-slate-600 border-slate-400 text-white translate-y-0.5'
                      : 'bg-slate-800/90 border-slate-700/80 text-slate-200 hover:bg-slate-750'
                  }`}
                  style={{
                    boxShadow: isTarget
                      ? `0 0 16px ${fingerDef.color}`
                      : undefined,
                  }}
                >
                  {/* Key label */}
                  {isBlindShieldActive && !['Backspace', 'Tab', 'CapsLock', 'Enter', 'Shift', 'Ctrl', 'Alt'].includes(item.key) ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                  ) : (
                    <div className="flex flex-col items-center leading-none">
                      {item.shiftLabel && (
                        <span className="text-[9px] text-slate-400">{item.shiftLabel}</span>
                      )}
                      <span className="font-bold text-xs md:text-sm">
                        {item.label || item.key.toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Tactile bump marker for F & J */}
                  {item.isHomeKey && (
                    <div className="absolute bottom-1 w-3.5 h-0.5 bg-amber-400 rounded-full shadow-sm" title="基准定位小凸点" />
                  )}

                  {/* Finger color stripe at bottom */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 rounded-b-md opacity-85"
                    style={{ backgroundColor: fingerDef.color }}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Color Legend for Fingers */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-slate-400">
        <span className="text-slate-500 font-medium">指法色彩指引：</span>
        {(
          [
            ['left-pinky', '左手小指 (Q/A/Z)'],
            ['left-ring', '左手无名 (W/S/X)'],
            ['left-middle', '左手中指 (E/D/C)'],
            ['left-index', '左手食指 (R/F/V/T/G/B)'],
            ['thumb', '双手拇指 (空格)'],
            ['right-index', '右手食指 (Y/U/H/J/N/M)'],
            ['right-middle', '右手中指 (I/K/，)'],
            ['right-ring', '右手无名 (O/L/。)'],
            ['right-pinky', '右手小指 (P/;/退格)'],
          ] as [FingerId, string][]
        ).map(([fId, label]) => {
          const def = FINGER_DEFINITIONS[fId];
          return (
            <div key={fId} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: def.color }}
              />
              <span className="text-slate-300">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
