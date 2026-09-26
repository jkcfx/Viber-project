import React from 'react';
import { FingerId, FingerInfo } from '../types';
import { FINGER_DEFINITIONS } from '../utils/fingerMap';

interface HandVisualizerProps {
  activeFinger: FingerInfo | null;
  targetKey: string;
}

export const HandVisualizer: React.FC<HandVisualizerProps> = ({ activeFinger, targetKey }) => {
  const isLeft = activeFinger?.hand === 'left' || activeFinger?.id === 'thumb';
  const isRight = activeFinger?.hand === 'right' || activeFinger?.id === 'thumb';

  const leftFingers: { id: FingerId; label: string; x: number; y: number; r: number }[] = [
    { id: 'left-pinky', label: '小指', x: 26, y: 70, r: 9 },
    { id: 'left-ring', label: '无名指', x: 44, y: 46, r: 9.5 },
    { id: 'left-middle', label: '中指', x: 65, y: 36, r: 10 },
    { id: 'left-index', label: '食指 (F)', x: 88, y: 48, r: 10 },
    { id: 'thumb', label: '大拇指', x: 114, y: 88, r: 10.5 },
  ];

  const rightFingers: { id: FingerId; label: string; x: number; y: number; r: number }[] = [
    { id: 'thumb', label: '大拇指', x: 26, y: 88, r: 10.5 },
    { id: 'right-index', label: '食指 (J)', x: 52, y: 48, r: 10 },
    { id: 'right-middle', label: '中指', x: 75, y: 36, r: 10 },
    { id: 'right-ring', label: '无名指', x: 96, y: 46, r: 9.5 },
    { id: 'right-pinky', label: '小指', x: 114, y: 70, r: 9 },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-white shadow-lg backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">标准十指指法导引</span>
        </div>

        {activeFinger ? (
          <div className="flex items-center gap-2 text-sm bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
            <span
              className="w-3.5 h-3.5 rounded-full inline-block shadow-sm"
              style={{ backgroundColor: activeFinger.color }}
            />
            <span className="font-semibold text-white">{activeFinger.name}</span>
            <span className="text-slate-400 text-xs">敲击</span>
            <span className="px-2 py-0.5 bg-indigo-600 font-mono font-bold rounded text-white text-xs tracking-wider">
              {targetKey === ' ' ? '空格 Space' : targetKey.toUpperCase()}
            </span>
            {targetKey.toLowerCase() === 'f' && (
              <span className="text-[11px] text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                摸左手食指定位凸点
              </span>
            )}
            {targetKey.toLowerCase() === 'j' && (
              <span className="text-[11px] text-cyan-400 font-medium bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                摸右手食指定位凸点
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-400">请保持双手十指自然放置在基准键（ASDF JKL;）上</div>
        )}
      </div>

      {/* SVG Hands visualizer */}
      <div className="grid grid-cols-2 gap-4 pt-3 items-center justify-center max-w-lg mx-auto">
        {/* Left Hand */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
            <span>左手 Left Hand</span>
            {activeFinger?.hand === 'left' && <span className="text-emerald-400 text-[11px]">● 正在出击</span>}
          </div>
          <svg viewBox="0 0 140 140" className="w-36 h-36 drop-shadow-md select-none">
            {/* Palm outline */}
            <path
              d="M 28 85 C 22 105, 35 125, 70 128 C 105 125, 115 110, 110 95 C 105 85, 95 80, 88 65 L 65 52 L 44 60 L 28 85 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="2.5"
            />
            {/* Fingers */}
            {leftFingers.map((f) => {
              const def = FINGER_DEFINITIONS[f.id];
              const isActive = activeFinger?.id === f.id;
              return (
                <g key={f.id} className="transition-all duration-200">
                  {/* Finger node */}
                  <circle
                    cx={f.x}
                    cy={f.y}
                    r={isActive ? f.r + 3 : f.r}
                    fill={isActive ? def.color : '#334155'}
                    stroke={isActive ? '#ffffff' : def.color}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'animate-pulse' : ''}
                    style={{
                      filter: isActive ? `drop-shadow(0 0 8px ${def.color})` : 'none',
                    }}
                  />
                  {/* Label */}
                  <text
                    x={f.x}
                    y={f.y + 3}
                    textAnchor="middle"
                    fill={isActive ? '#ffffff' : '#94a3b8'}
                    fontSize={isActive ? '8.5' : '7.5'}
                    fontWeight={isActive ? 'bold' : 'normal'}
                  >
                    {f.id === 'thumb' ? '拇' : f.label.charAt(0)}
                  </text>
                  {/* Home bump indicator on F */}
                  {f.id === 'left-index' && (
                    <circle cx={f.x} cy={f.y + 16} r="2" fill="#10B981" />
                  )}
                </g>
              );
            })}
          </svg>
          <div className="text-[11px] text-slate-500 mt-1">基准键：A S D F</div>
        </div>

        {/* Right Hand */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
            <span>右手 Right Hand</span>
            {activeFinger?.hand === 'right' && <span className="text-cyan-400 text-[11px]">● 正在出击</span>}
          </div>
          <svg viewBox="0 0 140 140" className="w-36 h-36 drop-shadow-md select-none">
            {/* Palm outline */}
            <path
              d="M 30 95 C 25 110, 35 125, 70 128 C 105 125, 118 105, 112 85 L 96 60 L 75 52 L 52 65 C 45 80, 35 85, 30 95 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="2.5"
            />
            {/* Fingers */}
            {rightFingers.map((f) => {
              const def = FINGER_DEFINITIONS[f.id];
              const isActive = activeFinger?.id === f.id;
              return (
                <g key={f.id} className="transition-all duration-200">
                  <circle
                    cx={f.x}
                    cy={f.y}
                    r={isActive ? f.r + 3 : f.r}
                    fill={isActive ? def.color : '#334155'}
                    stroke={isActive ? '#ffffff' : def.color}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'animate-pulse' : ''}
                    style={{
                      filter: isActive ? `drop-shadow(0 0 8px ${def.color})` : 'none',
                    }}
                  />
                  <text
                    x={f.x}
                    y={f.y + 3}
                    textAnchor="middle"
                    fill={isActive ? '#ffffff' : '#94a3b8'}
                    fontSize={isActive ? '8.5' : '7.5'}
                    fontWeight={isActive ? 'bold' : 'normal'}
                  >
                    {f.id === 'thumb' ? '拇' : f.label.charAt(0)}
                  </text>
                  {/* Home bump indicator on J */}
                  {f.id === 'right-index' && (
                    <circle cx={f.x} cy={f.y + 16} r="2" fill="#06B6D4" />
                  )}
                </g>
              );
            })}
          </svg>
          <div className="text-[11px] text-slate-500 mt-1">基准键：J K L ;</div>
        </div>
      </div>
    </div>
  );
};
