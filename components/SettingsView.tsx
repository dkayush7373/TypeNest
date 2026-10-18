'use client';

import React from 'react';
import { UserSettings, ThemeMode, DailyGoalOption } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import {
  Palette,
  Type,
  Volume2,
  VolumeX,
  Keyboard as KeyboardIcon,
  Flame,
} from 'lucide-react';
import { CustomLayout } from '@/lib/layouts';
import { getSafeStorage } from '@/lib/storage';
import { LAYOUTS_STORAGE_KEY } from '@/components/LayoutBuilder';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onTestSound: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onTestSound,
}) => {
  const { theme, setTheme } = useTheme();

  const customLayouts = getSafeStorage<CustomLayout[]>(LAYOUTS_STORAGE_KEY, []);

  const themes: { id: ThemeMode; label: string; desc: string }[] = [
    {
      id: 'midnight',
      label: 'Midnight (Default)',
      desc: 'Deep ink teal base with cyan accent. Calm and distraction-free.',
    },
    {
      id: 'ember',
      label: 'Ember',
      desc: 'Dark espresso base with warm mechanical amber accent.',
    },
    {
      id: 'paper',
      label: 'Paper',
      desc: 'Crisp light workspace with deep forest teal contrast.',
    },
    {
      id: 'forest',
      label: 'Forest',
      desc: 'Deep pine obsidian base with vibrant emerald green accent.',
    },
  ];

  const presetLayouts = [
    { id: 'qwerty', label: 'QWERTY', desc: 'Standard universal layout' },
    { id: 'colemak', label: 'Colemak', desc: 'Ergonomic high-flow typing' },
    { id: 'dvorak', label: 'Dvorak', desc: 'Vowels centered on home row' },
    { id: 'workman', label: 'Workman', desc: 'Optimized finger movement balance' },
  ];

  const fontSizes: { id: 'small' | 'medium' | 'large'; label: string }[] = [
    { id: 'small', label: 'Compact (24px)' },
    { id: 'medium', label: 'Standard (28px)' },
    { id: 'large', label: 'Spacious (32px)' },
  ];

  const caretStyles: { id: 'line' | 'block' | 'underline'; label: string }[] = [
    { id: 'line', label: 'Smooth Line' },
    { id: 'block', label: 'Solid Block' },
    { id: 'underline', label: 'Underline' },
  ];

  const soundPacks: { id: 'soft' | 'clicky' | 'thock'; label: string; desc: string }[] = [
    { id: 'soft', label: 'Linear Soft', desc: 'Subtle damped keystroke acoustics' },
    { id: 'clicky', label: 'Clicky Blue', desc: 'Crisp mechanical tactile feedback' },
    { id: 'thock', label: 'Deep Thock', desc: 'Deep resonance plate acoustic signature' },
  ];

  const dailyGoals: { id: DailyGoalOption; label: string; desc: string }[] = [
    { id: '1-session', label: '1 Session / day', desc: 'Recommended minimum consistency habit' },
    { id: '3-sessions', label: '3 Sessions / day', desc: 'Steadily build velocity and speed' },
    { id: '5-minutes', label: '5 Minutes / day', desc: 'Dedicated daily endurance block' },
  ];

  return (
    <div className="w-full max-w-4xl flex flex-col space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--border)]">
        <h2 className="text-2xl font-bold tracking-normal text-[var(--text)]">
          Workspace Settings
        </h2>
        <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
          Custom configurations persist locally and apply across all typing modes in real time.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Visual Theme */}
        <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--panel)] space-y-4">
          <div className="flex items-center space-x-2 text-[var(--text)] font-semibold text-sm">
            <Palette className="w-4 h-4 text-[var(--accent)]" />
            <span>Studio Color Theme</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {themes.map((t) => {
              const selected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    onUpdateSettings({ theme: t.id });
                  }}
                  className={`p-3.5 rounded-md border text-left transition-all select-none focus-visible:outline-none ${
                    selected
                      ? 'border-[var(--accent)] bg-[var(--bg)] shadow-xs'
                      : 'border-[var(--border)] bg-[var(--panel)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-xs text-[var(--text)] font-mono">
                      {t.label}
                    </span>
                    {selected && (
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-[var(--text-muted)] leading-relaxed">
                    {t.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Daily Streak Goal */}
        <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--panel)] space-y-4">
          <div className="flex items-center space-x-2 text-[var(--text)] font-semibold text-sm">
            <Flame className="w-4 h-4 text-[var(--accent)]" />
            <span>Daily Practice Goal & Streak Settings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {dailyGoals.map((g) => {
              const selected = (settings.dailyGoal || '1-session') === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => onUpdateSettings({ dailyGoal: g.id })}
                  className={`p-3.5 rounded-md border text-left transition-all select-none focus-visible:outline-none ${
                    selected
                      ? 'border-[var(--accent)] bg-[var(--bg)] shadow-xs'
                      : 'border-[var(--border)] bg-[var(--panel)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-[var(--text)] font-mono">
                      {g.label}
                    </span>
                    {selected && (
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-[var(--text-muted)]">
                    {g.desc}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={() =>
                onUpdateSettings({
                  showStreakBadge: settings.showStreakBadge !== false ? false : true,
                })
              }
              className={`px-3 py-1.5 rounded-md border text-xs font-mono transition-colors ${
                settings.showStreakBadge !== false
                  ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--bg)]'
                  : 'border-[var(--border)] text-[var(--text-muted)]'
              }`}
            >
              Top Bar Streak Badge: {settings.showStreakBadge !== false ? 'Shown' : 'Hidden'}
            </button>
          </div>
        </div>

        {/* Section 3: Mechanical Audio Feedback */}
        <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--panel)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[var(--text)] font-semibold text-sm">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[var(--accent)]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[var(--error)]" />
              )}
              <span>Tactile Mechanical Switch Audio</span>
            </div>

            <button
              onClick={() => {
                onUpdateSettings({ soundEnabled: !settings.soundEnabled });
              }}
              className={`px-3 py-1 rounded-md border text-xs font-mono font-medium transition-colors ${
                settings.soundEnabled
                  ? 'bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]'
                  : 'bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)]'
              }`}
            >
              {settings.soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {soundPacks.map((pack) => {
              const selected = (settings.soundPack || 'clicky') === pack.id;
              return (
                <button
                  key={pack.id}
                  disabled={!settings.soundEnabled}
                  onClick={() => onUpdateSettings({ soundPack: pack.id })}
                  className={`p-3 rounded-md border text-left transition-all select-none disabled:opacity-40 ${
                    selected
                      ? 'border-[var(--accent)] bg-[var(--bg)]'
                      : 'border-[var(--border)] bg-[var(--panel)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-[var(--text)] font-mono">
                      {pack.label}
                    </span>
                    {selected && (
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-[var(--text-muted)]">
                    {pack.desc}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--text-muted)]">Switch Volume:</span>
              <span className="font-semibold text-[var(--text)]">
                {Math.round(settings.soundVolume * 100)}%
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                disabled={!settings.soundEnabled}
                value={settings.soundVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ soundVolume: val });
                }}
                className="w-full accent-[var(--accent)] h-1.5 bg-[var(--bg)] rounded-lg cursor-pointer"
                aria-label="Sound volume slider"
              />
              <button
                onClick={onTestSound}
                disabled={!settings.soundEnabled}
                className="px-3 py-1 rounded border border-[var(--border)] text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)] disabled:opacity-40 transition-colors shrink-0"
              >
                Test Sound
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Keyboard Layout & Geometry */}
        <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--panel)] space-y-4">
          <div className="flex items-center space-x-2 text-[var(--text)] font-semibold text-sm">
            <KeyboardIcon className="w-4 h-4 text-[var(--accent)]" />
            <span>Keyboard Layout & Physical Mapping</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {presetLayouts.map((l) => {
              const selected = settings.layout === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => onUpdateSettings({ layout: l.id })}
                  className={`p-3.5 rounded-md border text-left transition-all select-none focus-visible:outline-none ${
                    selected
                      ? 'border-[var(--accent)] bg-[var(--bg)] shadow-xs'
                      : 'border-[var(--border)] bg-[var(--panel)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-[var(--text)] font-mono">
                      {l.label}
                    </span>
                    {selected && (
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-[var(--text-muted)]">
                    {l.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Custom layouts list if any */}
          {customLayouts.length > 0 && (
            <div className="pt-2 space-y-2">
              <span className="text-xs font-mono text-[var(--text-muted)] uppercase">Custom Layouts:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {customLayouts.map((c) => {
                  const selected = settings.layout === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => onUpdateSettings({ layout: c.id })}
                      className={`p-2.5 rounded border text-left font-mono text-xs ${
                        selected
                          ? 'border-[var(--accent)] bg-[var(--bg)] text-[var(--accent)] font-semibold'
                          : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center gap-3">
            <button
              onClick={() =>
                onUpdateSettings({ keyboardVisible: !settings.keyboardVisible })
              }
              className={`px-3 py-1.5 rounded-md border text-xs font-mono transition-colors ${
                settings.keyboardVisible
                  ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--bg)]'
                  : 'border-[var(--border)] text-[var(--text-muted)]'
              }`}
            >
              On-screen Keyboard: {settings.keyboardVisible ? 'Visible' : 'Hidden'}
            </button>

            <button
              onClick={() =>
                onUpdateSettings({ fingerColorsEnabled: !settings.fingerColorsEnabled })
              }
              className={`px-3 py-1.5 rounded-md border text-xs font-mono transition-colors ${
                settings.fingerColorsEnabled
                  ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--bg)]'
                  : 'border-[var(--border)] text-[var(--text-muted)]'
              }`}
            >
              Finger Placement Dots: {settings.fingerColorsEnabled ? 'On' : 'Off'}
            </button>

            <button
              onClick={() =>
                onUpdateSettings({ reducedMotion: !settings.reducedMotion })
              }
              className={`px-3 py-1.5 rounded-md border text-xs font-mono transition-colors ${
                settings.reducedMotion
                  ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--bg)]'
                  : 'border-[var(--border)] text-[var(--text-muted)]'
              }`}
            >
              Reduced Motion: {settings.reducedMotion ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Section 5: Typography & Caret */}
        <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--panel)] space-y-4">
          <div className="flex items-center space-x-2 text-[var(--text)] font-semibold text-sm">
            <Type className="w-4 h-4 text-[var(--accent)]" />
            <span>Typography & Caret Mechanics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Font Size */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-[var(--text-muted)] block">
                Typing Font Size
              </span>
              <div className="flex items-center space-x-2">
                {fontSizes.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onUpdateSettings({ fontSize: f.id })}
                    className={`flex-1 py-1.5 rounded-md border text-xs font-mono transition-colors ${
                      settings.fontSize === f.id
                        ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--bg)] font-semibold'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {f.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Caret Style */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-[var(--text-muted)] block">
                Caret Animation Style
              </span>
              <div className="flex items-center space-x-2">
                {caretStyles.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onUpdateSettings({ caretStyle: c.id })}
                    className={`flex-1 py-1.5 rounded-md border text-xs font-mono transition-colors ${
                      settings.caretStyle === c.id
                        ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--bg)] font-semibold'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {c.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

