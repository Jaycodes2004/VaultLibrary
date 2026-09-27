'use client';

import React from 'react';
import { X, Type, Check, Sparkles, Feather, Sun, Moon, Palette } from 'lucide-react';
import { CalligraphyLoader } from './CalligraphyLoader';
import { LightThemeId, DarkThemeId } from '../lib/types';

export interface TypographySetting {
  id: string;
  name: string;
  className: string;
  sample: string;
  description: string;
}

export const TYPOGRAPHY_OPTIONS: TypographySetting[] = [
  {
    id: 'calligraphy',
    name: 'Calligraphy Script (Default)',
    className: 'font-calligraphy',
    sample: 'The quick brown fox jumps over the lazy dog',
    description: 'Flowing hand-inscribed flourishes in the grand monastic tradition.',
  },
  {
    id: 'serif',
    name: 'Classic Editorial Serif',
    className: 'font-serif-classic',
    sample: 'The quick brown fox jumps over the lazy dog',
    description: 'Timeless literary proportions, ideal for long reading sessions.',
  },
  {
    id: 'cinzel',
    name: 'Regal Inscribed Roman',
    className: 'font-cinzel-regal',
    sample: 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG',
    description: 'Classical monumental capitals modeled on ancient stone carvings.',
  },
  {
    id: 'handwritten',
    name: 'Handwritten Marginalia',
    className: 'font-handwritten',
    sample: 'The quick brown fox jumps over the lazy dog',
    description: 'Organic scholar notebook script with expressive ink strokes.',
  },
  {
    id: 'sans',
    name: 'Modern Clean Sans',
    className: 'font-clean-sans',
    sample: 'The quick brown fox jumps over the lazy dog',
    description: 'Neutral, high-legibility geometric sans-serif.',
  },
];

export const LIGHT_THEMES: { id: LightThemeId; name: string; subtitle: string; previewBg: string; previewText: string }[] = [
  {
    id: 'vintage-slate',
    name: 'Vintage Slate & Charcoal (Default)',
    subtitle: 'Antique dark grey ink & slate borders over warm paper texture',
    previewBg: '#f2eee5',
    previewText: '#1e2329',
  },
  {
    id: 'antique-parchment',
    name: 'Antique Handcrafted Parchment',
    subtitle: 'Rich warm ochre and aged papyrus with handmade paper grain',
    previewBg: '#f6f1e6',
    previewText: '#2b1f17',
  },
  {
    id: 'monastic-ivory',
    name: 'Clean Monastic Ivory',
    subtitle: 'Crisp editorial ivory with deep sepia ink accents',
    previewBg: '#fbf9f5',
    previewText: '#2e2620',
  },
];

export const DARK_THEMES: { id: DarkThemeId; name: string; subtitle: string; previewBg: string; previewText: string }[] = [
  {
    id: 'archival-obsidian',
    name: 'Archival Obsidian & Bronze (Default)',
    subtitle: 'Deep charcoal-obsidian with antique bronze accents and warm cream ink',
    previewBg: '#12100e',
    previewText: '#ede5da',
  },
  {
    id: 'midnight-scholar',
    name: 'Midnight Scholar Ink',
    subtitle: 'Deep midnight blue-black with illuminated sapphire and frosty ink',
    previewBg: '#0b101d',
    previewText: '#e6edfa',
  },
  {
    id: 'forest-leather',
    name: 'Forest Hermetic Leather',
    subtitle: 'Bookbinder antique leather and dark emerald with gilded accents',
    previewBg: '#0b1410',
    previewText: '#e4ebe6',
  },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFontId: string;
  onSelectFont: (id: string) => void;
  themeMode: 'light' | 'dark';
  onToggleMode: (mode: 'light' | 'dark') => void;
  selectedLightTheme: LightThemeId;
  onSelectLightTheme: (theme: LightThemeId) => void;
  selectedDarkTheme: DarkThemeId;
  onSelectDarkTheme: (theme: DarkThemeId) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  selectedFontId,
  onSelectFont,
  themeMode,
  onToggleMode,
  selectedLightTheme,
  onSelectLightTheme,
  selectedDarkTheme,
  onSelectDarkTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="parchment-card rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative border shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Feather className="w-5 h-5 opacity-80" />
            <h2 className="text-lg font-bold tracking-tight">
              Aesthetics & Theme Customization Studio
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="mt-5">
          <label className="text-xs font-semibold uppercase tracking-wider opacity-70 block mb-2">
            Active Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onToggleMode('light')}
              className={`p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold border transition-all ${
                themeMode === 'light'
                  ? 'border-black/40 dark:border-white/40 bg-white/80 dark:bg-white/10 shadow-sm ring-2 ring-black/10'
                  : 'opacity-60 border-black/10 hover:opacity-100'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-600" />
              <span>Light Mode (Parchment & Paper)</span>
            </button>
            <button
              onClick={() => onToggleMode('dark')}
              className={`p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold border transition-all ${
                themeMode === 'dark'
                  ? 'border-black/40 dark:border-white/40 bg-black/80 text-white shadow-sm ring-2 ring-white/10'
                  : 'opacity-60 border-black/10 hover:opacity-100'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Dark Mode (Archival Obsidian)</span>
            </button>
          </div>
        </div>

        {/* 3 Light Themes Selection */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
              Choose Light Mode Template (3 Styles)
            </label>
            <span className="text-[11px] opacity-60">Used when in Light Mode</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {LIGHT_THEMES.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectLightTheme(t.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedLightTheme === t.id
                    ? 'border-black dark:border-white ring-2 ring-black/10 dark:ring-white/10 shadow-sm'
                    : 'border-black/10 dark:border-white/10 hover:border-black/30'
                }`}
                style={{ backgroundColor: t.previewBg, color: t.previewText }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{t.name.split(' (')[0]}</span>
                    {selectedLightTheme === t.id && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <p className="text-[10px] mt-1 opacity-75 leading-tight">{t.subtitle}</p>
                </div>
                <div className="mt-3 text-[10px] font-mono opacity-50 uppercase tracking-widest">
                  {t.id === 'vintage-slate' ? 'DEFAULT VINTAGE' : 'LIGHT PRESET'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Dark Themes Selection */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider opacity-70">
              Choose Dark Mode Template (3 Styles)
            </label>
            <span className="text-[11px] opacity-60">Used when in Dark Mode</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {DARK_THEMES.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectDarkTheme(t.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedDarkTheme === t.id
                    ? 'border-white ring-2 ring-white/20 shadow-md'
                    : 'border-white/10 hover:border-white/30'
                }`}
                style={{ backgroundColor: t.previewBg, color: t.previewText }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{t.name.split(' (')[0]}</span>
                    {selectedDarkTheme === t.id && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <p className="text-[10px] mt-1 opacity-75 leading-tight">{t.subtitle}</p>
                </div>
                <div className="mt-3 text-[10px] font-mono opacity-50 uppercase tracking-widest">
                  {t.id === 'archival-obsidian' ? 'DEFAULT DARK' : 'DARK PRESET'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography / Text Style Selector */}
        <div className="mt-6">
          <label className="text-xs font-semibold uppercase tracking-wider opacity-70 block mb-2">
            Text Style & Font Family (Default: Calligraphy)
          </label>
          <div className="space-y-2">
            {TYPOGRAPHY_OPTIONS.map((font) => (
              <div
                key={font.id}
                onClick={() => onSelectFont(font.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedFontId === font.id
                    ? 'border-black/50 dark:border-white/50 bg-black/5 dark:bg-white/5 ring-1 ring-black/20'
                    : 'border-black/10 dark:border-white/10 hover:border-black/25'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{font.name}</span>
                    {font.id === 'calligraphy' && (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold">
                        Default
                      </span>
                    )}
                  </div>
                  <div className={`text-base mt-0.5 ${font.className} truncate`}>
                    {font.sample}
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  selectedFontId === font.id
                    ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                    : 'border-black/20 dark:border-white/20'
                }`}>
                  {selectedFontId === font.id && <Check className="w-3 h-3" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calligraphy Loading Animation Demo */}
        <div className="mt-6 pt-5 border-t border-black/10 dark:border-white/10">
          <label className="text-xs font-semibold uppercase tracking-wider opacity-70 block mb-1">
            Writing & Drawing Animation (Loading)
          </label>
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
            <CalligraphyLoader label="Loading" subtext="Inscribing parchment with fountain pen nib..." />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="theme-accent-btn px-6 py-2 rounded-xl text-xs font-semibold shadow transition-all"
          >
            Apply & Inscribe Settings
          </button>
        </div>
      </div>
    </div>
  );
};
