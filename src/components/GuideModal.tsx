import React from 'react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <h2 className="text-lg sm:text-xl font-bold text-white">盲打秘籍与十指指法宝典</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 pt-4 text-xs sm:text-sm">
          {/* Section 1: Why stop pecking */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-indigo-400 text-sm flex items-center gap-2 mb-2">
              <span>🤔</span> 为什么同学盲打飞快，而“二指禅戳键盘”不行？
            </h3>
            <p className="text-slate-300 leading-relaxed">
              用两根食指在键盘上找字母戳（俗称“二指禅”），眼睛必须在键盘和屏幕之间来回疯狂抬头低头。两根手指负担了全部按键，速度上限通常只有 20~30 WPM，手还特别容易酸！
              <br /><br />
              而<strong>十指盲打（Touch Typing）</strong>让十根手指各管辖固定区域，敲击由<strong>肌肉记忆</strong>自动完成。眼睛只看屏幕，打字速度可轻松达到 <strong>60~100+ WPM</strong>，如同在键盘上弹钢琴！
            </p>
          </div>

          {/* Section 2: F and J bumps */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-2 mb-2">
              <span>🔍</span> 键盘上的隐形“灯塔”：F 和 J 键的小凸点
            </h3>
            <p className="text-slate-300 leading-relaxed">
              摸一摸键盘上的 <strong>F 键</strong> 和 <strong>J 键</strong>！指腹能清晰摸到一根凸起的小横杠或小圆点。
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300">
              <li><strong>左手食指</strong> 永远定位在带凸点的 <strong>F 键</strong> 上。</li>
              <li><strong>右手食指</strong> 永远定位在带凸点的 <strong>J 键</strong> 上。</li>
              <li>其他手指顺理成章排开：左手依次放 A S D F，右手依次放 J K L ;。</li>
              <li>无论手指伸去按其他任何键，按完立刻<strong>回到原位（归巢法则）</strong>！</li>
            </ul>
          </div>

          {/* Section 3: Posture */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2 mb-2">
              <span>🧘‍♂️</span> 少年打字坐姿与手势秘籍
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="font-semibold text-white">🪑 坐姿：</span> 身体坐正，腰背挺直，双脚平放在地上，眼睛与屏幕保持一臂距离。
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="font-semibold text-white">🤲 手形：</span> 手指自然弯曲成拱形，像轻轻握着两颗鸡蛋。手腕不要重重压在桌上。
              </div>
            </div>
          </div>

          {/* Section 4: Rhyme */}
          <div className="bg-indigo-950/40 border border-indigo-500/40 p-4 rounded-2xl text-center">
            <div className="text-xs text-indigo-300 font-semibold mb-1">🌟 盲打小超人口诀 🌟</div>
            <div className="text-base sm:text-lg font-bold text-white tracking-wider">
              “食指放凸点，十指各把关；<br />
              眼睛盯屏幕，键位记心间！”
            </div>
          </div>
        </div>

        <div className="pt-6 mt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors"
          >
            我学会啦，立即去练习！
          </button>
        </div>
      </div>
    </div>
  );
};
