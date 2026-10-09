/**
 * Quotation marks per note and per folder, for people who write in more
 * than one language.
 *
 * The convention for a note is worked out from, in this order:
 *
 *   1. the note's `typography-quotes` property,
 *   2. the note's `lang` property, when the setting for it is on,
 *   3. the most specific folder in "Quotes per folder" that holds the note,
 *   4. the global quotation marks setting.
 *
 * A value that names no convention is ignored and the next step decides, so
 * a typo never switches quotes off or changes them to something unexpected.
 */

import { folderList } from './scope.ts';
import { QUOTE_CONVENTIONS } from './settings.ts';
import type { QuoteStyleId, SmartTypographySettings } from './settings.ts';

/** The note property that sets the convention for one note. */
export const QUOTES_PROPERTY = 'typography-quotes';

/** The standard property that names a note's language. */
export const LANG_PROPERTY = 'lang';

/** Language codes (the part before any region) and the convention they use. */
const LANGUAGE_CODES: Record<string, QuoteStyleId> = {
  en: 'english',
  de: 'german',
  fr: 'french',
  es: 'spanish',
  sv: 'swedish',
  pl: 'polish',
  ru: 'russian',
};

/** Names other than the convention keys that are understood. */
const NAMES: Record<string, QuoteStyleId> = {
  deutsch: 'german',
  français: 'french',
  francais: 'french',
  español: 'spanish',
  espanol: 'spanish',
  svenska: 'swedish',
  polski: 'polish',
  русский: 'russian',
  off: 'off',
  none: 'off',
  straight: 'off',
};

/**
 * The convention a property value names, or null when it names none.
 * Understands the keys (`german`), a few readable names (`Deutsch`), `off`
 * for straight quotes, and language codes with or without a region
 * (`de`, `fr-CA`, `en_GB`), in any case.
 */
export function parseConvention(value: unknown): QuoteStyleId | null {
  if (value === false) return 'off';
  if (typeof value !== 'string') return null;
  const key = value.trim().toLowerCase();
  if (key === '') return null;
  if (key === 'off') return 'off';
  const known = QUOTE_CONVENTIONS.find((c) => c.id === key);
  if (known) return known.id;
  const named = new Map(Object.entries(NAMES)).get(key);
  return named ?? languageConvention(key);
}

/** The convention for a `lang` value such as `de` or `pt-BR`, or null. */
export function languageConvention(value: unknown): QuoteStyleId | null {
  if (typeof value !== 'string') return null;
  const primary = value.trim().toLowerCase().split(/[-_]/)[0];
  return new Map(Object.entries(LANGUAGE_CODES)).get(primary) ?? null;
}

export interface FolderQuote {
  folder: string;
  style: QuoteStyleId;
}

export interface IgnoredLine {
  line: number;
  text: string;
  reason: string;
}

/**
 * The "Quotes per folder" setting: one `folder -> convention` per line.
 * Lines that cannot be used are returned apart, with the reason.
 */
export function folderQuotesFor(setting: string): { folders: FolderQuote[]; ignored: IgnoredLine[] } {
  const folders: FolderQuote[] = [];
  const ignored: IgnoredLine[] = [];
  setting.split(/\r?\n/).forEach((text, index) => {
    if (text.trim() === '') return;
    const line = index + 1;
    const at = text.lastIndexOf('->');
    if (at === -1) {
      ignored.push({ line, text, reason: 'write the folder, then " -> ", then the convention' });
      return;
    }
    const folder = folderList(text.slice(0, at))[0];
    if (folder === undefined) {
      ignored.push({ line, text, reason: 'no folder before "->"' });
      return;
    }
    const style = parseConvention(text.slice(at + 2));
    if (style === null) {
      ignored.push({ line, text, reason: 'unknown convention' });
      return;
    }
    folders.push({ folder, style });
  });
  return { folders, ignored };
}

/** The convention of the most specific folder that holds `path`, or null. */
export function folderQuoteStyle(path: string, setting: string): QuoteStyleId | null {
  let best: FolderQuote | null = null;
  for (const entry of folderQuotesFor(setting).folders) {
    if (path !== entry.folder && !path.startsWith(entry.folder + '/')) continue;
    // Later lines win a tie between two lines for the same folder.
    if (best === null || entry.folder.length >= best.folder.length) best = entry;
  }
  return best === null ? null : best.style;
}

/** What a note says about itself: the two properties, as Obsidian gave them. */
export interface NoteQuoteInfo {
  path: string | null;
  quotes?: unknown;
  lang?: unknown;
}

/** The convention in force for a note. */
export function resolveQuoteStyle(note: NoteQuoteInfo, settings: SmartTypographySettings): QuoteStyleId {
  const fromProperty = parseConvention(note.quotes);
  if (fromProperty !== null) return fromProperty;
  if (settings.useLangProperty) {
    const fromLang = languageConvention(note.lang);
    if (fromLang !== null) return fromLang;
  }
  if (note.path !== null && settings.quotesByFolder) {
    const fromFolder = folderQuoteStyle(note.path, settings.quotesByFolder);
    if (fromFolder !== null) return fromFolder;
  }
  return settings.quoteStyle;
}

/**
 * The settings to hand the engine for a note: the same object when the
 * convention is the global one, otherwise a copy with the note's convention.
 */
export function settingsForNote(note: NoteQuoteInfo, settings: SmartTypographySettings): SmartTypographySettings {
  const style = resolveQuoteStyle(note, settings);
  return style === settings.quoteStyle ? settings : { ...settings, quoteStyle: style };
}
