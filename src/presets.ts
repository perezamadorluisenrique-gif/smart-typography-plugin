/**
 * Style presets: a few switches set together, offered the first time the
 * plugin loads and again in the settings. They never touch the user's
 * excluded folders or custom replacement rules.
 */

import { t } from './i18n.ts';
import { DEFAULT_SETTINGS } from './settings.ts';
import type { SmartTypographySettings } from './settings.ts';

export type StylePresetValues = Pick<
  SmartTypographySettings,
  | 'smartApostrophes'
  | 'skipClosingQuote'
  | 'dashes'
  | 'ellipsis'
  | 'arrows'
  | 'mathSymbols'
  | 'capitalizeSentences'
  | 'tabOut'
  | 'wrapSelection'
> &
  Partial<Pick<SmartTypographySettings, 'quoteStyle'>>;

export interface StylePreset {
  id: string;
  /** Shown to the user, in the app's language. */
  readonly label: string;
  readonly desc: string;
  /** Quote style stays as it is unless the preset names one. */
  values: StylePresetValues;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'default',
    get label() {
      return t('stylePreset.default.label');
    },
    get desc() {
      return t('stylePreset.default.desc');
    },
    values: {
      smartApostrophes: DEFAULT_SETTINGS.smartApostrophes,
      skipClosingQuote: DEFAULT_SETTINGS.skipClosingQuote,
      dashes: DEFAULT_SETTINGS.dashes,
      ellipsis: DEFAULT_SETTINGS.ellipsis,
      arrows: DEFAULT_SETTINGS.arrows,
      mathSymbols: DEFAULT_SETTINGS.mathSymbols,
      capitalizeSentences: DEFAULT_SETTINGS.capitalizeSentences,
      tabOut: DEFAULT_SETTINGS.tabOut,
      wrapSelection: DEFAULT_SETTINGS.wrapSelection,
    },
  },
  {
    id: 'writer',
    get label() {
      return t('stylePreset.writer.label');
    },
    get desc() {
      return t('stylePreset.writer.desc');
    },
    values: {
      smartApostrophes: true,
      skipClosingQuote: true,
      dashes: true,
      ellipsis: true,
      arrows: false,
      mathSymbols: false,
      capitalizeSentences: true,
      tabOut: true,
      wrapSelection: true,
    },
  },
  {
    id: 'academic',
    get label() {
      return t('stylePreset.academic.label');
    },
    get desc() {
      return t('stylePreset.academic.desc');
    },
    values: {
      smartApostrophes: true,
      skipClosingQuote: true,
      dashes: true,
      ellipsis: true,
      arrows: true,
      mathSymbols: true,
      capitalizeSentences: true,
      tabOut: true,
      wrapSelection: true,
    },
  },
  {
    id: 'developer',
    get label() {
      return t('stylePreset.developer.label');
    },
    get desc() {
      return t('stylePreset.developer.desc');
    },
    values: {
      quoteStyle: 'off',
      smartApostrophes: false,
      skipClosingQuote: true,
      dashes: false,
      ellipsis: false,
      arrows: true,
      mathSymbols: true,
      capitalizeSentences: false,
      tabOut: true,
      wrapSelection: false,
    },
  },
];

/** `settings` with the preset's values applied; other settings are untouched. */
export function applyStylePreset(
  settings: SmartTypographySettings,
  preset: StylePreset,
): SmartTypographySettings {
  return { ...settings, ...preset.values };
}

/**
 * Whether the plugin should show the first-run preset prompt: only when
 * nothing was ever saved (`stored` is null) and the prompt was not shown.
 * Anyone with a data.json is an existing user and is never asked.
 */
export function shouldPromptForPreset(stored: Partial<SmartTypographySettings> | null | undefined): boolean {
  if (stored === null || stored === undefined || typeof stored !== 'object') return true;
  return stored.presetPrompted === false;
}
