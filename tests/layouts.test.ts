import { describe, it, expect } from 'vitest';
import {
  getKeyboardLayout,
  charToEventCode,
  isShiftRequired,
  codeToLayoutChar,
  QWERTY_LAYOUT,
  COLEMAK_LAYOUT,
  DVORAK_LAYOUT,
  WORKMAN_LAYOUT,
  CustomLayout,
} from '../lib/layouts';

describe('Keyboard Layout Subsystem', () => {
  it('retrieves default and preset layouts properly', () => {
    expect(getKeyboardLayout('qwerty')).toBe(QWERTY_LAYOUT);
    expect(getKeyboardLayout('colemak')).toBe(COLEMAK_LAYOUT);
    expect(getKeyboardLayout('dvorak')).toBe(DVORAK_LAYOUT);
    expect(getKeyboardLayout('workman')).toBe(WORKMAN_LAYOUT);
    // Fallback for unknown preset
    expect(getKeyboardLayout('unknown')).toBe(QWERTY_LAYOUT);
  });

  it('retrieves custom layout by custom id', () => {
    const custom: CustomLayout = {
      id: 'custom-mine',
      name: 'My Layout',
      rows: [[{ code: 'KeyA', label: 'x', shiftLabel: 'X' }]],
    };
    const retrieved = getKeyboardLayout('custom-mine', [custom]);
    expect(retrieved).toBe(custom.rows);
  });

  it('maps characters to event code on QWERTY', () => {
    expect(charToEventCode(' ')).toBe('Space');
    expect(charToEventCode('a')).toBe('KeyA');
    expect(charToEventCode('A')).toBe('KeyA');
    expect(charToEventCode('1')).toBe('Digit1');
    expect(charToEventCode('!')).toBe('Digit1');
    expect(charToEventCode(';')).toBe('Semicolon');
    expect(charToEventCode(':')).toBe('Semicolon');
  });

  it('maps characters to event code on Dvorak', () => {
    const codeA = charToEventCode('a', DVORAK_LAYOUT);
    expect(codeA).toBe('KeyA');
    const codeO = charToEventCode('o', DVORAK_LAYOUT);
    expect(codeO).toBe('KeyO');
    const commaCode = charToEventCode(',', DVORAK_LAYOUT);
    expect(commaCode).toBe('Comma');
  });

  it('detects shift requirement accurately', () => {
    expect(isShiftRequired(' ')).toBe(false);
    expect(isShiftRequired('a')).toBe(false);
    expect(isShiftRequired('A')).toBe(true);
    expect(isShiftRequired('1')).toBe(false);
    expect(isShiftRequired('!')).toBe(true);
    expect(isShiftRequired('@')).toBe(true);
    expect(isShiftRequired('?')).toBe(true);
  });

  it('translates physical key codes to layout characters', () => {
    // QWERTY
    expect(codeToLayoutChar('Space', false, QWERTY_LAYOUT)).toBe(' ');
    expect(codeToLayoutChar('KeyQ', false, QWERTY_LAYOUT)).toBe('q');
    expect(codeToLayoutChar('KeyQ', true, QWERTY_LAYOUT)).toBe('Q');

    // Workman
    expect(codeToLayoutChar('KeyW', false, WORKMAN_LAYOUT)).toBe('w');
    expect(codeToLayoutChar('KeyW', true, WORKMAN_LAYOUT)).toBe('W');
    expect(codeToLayoutChar('KeyA', false, WORKMAN_LAYOUT)).toBe('a');
  });
});
