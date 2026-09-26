import { FingerId, FingerInfo, KeyLayoutItem } from '../types';

export const FINGER_DEFINITIONS: Record<FingerId, FingerInfo> = {
  'left-pinky': {
    id: 'left-pinky',
    name: '左手小拇指',
    hand: 'left',
    fingerIndex: 0,
    color: '#F43F5E', // Rose
    bgClass: 'bg-rose-500',
    textClass: 'text-rose-500',
    ringClass: 'ring-rose-400',
    borderClass: 'border-rose-400',
    keys: ['`', '~', '1', '!', 'Q', 'q', 'A', 'a', 'Z', 'z', 'Tab', 'CapsLock', 'ShiftLeft', 'ControlLeft'],
  },
  'left-ring': {
    id: 'left-ring',
    name: '左手无名指',
    hand: 'left',
    fingerIndex: 1,
    color: '#FB923C', // Orange
    bgClass: 'bg-orange-500',
    textClass: 'text-orange-500',
    ringClass: 'ring-orange-400',
    borderClass: 'border-orange-400',
    keys: ['2', '@', 'W', 'w', 'S', 's', 'X', 'x'],
  },
  'left-middle': {
    id: 'left-middle',
    name: '左手中指',
    hand: 'left',
    fingerIndex: 2,
    color: '#FBBF24', // Amber
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-500',
    ringClass: 'ring-amber-400',
    borderClass: 'border-amber-400',
    keys: ['3', '#', 'E', 'e', 'D', 'd', 'C', 'c'],
  },
  'left-index': {
    id: 'left-index',
    name: '左手食指',
    hand: 'left',
    fingerIndex: 3,
    color: '#10B981', // Emerald
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-500',
    ringClass: 'ring-emerald-400',
    borderClass: 'border-emerald-400',
    keys: ['4', '$', '5', '%', 'R', 'r', 'T', 't', 'F', 'f', 'G', 'g', 'V', 'v', 'B', 'b'],
  },
  'thumb': {
    id: 'thumb',
    name: '左右大拇指',
    hand: 'left',
    fingerIndex: 4,
    color: '#6366F1', // Indigo
    bgClass: 'bg-indigo-500',
    textClass: 'text-indigo-500',
    ringClass: 'ring-indigo-400',
    borderClass: 'border-indigo-400',
    keys: [' ', 'Space'],
  },
  'right-index': {
    id: 'right-index',
    name: '右手食指',
    hand: 'right',
    fingerIndex: 3,
    color: '#06B6D4', // Cyan
    bgClass: 'bg-cyan-500',
    textClass: 'text-cyan-500',
    ringClass: 'ring-cyan-400',
    borderClass: 'border-cyan-400',
    keys: ['6', '^', '7', '&', 'Y', 'y', 'U', 'u', 'H', 'h', 'J', 'j', 'N', 'n', 'M', 'm'],
  },
  'right-middle': {
    id: 'right-middle',
    name: '右手中指',
    hand: 'right',
    fingerIndex: 2,
    color: '#3B82F6', // Blue
    bgClass: 'bg-blue-500',
    textClass: 'text-blue-500',
    ringClass: 'ring-blue-400',
    borderClass: 'border-blue-400',
    keys: ['8', '*', 'I', 'i', 'K', 'k', ',', '<'],
  },
  'right-ring': {
    id: 'right-ring',
    name: '右手无名指',
    hand: 'right',
    fingerIndex: 1,
    color: '#8B5CF6', // Violet
    bgClass: 'bg-violet-500',
    textClass: 'text-violet-500',
    ringClass: 'ring-violet-400',
    borderClass: 'border-violet-400',
    keys: ['9', '(', 'O', 'o', 'L', 'l', '.', '>'],
  },
  'right-pinky': {
    id: 'right-pinky',
    name: '右手小拇指',
    hand: 'right',
    fingerIndex: 0,
    color: '#EC4899', // Pink
    bgClass: 'bg-pink-500',
    textClass: 'text-pink-500',
    ringClass: 'ring-pink-400',
    borderClass: 'border-pink-400',
    keys: [
      '0', ')', '-', '_', '=', '+', 'P', 'p', '[', '{', ']', '}', '\\', '|',
      ';', ':', '\'', '"', '/', '?', 'Enter', 'Backspace', 'ShiftRight',
    ],
  },
};

// Map each character to FingerId
export function getFingerForKey(charOrCode: string): FingerInfo {
  const normalized = charOrCode.length === 1 ? charOrCode : charOrCode;
  
  for (const finger of Object.values(FINGER_DEFINITIONS)) {
    if (finger.keys.includes(normalized) || finger.keys.includes(normalized.toUpperCase()) || finger.keys.includes(normalized.toLowerCase())) {
      return finger;
    }
  }
  return FINGER_DEFINITIONS['thumb']; // Default to space / thumb
}

// 5 rows of standard keyboard
export const KEYBOARD_ROWS: KeyLayoutItem[][] = [
  // Number row
  [
    { key: '`', shiftLabel: '~', code: 'Backquote', finger: 'left-pinky', width: 'w-10 md:w-12' },
    { key: '1', shiftLabel: '!', code: 'Digit1', finger: 'left-pinky', width: 'w-10 md:w-12' },
    { key: '2', shiftLabel: '@', code: 'Digit2', finger: 'left-ring', width: 'w-10 md:w-12' },
    { key: '3', shiftLabel: '#', code: 'Digit3', finger: 'left-middle', width: 'w-10 md:w-12' },
    { key: '4', shiftLabel: '$', code: 'Digit4', finger: 'left-index', width: 'w-10 md:w-12' },
    { key: '5', shiftLabel: '%', code: 'Digit5', finger: 'left-index', width: 'w-10 md:w-12' },
    { key: '6', shiftLabel: '^', code: 'Digit6', finger: 'right-index', width: 'w-10 md:w-12' },
    { key: '7', shiftLabel: '&', code: 'Digit7', finger: 'right-index', width: 'w-10 md:w-12' },
    { key: '8', shiftLabel: '*', code: 'Digit8', finger: 'right-middle', width: 'w-10 md:w-12' },
    { key: '9', shiftLabel: '(', code: 'Digit9', finger: 'right-ring', width: 'w-10 md:w-12' },
    { key: '0', shiftLabel: ')', code: 'Digit0', finger: 'right-pinky', width: 'w-10 md:w-12' },
    { key: '-', shiftLabel: '_', code: 'Minus', finger: 'right-pinky', width: 'w-10 md:w-12' },
    { key: '=', shiftLabel: '+', code: 'Equal', finger: 'right-pinky', width: 'w-10 md:w-12' },
    { key: 'Backspace', label: '⌫ 退格', code: 'Backspace', finger: 'right-pinky', width: 'flex-1 md:w-20' },
  ],
  // QWERTY Top row
  [
    { key: 'Tab', label: 'Tab ⇥', code: 'Tab', finger: 'left-pinky', width: 'w-14 md:w-16' },
    { key: 'q', label: 'Q', code: 'KeyQ', finger: 'left-pinky', width: 'w-10 md:w-12' },
    { key: 'w', label: 'W', code: 'KeyW', finger: 'left-ring', width: 'w-10 md:w-12' },
    { key: 'e', label: 'E', code: 'KeyE', finger: 'left-middle', width: 'w-10 md:w-12' },
    { key: 'r', label: 'R', code: 'KeyR', finger: 'left-index', width: 'w-10 md:w-12' },
    { key: 't', label: 'T', code: 'KeyT', finger: 'left-index', width: 'w-10 md:w-12' },
    { key: 'y', label: 'Y', code: 'KeyY', finger: 'right-index', width: 'w-10 md:w-12' },
    { key: 'u', label: 'U', code: 'KeyU', finger: 'right-index', width: 'w-10 md:w-12' },
    { key: 'i', label: 'I', code: 'KeyI', finger: 'right-middle', width: 'w-10 md:w-12' },
    { key: 'o', label: 'O', code: 'KeyO', finger: 'right-ring', width: 'w-10 md:w-12' },
    { key: 'p', label: 'P', code: 'KeyP', finger: 'right-pinky', width: 'w-10 md:w-12' },
    { key: '[', shiftLabel: '{', code: 'BracketLeft', finger: 'right-pinky', width: 'w-10 md:w-12' },
    { key: ']', shiftLabel: '}', code: 'BracketRight', finger: 'right-pinky', width: 'w-10 md:w-12' },
    { key: '\\', shiftLabel: '|', code: 'Backslash', finger: 'right-pinky', width: 'w-10 md:w-12' },
  ],
  // Home row (ASDF JKL;) - F and J have tactile bumps!
  [
    { key: 'CapsLock', label: 'Caps 大写', code: 'CapsLock', finger: 'left-pinky', width: 'w-16 md:w-20' },
    { key: 'a', label: 'A', code: 'KeyA', finger: 'left-pinky', width: 'w-10 md:w-12' },
    { key: 's', label: 'S', code: 'KeyS', finger: 'left-ring', width: 'w-10 md:w-12' },
    { key: 'd', label: 'D', code: 'KeyD', finger: 'left-middle', width: 'w-10 md:w-12' },
    { key: 'f', label: 'F', code: 'KeyF', finger: 'left-index', width: 'w-10 md:w-12', isHomeKey: true },
    { key: 'g', label: 'G', code: 'KeyG', finger: 'left-index', width: 'w-10 md:w-12' },
    { key: 'h', label: 'H', code: 'KeyH', finger: 'right-index', width: 'w-10 md:w-12' },
    { key: 'j', label: 'J', code: 'KeyJ', finger: 'right-index', width: 'w-10 md:w-12', isHomeKey: true },
    { key: 'k', label: 'K', code: 'KeyK', finger: 'right-middle', width: 'w-10 md:w-12' },
    { key: 'l', label: 'L', code: 'KeyL', finger: 'right-ring', width: 'w-10 md:w-12' },
    { key: ';', shiftLabel: ':', code: 'Semicolon', finger: 'right-pinky', width: 'w-10 md:w-12' },
    { key: '\'', shiftLabel: '"', code: 'Quote', finger: 'right-pinky', width: 'w-10 md:w-12' },
    { key: 'Enter', label: '⏎ 回车', code: 'Enter', finger: 'right-pinky', width: 'flex-1 md:w-24' },
  ],
  // Bottom row (ZXCV BNM)
  [
    { key: 'Shift', label: '⇧ Shift', code: 'ShiftLeft', finger: 'left-pinky', width: 'w-20 md:w-24' },
    { key: 'z', label: 'Z', code: 'KeyZ', finger: 'left-pinky', width: 'w-10 md:w-12' },
    { key: 'x', label: 'X', code: 'KeyX', finger: 'left-ring', width: 'w-10 md:w-12' },
    { key: 'c', label: 'C', code: 'KeyC', finger: 'left-middle', width: 'w-10 md:w-12' },
    { key: 'v', label: 'V', code: 'KeyV', finger: 'left-index', width: 'w-10 md:w-12' },
    { key: 'b', label: 'B', code: 'KeyB', finger: 'left-index', width: 'w-10 md:w-12' },
    { key: 'n', label: 'N', code: 'KeyN', finger: 'right-index', width: 'w-10 md:w-12' },
    { key: 'm', label: 'M', code: 'KeyM', finger: 'right-index', width: 'w-10 md:w-12' },
    { key: ',', shiftLabel: '<', code: 'Comma', finger: 'right-middle', width: 'w-10 md:w-12' },
    { key: '.', shiftLabel: '>', code: 'Period', finger: 'right-ring', width: 'w-10 md:w-12' },
    { key: '/', shiftLabel: '?', code: 'Slash', finger: 'right-pinky', width: 'w-10 md:w-12' },
    { key: 'Shift', label: '⇧ Shift', code: 'ShiftRight', finger: 'right-pinky', width: 'flex-1 md:w-28' },
  ],
  // Spacebar row
  [
    { key: 'Ctrl', label: 'Ctrl', code: 'ControlLeft', finger: 'left-pinky', width: 'w-12 md:w-16' },
    { key: 'Alt', label: 'Alt', code: 'AltLeft', finger: 'thumb', width: 'w-12 md:w-16' },
    { key: ' ', label: '␣ 空格键 (大拇指)', code: 'Space', finger: 'thumb', width: 'flex-1 max-w-md' },
    { key: 'Alt', label: 'Alt', code: 'AltRight', finger: 'thumb', width: 'w-12 md:w-16' },
    { key: 'Ctrl', label: 'Ctrl', code: 'ControlRight', finger: 'right-pinky', width: 'w-12 md:w-16' },
  ],
];
