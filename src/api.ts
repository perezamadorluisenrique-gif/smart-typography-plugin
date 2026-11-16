/**
 * Extension API: lets another plugin choose the quotation marks and the dash characters this plugin types
 * for a note, without this plugin knowing anything about that plugin.
 *
 * This file is only types and a registry. With nothing registered, every note gets exactly what its
 * settings say, as before. The API is reached as `app.plugins.getPlugin('typography-as-you-type').api`, and
 * the workspace event `typography-as-you-type:api-ready` fires (with the API as its argument) once the
 * plugin has loaded, for plugins that load first.
 *
 * Resolvers run on every keystroke that a rule reacts to, so they must be quick and must not throw (one
 * that does is skipped). A note's own `typography-quotes` property still wins over a resolver.
 * Pure: no `obsidian` import.
 */

import { QUOTE_CONVENTIONS } from './settings.ts';
import type { QuoteConvention, QuoteStyleId, SmartTypographySettings } from './settings.ts';

export const API_VERSION = 1;

/** The marks a resolver asks for. Each of the four is one or two characters; `padding` is empty or one. */
export interface QuoteMarks {
  doubleOpen: string;
  doubleClose: string;
  singleOpen: string;
  singleClose: string;
  /** Between a guillemet and its text. */
  padding: string;
}

/** What `--` and `---` become. */
export interface DashMarks {
  en: string;
  em: string;
}

/** The note a resolver is asked about. */
export interface NoteRef {
  path: string;
}

/** Undoes a registration. */
export type Disposer = () => void;

/** Marks for a note, or null to leave the note's settings alone. */
export type QuoteResolver = (note: NoteRef) => QuoteMarks | null | undefined;
export type DashResolver = (note: NoteRef) => DashMarks | null | undefined;

export interface TypographyApi {
  readonly version: number;
  registerQuoteResolver(resolver: QuoteResolver): Disposer;
  registerDashResolver(resolver: DashResolver): Disposer;
}

const text = (v: unknown, min: number, max: number): v is string => typeof v === 'string' && v.length >= min && v.length <= max;

const validQuotes = (m: unknown): m is QuoteMarks => {
  const x = m as Partial<QuoteMarks> | null;
  return !!x && text(x.doubleOpen, 1, 2) && text(x.doubleClose, 1, 2) && text(x.singleOpen, 1, 2) && text(x.singleClose, 1, 2) && text(x.padding, 0, 1);
};

const validDashes = (m: unknown): m is DashMarks => {
  const x = m as Partial<DashMarks> | null;
  return !!x && text(x.en, 1, 3) && text(x.em, 1, 3);
};

export class ExtensionRegistry implements TypographyApi {
  readonly version = API_VERSION;
  private readonly quotes: QuoteResolver[] = [];
  private readonly dashes: DashResolver[] = [];

  registerQuoteResolver(resolver: QuoteResolver): Disposer {
    this.quotes.push(resolver);
    return () => {
      const i = this.quotes.indexOf(resolver);
      if (i >= 0) this.quotes.splice(i, 1);
    };
  }

  registerDashResolver(resolver: DashResolver): Disposer {
    this.dashes.push(resolver);
    return () => {
      const i = this.dashes.indexOf(resolver);
      if (i >= 0) this.dashes.splice(i, 1);
    };
  }

  /** The quote convention the newest resolver that has an answer asks for, or null. */
  quoteStyleFor(note: NoteRef): QuoteStyleId | null {
    for (let i = this.quotes.length - 1; i >= 0; i--) {
      let marks: unknown;
      try {
        marks = this.quotes[i](note);
      } catch {
        continue;
      }
      if (validQuotes(marks)) return conventionIdFor(marks);
    }
    return null;
  }

  /** The dash characters the newest resolver that has an answer asks for, or null. */
  dashesFor(note: NoteRef): DashMarks | null {
    for (let i = this.dashes.length - 1; i >= 0; i--) {
      let marks: unknown;
      try {
        marks = this.dashes[i](note);
      } catch {
        continue;
      }
      if (validDashes(marks)) return marks;
    }
    return null;
  }
}

/** Registers (once) a convention for these marks and returns its id. */
function conventionIdFor(m: QuoteMarks): QuoteStyleId {
  const id = `ext:${m.doubleOpen}${m.doubleClose}${m.singleOpen}${m.singleClose}${m.padding}` as QuoteStyleId;
  if (!QUOTE_CONVENTIONS.some((c) => c.id === id)) {
    const conv: QuoteConvention = { id, label: id, doubleOpen: m.doubleOpen, doubleClose: m.doubleClose, singleOpen: m.singleOpen, singleClose: m.singleClose, padding: m.padding };
    QUOTE_CONVENTIONS.push(conv);
  }
  return id;
}

/**
 * The settings for a note with a resolver's quote marks laid over them. A note's own `typography-quotes`
 * property (`ownProperty`, already known to name a convention) wins, so the user can always override.
 */
export function withResolvedQuotes(
  settings: SmartTypographySettings,
  registry: ExtensionRegistry,
  note: NoteRef,
  hasOwnQuotes: boolean,
): SmartTypographySettings {
  if (hasOwnQuotes) return settings;
  const id = registry.quoteStyleFor(note);
  return id === null ? settings : { ...settings, quoteStyle: id };
}

/** What a dash substitution inserts once a resolver has had its say. Anything but `--` and `---` is left as it is. */
export function resolvedDash(literal: string, insert: string, marks: DashMarks | null): string {
  if (!marks) return insert;
  if (literal === '--') return marks.en;
  if (literal === '---') return marks.em;
  return insert;
}
