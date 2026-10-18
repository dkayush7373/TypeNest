export interface KeyDefinition {
  code: string;
  label: string;
  shiftLabel?: string;
  width?: number; // relative multiplier, 1 is standard key
  finger?: number; // 1-4 left hand (pinky to index), 5-6 thumbs, 7-10 right hand (index to pinky)
}

export type KeyboardLayoutType = 'qwerty' | 'colemak' | 'dvorak';

export const QWERTY_LAYOUT: KeyDefinition[][] = [
  // Number row
  [
    { code: 'Backquote', label: '`', shiftLabel: '~', finger: 1 },
    { code: 'Digit1', label: '1', shiftLabel: '!', finger: 1 },
    { code: 'Digit2', label: '2', shiftLabel: '@', finger: 2 },
    { code: 'Digit3', label: '3', shiftLabel: '#', finger: 3 },
    { code: 'Digit4', label: '4', shiftLabel: '$', finger: 4 },
    { code: 'Digit5', label: '5', shiftLabel: '%', finger: 4 },
    { code: 'Digit6', label: '6', shiftLabel: '^', finger: 7 },
    { code: 'Digit7', label: '7', shiftLabel: '&', finger: 7 },
    { code: 'Digit8', label: '8', shiftLabel: '*', finger: 8 },
    { code: 'Digit9', label: '9', shiftLabel: '(', finger: 9 },
    { code: 'Digit0', label: '0', shiftLabel: ')', finger: 10 },
    { code: 'Minus', label: '-', shiftLabel: '_', finger: 10 },
    { code: 'Equal', label: '=', shiftLabel: '+', finger: 10 },
    { code: 'Backspace', label: 'backspace', width: 2, finger: 10 },
  ],
  // Top row
  [
    { code: 'Tab', label: 'tab', width: 1.5, finger: 1 },
    { code: 'KeyQ', label: 'q', shiftLabel: 'Q', finger: 1 },
    { code: 'KeyW', label: 'w', shiftLabel: 'W', finger: 2 },
    { code: 'KeyE', label: 'e', shiftLabel: 'E', finger: 3 },
    { code: 'KeyR', label: 'r', shiftLabel: 'R', finger: 4 },
    { code: 'KeyT', label: 't', shiftLabel: 'T', finger: 4 },
    { code: 'KeyY', label: 'y', shiftLabel: 'Y', finger: 7 },
    { code: 'KeyU', label: 'u', shiftLabel: 'U', finger: 7 },
    { code: 'KeyI', label: 'i', shiftLabel: 'I', finger: 8 },
    { code: 'KeyO', label: 'o', shiftLabel: 'O', finger: 9 },
    { code: 'KeyP', label: 'p', shiftLabel: 'P', finger: 10 },
    { code: 'BracketLeft', label: '[', shiftLabel: '{', finger: 10 },
    { code: 'BracketRight', label: ']', shiftLabel: '}', finger: 10 },
    { code: 'Backslash', label: '\\', shiftLabel: '|', width: 1.5, finger: 10 },
  ],
  // Home row
  [
    { code: 'CapsLock', label: 'caps', width: 1.75, finger: 1 },
    { code: 'KeyA', label: 'a', shiftLabel: 'A', finger: 1 },
    { code: 'KeyS', label: 's', shiftLabel: 'S', finger: 2 },
    { code: 'KeyD', label: 'd', shiftLabel: 'D', finger: 3 },
    { code: 'KeyF', label: 'f', shiftLabel: 'F', finger: 4 },
    { code: 'KeyG', label: 'g', shiftLabel: 'G', finger: 4 },
    { code: 'KeyH', label: 'h', shiftLabel: 'H', finger: 7 },
    { code: 'KeyJ', label: 'j', shiftLabel: 'J', finger: 7 },
    { code: 'KeyK', label: 'k', shiftLabel: 'K', finger: 8 },
    { code: 'KeyL', label: 'l', shiftLabel: 'L', finger: 9 },
    { code: 'Semicolon', label: ';', shiftLabel: ':', finger: 10 },
    { code: 'Quote', label: "'", shiftLabel: '"', finger: 10 },
    { code: 'Enter', label: 'enter', width: 2.25, finger: 10 },
  ],
  // Bottom row
  [
    { code: 'ShiftLeft', label: 'shift', width: 2.25, finger: 1 },
    { code: 'KeyZ', label: 'z', shiftLabel: 'Z', finger: 1 },
    { code: 'KeyX', label: 'x', shiftLabel: 'X', finger: 2 },
    { code: 'KeyC', label: 'c', shiftLabel: 'C', finger: 3 },
    { code: 'KeyV', label: 'v', shiftLabel: 'V', finger: 4 },
    { code: 'KeyB', label: 'b', shiftLabel: 'B', finger: 4 },
    { code: 'KeyN', label: 'n', shiftLabel: 'N', finger: 7 },
    { code: 'KeyM', label: 'm', shiftLabel: 'M', finger: 7 },
    { code: 'Comma', label: ',', shiftLabel: '<', finger: 8 },
    { code: 'Period', label: '.', shiftLabel: '>', finger: 9 },
    { code: 'Slash', label: '/', shiftLabel: '?', finger: 10 },
    { code: 'ShiftRight', label: 'shift', width: 2.75, finger: 10 },
  ],
  // Space row
  [
    { code: 'ControlLeft', label: 'ctrl', width: 1.5, finger: 1 },
    { code: 'MetaLeft', label: 'cmd', width: 1.25, finger: 1 },
    { code: 'AltLeft', label: 'alt', width: 1.25, finger: 1 },
    { code: 'Space', label: '', width: 6.25, finger: 5 },
    { code: 'AltRight', label: 'alt', width: 1.25, finger: 10 },
    { code: 'MetaRight', label: 'fn', width: 1.25, finger: 10 },
    { code: 'ControlRight', label: 'ctrl', width: 1.5, finger: 10 },
  ],
];

export const COLEMAK_LAYOUT: KeyDefinition[][] = [
  QWERTY_LAYOUT[0],
  [
    { code: 'Tab', label: 'tab', width: 1.5, finger: 1 },
    { code: 'KeyQ', label: 'q', shiftLabel: 'Q', finger: 1 },
    { code: 'KeyW', label: 'w', shiftLabel: 'W', finger: 2 },
    { code: 'KeyF', label: 'f', shiftLabel: 'F', finger: 3 },
    { code: 'KeyP', label: 'p', shiftLabel: 'P', finger: 4 },
    { code: 'KeyG', label: 'g', shiftLabel: 'G', finger: 4 },
    { code: 'KeyJ', label: 'j', shiftLabel: 'J', finger: 7 },
    { code: 'KeyL', label: 'l', shiftLabel: 'L', finger: 7 },
    { code: 'KeyU', label: 'u', shiftLabel: 'U', finger: 8 },
    { code: 'KeyY', label: 'y', shiftLabel: 'Y', finger: 9 },
    { code: 'Semicolon', label: ';', shiftLabel: ':', finger: 10 },
    { code: 'BracketLeft', label: '[', shiftLabel: '{', finger: 10 },
    { code: 'BracketRight', label: ']', shiftLabel: '}', finger: 10 },
    { code: 'Backslash', label: '\\', shiftLabel: '|', width: 1.5, finger: 10 },
  ],
  [
    { code: 'CapsLock', label: 'backspace', width: 1.75, finger: 1 },
    { code: 'KeyA', label: 'a', shiftLabel: 'A', finger: 1 },
    { code: 'KeyR', label: 'r', shiftLabel: 'R', finger: 2 },
    { code: 'KeyS', label: 's', shiftLabel: 'S', finger: 3 },
    { code: 'KeyT', label: 't', shiftLabel: 'T', finger: 4 },
    { code: 'KeyD', label: 'd', shiftLabel: 'D', finger: 4 },
    { code: 'KeyH', label: 'h', shiftLabel: 'H', finger: 7 },
    { code: 'KeyN', label: 'n', shiftLabel: 'N', finger: 7 },
    { code: 'KeyE', label: 'e', shiftLabel: 'E', finger: 8 },
    { code: 'KeyI', label: 'i', shiftLabel: 'I', finger: 9 },
    { code: 'KeyO', label: 'o', shiftLabel: 'O', finger: 10 },
    { code: 'Quote', label: "'", shiftLabel: '"', finger: 10 },
    { code: 'Enter', label: 'enter', width: 2.25, finger: 10 },
  ],
  [
    { code: 'ShiftLeft', label: 'shift', width: 2.25, finger: 1 },
    { code: 'KeyZ', label: 'z', shiftLabel: 'Z', finger: 1 },
    { code: 'KeyX', label: 'x', shiftLabel: 'X', finger: 2 },
    { code: 'KeyC', label: 'c', shiftLabel: 'C', finger: 3 },
    { code: 'KeyV', label: 'v', shiftLabel: 'V', finger: 4 },
    { code: 'KeyB', label: 'b', shiftLabel: 'B', finger: 4 },
    { code: 'KeyK', label: 'k', shiftLabel: 'K', finger: 7 },
    { code: 'KeyM', label: 'm', shiftLabel: 'M', finger: 7 },
    { code: 'Comma', label: ',', shiftLabel: '<', finger: 8 },
    { code: 'Period', label: '.', shiftLabel: '>', finger: 9 },
    { code: 'Slash', label: '/', shiftLabel: '?', finger: 10 },
    { code: 'ShiftRight', label: 'shift', width: 2.75, finger: 10 },
  ],
  QWERTY_LAYOUT[4],
];

export const DVORAK_LAYOUT: KeyDefinition[][] = [
  QWERTY_LAYOUT[0],
  [
    { code: 'Tab', label: 'tab', width: 1.5, finger: 1 },
    { code: 'Quote', label: "'", shiftLabel: '"', finger: 1 },
    { code: 'Comma', label: ',', shiftLabel: '<', finger: 2 },
    { code: 'Period', label: '.', shiftLabel: '>', finger: 3 },
    { code: 'KeyP', label: 'p', shiftLabel: 'P', finger: 4 },
    { code: 'KeyY', label: 'y', shiftLabel: 'Y', finger: 4 },
    { code: 'KeyF', label: 'f', shiftLabel: 'F', finger: 7 },
    { code: 'KeyG', label: 'g', shiftLabel: 'G', finger: 7 },
    { code: 'KeyC', label: 'c', shiftLabel: 'C', finger: 8 },
    { code: 'KeyR', label: 'r', shiftLabel: 'R', finger: 9 },
    { code: 'KeyL', label: 'l', shiftLabel: 'L', finger: 10 },
    { code: 'Slash', label: '/', shiftLabel: '?', finger: 10 },
    { code: 'Equal', label: '=', shiftLabel: '+', finger: 10 },
    { code: 'Backslash', label: '\\', shiftLabel: '|', width: 1.5, finger: 10 },
  ],
  [
    { code: 'CapsLock', label: 'caps', width: 1.75, finger: 1 },
    { code: 'KeyA', label: 'a', shiftLabel: 'A', finger: 1 },
    { code: 'KeyO', label: 'o', shiftLabel: 'O', finger: 2 },
    { code: 'KeyE', label: 'e', shiftLabel: 'E', finger: 3 },
    { code: 'KeyU', label: 'u', shiftLabel: 'U', finger: 4 },
    { code: 'KeyI', label: 'i', shiftLabel: 'I', finger: 4 },
    { code: 'KeyD', label: 'd', shiftLabel: 'D', finger: 7 },
    { code: 'KeyH', label: 'h', shiftLabel: 'H', finger: 7 },
    { code: 'KeyT', label: 't', shiftLabel: 'T', finger: 8 },
    { code: 'KeyN', label: 'n', shiftLabel: 'N', finger: 9 },
    { code: 'KeyS', label: 's', shiftLabel: 'S', finger: 10 },
    { code: 'Minus', label: '-', shiftLabel: '_', finger: 10 },
    { code: 'Enter', label: 'enter', width: 2.25, finger: 10 },
  ],
  [
    { code: 'ShiftLeft', label: 'shift', width: 2.25, finger: 1 },
    { code: 'Semicolon', label: ';', shiftLabel: ':', finger: 1 },
    { code: 'KeyQ', label: 'q', shiftLabel: 'Q', finger: 2 },
    { code: 'KeyJ', label: 'j', shiftLabel: 'J', finger: 3 },
    { code: 'KeyK', label: 'k', shiftLabel: 'K', finger: 4 },
    { code: 'KeyX', label: 'x', shiftLabel: 'X', finger: 4 },
    { code: 'KeyB', label: 'b', shiftLabel: 'B', finger: 7 },
    { code: 'KeyM', label: 'm', shiftLabel: 'M', finger: 7 },
    { code: 'KeyW', label: 'w', shiftLabel: 'W', finger: 8 },
    { code: 'KeyV', label: 'v', shiftLabel: 'V', finger: 9 },
    { code: 'KeyZ', label: 'z', shiftLabel: 'Z', finger: 10 },
    { code: 'ShiftRight', label: 'shift', width: 2.75, finger: 10 },
  ],
  QWERTY_LAYOUT[4],
];

/**
 * Returns the keyboard layout matrix according to the selected layout type.
 */
export function getKeyboardLayout(layout: KeyboardLayoutType = 'qwerty'): KeyDefinition[][] {
  switch (layout) {
    case 'colemak':
      return COLEMAK_LAYOUT;
    case 'dvorak':
      return DVORAK_LAYOUT;
    case 'qwerty':
    default:
      return QWERTY_LAYOUT;
  }
}

/**
 * Map character to physical event.code for lighting targets.
 */
export function charToEventCode(char: string): string | null {
  if (!char) return null;
  if (char === ' ') return 'Space';

  const lower = char.toLowerCase();
  if (lower >= 'a' && lower <= 'z') {
    return `Key${lower.toUpperCase()}`;
  }
  if (lower >= '0' && lower <= '9') {
    return `Digit${lower}`;
  }
  const symbolMap: Record<string, string> = {
    '-': 'Minus', '_': 'Minus',
    '=': 'Equal', '+': 'Equal',
    '[': 'BracketLeft', '{': 'BracketLeft',
    ']': 'BracketRight', '}': 'BracketRight',
    '\\': 'Backslash', '|': 'Backslash',
    ';': 'Semicolon', ':': 'Semicolon',
    "'": 'Quote', '"': 'Quote',
    ',': 'Comma', '<': 'Comma',
    '.': 'Period', '>': 'Period',
    '/': 'Slash', '?': 'Slash',
    '`': 'Backquote', '~': 'Backquote',
    '!': 'Digit1', '@': 'Digit2', '#': 'Digit3', '$': 'Digit4',
    '%': 'Digit5', '^': 'Digit6', '&': 'Digit7', '*': 'Digit8',
    '(': 'Digit9', ')': 'Digit0',
  };

  return symbolMap[char] || null;
}
