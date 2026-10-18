'use client';

import React from 'react';
import { ActiveTab, ThemeMode } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { Volume2, VolumeX, Settings as SettingsIcon } from 'lucide-react';

interface TopBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  soundEnabled = true,
  onToggleSound,
}) => {
  const { theme, setTheme } = useTheme();

  const themes: { id: ThemeMode; label: string }[] = [
    { id: 'midnight', label: 'Midnight' },
    { id: 'ember', label: 'Ember' },
    { id: 'paper', label: 'Paper' },
    { id: 'forest', label: 'Forest' },
  ];

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'test', label: 'test' },
    { id: 'learn', label: 'learn' },
    { id: 'history', label: 'history' },
    { id: 'settings', label: 'settings' },
  ];

  return (
    <header className="relative z-10 w-full border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-none transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand with custom SVG Keycap Mark */}
        <div className="flex items-center space-x-3 select-none">
          <div
            className="w-8 h-8 rounded-[6px] border border-[var(--border)] bg-[var(--panel)] flex items-center justify-center shadow-sm"
            style={{
              boxShadow: 'inset 0 1px 0 var(--key-highlight), 0 2px 0 var(--key-shadow)',
            }}
          >
            {/* Custom SVG Keycap Mark */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <path d="M9 8v8" />
              <path d="M9 12l6-4" />
              <path d="M9 12l6 4" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="font-semibold text-base tracking-normal text-[var(--text)]">
              KeyFlow
            </span>
            <span className="text-[10px] tracking-wider uppercase text-[var(--text-muted)] font-mono -mt-1">
              Midnight Studio
            </span>
          </div>
        </div>

        {/* Minimal Text Navigation with Accent Underline */}
        <nav
          className="flex items-center space-x-8 text-sm"
          aria-label="Main Navigation"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative py-1 font-mono lowercase tracking-wide transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                  isActive
                    ? 'text-[var(--text)] font-medium'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)] transition-all duration-200"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Sound, Quick Settings & Theme Switcher */}
        <div className="flex items-center space-x-3">
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
              className="p-1.5 rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
              title={soundEnabled ? 'Mute mechanical key click' : 'Unmute key click'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4 text-[var(--error)]" />
              )}
            </button>
          )}

          {/* Quick Settings Button */}
          <button
            onClick={() => onTabChange('settings')}
            aria-label="Open workspace settings"
            className={`p-1.5 rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
              activeTab === 'settings'
                ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--panel)]'
                : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)]'
            }`}
            title="Workspace Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Theme Selector */}
          <div
            className="flex items-center p-0.5 rounded-md border border-[var(--border)] bg-[var(--panel)]"
            role="radiogroup"
            aria-label="Theme selector"
          >
            {themes.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setTheme(t.id)}
                  className={`px-2.5 py-1 text-xs font-mono lowercase rounded-[4px] transition-all duration-150 focus-visible:outline-none ${
                    isSelected
                      ? 'bg-[var(--bg)] text-[var(--accent)] border border-[var(--border)] font-medium'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
