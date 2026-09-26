import React from 'react';
import { INITIAL_ACHIEVEMENTS } from '../data/lessons';

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedBadgeIds: string[];
}

export const BadgeModal: React.FC<BadgeModalProps> = ({
  isOpen,
  onClose,
  unlockedBadgeIds,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">盲打荣誉勋章馆</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="pt-4 pb-2 text-xs text-slate-400">
          已集齐 <span className="text-amber-400 font-bold">{unlockedBadgeIds.length}</span> / {INITIAL_ACHIEVEMENTS.length} 枚荣誉勋章
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {INITIAL_ACHIEVEMENTS.map((badge) => {
            const isUnlocked = unlockedBadgeIds.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-md'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isUnlocked ? '🎖️' : '🔒'}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4
                      className={`text-sm font-bold ${
                        isUnlocked ? 'text-amber-200' : 'text-slate-400'
                      }`}
                    >
                      {badge.title}
                    </h4>
                    {isUnlocked && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-medium">
                        已点亮
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-6 mt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
          >
            返回训练
          </button>
        </div>
      </div>
    </div>
  );
};
