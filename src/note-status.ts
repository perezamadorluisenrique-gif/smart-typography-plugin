/**
 * What the status bar says about the note in front of you: whether the
 * substitutions run there, which quotation marks you will get, and where
 * those marks come from. It answers "why are my quotes not curling here?"
 * without opening the settings.
 *
 * The order mirrors the editor exactly: an excluded folder or
 * `typography: off` keeps the note out; the quotes come from the note's
 * `typography-quotes`, then another plugin's resolver (`api.ts`), then
 * `lang` (when that switch is on), then Quotes per folder, then the setting.
 */

import { t } from './i18n.ts';
import { folderQuoteStyle, languageConvention, parseConvention } from './quotes.ts';
import { folderList, inFolder, isOff } from './scope.ts';
import { conventionFor } from './settings.ts';
import type { QuoteStyleId, SmartTypographySettings } from './settings.ts';

export type OffReason = 'folder' | 'property';
export type QuoteSource = 'property' | 'plugin' | 'lang' | 'folder' | 'default';

/** The note as the metadata cache describes it. */
export interface NoteFacts {
  path: string;
  /** The `typography` property. */
  typography?: unknown;
  /** The `typography-quotes` property. */
  quotes?: unknown;
  /** The `lang` property. */
  lang?: unknown;
}

export interface NoteStatus {
  /** Why nothing is substituted in this note, or null when typing is converted. */
  off: OffReason | null;
  quoteStyle: QuoteStyleId;
  source: QuoteSource;
}

/**
 * The status of one note. `fromPlugin` is the convention another plugin's
 * resolver asks for, or null when none answered.
 */
export function noteStatus(note: NoteFacts, settings: SmartTypographySettings, fromPlugin: QuoteStyleId | null = null): NoteStatus {
  const off: OffReason | null =
    settings.excludedFolders && inFolder(note.path, folderList(settings.excludedFolders))
      ? 'folder'
      : isOff(note.typography)
        ? 'property'
        : null;
  return { off, ...quoteSource(note, settings, fromPlugin) };
}

function quoteSource(
  note: NoteFacts,
  settings: SmartTypographySettings,
  fromPlugin: QuoteStyleId | null,
): { quoteStyle: QuoteStyleId; source: QuoteSource } {
  const own = parseConvention(note.quotes);
  if (own !== null) return { quoteStyle: own, source: 'property' };
  if (fromPlugin !== null) return { quoteStyle: fromPlugin, source: 'plugin' };
  if (settings.useLangProperty) {
    const lang = languageConvention(note.lang);
    if (lang !== null) return { quoteStyle: lang, source: 'lang' };
  }
  if (settings.quotesByFolder) {
    const folder = folderQuoteStyle(note.path, settings.quotesByFolder);
    if (folder !== null) return { quoteStyle: folder, source: 'folder' };
  }
  return { quoteStyle: settings.quoteStyle, source: 'default' };
}

/** The double quotation marks of a convention, `" "` for straight quotes. */
export function marksOf(style: QuoteStyleId): string {
  const convention = conventionFor(style);
  return convention ? `${convention.doubleOpen} ${convention.doubleClose}` : '" "';
}

/** A convention's name for the tooltip: its label, or its four marks when another plugin made it up. */
function styleName(style: QuoteStyleId): string {
  const convention = conventionFor(style);
  if (!convention) return t('modal.quotes.straight');
  if (style.startsWith('ext:')) {
    return [convention.doubleOpen, convention.doubleClose, convention.singleOpen, convention.singleClose].join(' ');
  }
  return convention.label;
}

/** The status bar's short text: the note's quotation marks, with "off" when nothing is substituted. */
export function statusText(status: NoteStatus): string {
  const marks = marksOf(status.quoteStyle);
  return status.off ? t('statusBar.off', { marks }) : marks;
}

/** The status bar's tooltip, one sentence per line. */
export function statusTooltip(status: NoteStatus): string {
  const state =
    status.off === 'folder'
      ? t('statusBar.offFolder')
      : status.off === 'property'
        ? t('statusBar.offProperty')
        : t('statusBar.on');
  const style = styleName(status.quoteStyle);
  const quotes = {
    property: () => t('statusBar.quotes.property', { style }),
    plugin: () => t('statusBar.quotes.plugin', { style }),
    lang: () => t('statusBar.quotes.lang', { style }),
    folder: () => t('statusBar.quotes.folder', { style }),
    default: () => t('statusBar.quotes.default', { style }),
  }[status.source]();
  return [state, quotes, t('statusBar.click')].join('\n');
}
