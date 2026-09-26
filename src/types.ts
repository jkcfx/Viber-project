export type FingerId =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'thumb'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky';

export interface FingerInfo {
  id: FingerId;
  name: string; // e.g. "左手小指", "右手食指"
  hand: 'left' | 'right';
  fingerIndex: number; // 0: pinky, 1: ring, 2: middle, 3: index, 4: thumb
  color: string; // Tailwind hex or class
  bgClass: string;
  textClass: string;
  ringClass: string;
  borderClass: string;
  keys: string[];
}

export interface KeyLayoutItem {
  key: string;
  code: string;
  label?: string;
  shiftLabel?: string;
  finger: FingerId;
  width?: string; // e.g., 'w-12', 'w-16', 'flex-1'
  isHomeKey?: boolean; // F and J
}

export type SoundEffectType = 'mechanical' | 'bubble' | 'typewriter' | 'mute';

export type GameMode = 'academy' | 'falling' | 'racer' | 'sprint';

export interface Lesson {
  id: string;
  title: string;
  category: 'home' | 'index' | 'top' | 'bottom' | 'words' | 'pinyin' | 'custom';
  description: string;
  fingerFocus: string;
  targetAccuracy: number;
  text: string;
  rewardBadge?: string;
}

export interface LessonCategory {
  id: string;
  name: string;
  badgeName: string;
  icon: string;
  description: string;
  lessons: Lesson[];
}

export interface UserStats {
  completedLessons: string[]; // lesson ids
  bestWpm: number;
  totalKeysPressed: number;
  accuracyHistory: number[];
  unlockedBadges: string[];
  fallingHighScore: number;
  racerWins: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}
