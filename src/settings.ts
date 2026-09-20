/**
 * Settings shape and quote conventions.
 *
 * Nothing under `src/` imports `obsidian` or CodeMirror, so the whole
 * substitution engine runs under plain Node and is unit tested. `main.ts`
 * is the only file that talks to the editor.
 */

export type QuoteStyleId =
  | 'off'
  | 'english'
  | 'german'
  | 'french'
  | 'spanish'
  | 'swedish'
  | 'polish'
  | 'russian';

/**
 * The apostrophe is the same character in every convention below: U+2019,
 * never the convention's closing single quote. German is the case that
 * makes the difference visible. Its closing single quote is U+2018, but
 * `geht's` still takes U+2019, and the original plugin got that wrong
 * (mgmeyers/obsidian-smart-typography#70).
 */
export const APOSTROPHE = '’';

export interface QuoteConvention {
  id: QuoteStyleId;
  /** Shown in the settings dropdown. */
  label: string;
  doubleOpen: string;
  doubleClose: string;
  singleOpen: string;
  singleClose: string;
  /**
   * Sits between a guillemet and the text it wraps. French typography asks
   * for a no-break space there; every other convention leaves it empty.
   */
  padding: string;
}

export const QUOTE_CONVENTIONS: QuoteConvention[] = [
  {
    id: 'english',
    label: 'English “ ” ‘ ’',
    doubleOpen: '“',
    doubleClose: '”',
    singleOpen: '‘',
    singleClose: '’',
    padding: '',
  },
  {
    id: 'german',
    label: 'German „ “ ‚ ‘',
    doubleOpen: '„',
    doubleClose: '“',
    singleOpen: '‚',
    singleClose: '‘',
    padding: '',
  },
  {
    id: 'french',
    label: 'French « » ‹ ›',
    doubleOpen: '«',
    doubleClose: '»',
    singleOpen: '‹',
    singleClose: '›',
    // U+00A0, not the narrow U+202F: plenty of fonts still have no glyph
    // for the narrow one, and a missing glyph in body text is worse than a
    // slightly wide space.
    padding: ' ',
  },
  {
    id: 'spanish',
    label: 'Spanish « » “ ”',
    doubleOpen: '«',
    doubleClose: '»',
    singleOpen: '“',
    singleClose: '”',
    padding: '',
  },
  {
    id: 'swedish',
    label: 'Swedish ” ” ’ ’',
    doubleOpen: '”',
    doubleClose: '”',
    singleOpen: '’',
    singleClose: '’',
    padding: '',
  },
  {
    id: 'polish',
    label: 'Polish „ ” ‚ ’',
    doubleOpen: '„',
    doubleClose: '”',
    singleOpen: '‚',
    singleClose: '’',
    padding: '',
  },
  {
    id: 'russian',
    label: 'Russian « » „ “',
    doubleOpen: '«',
    doubleClose: '»',
    singleOpen: '„',
    singleClose: '“',
    padding: '',
  },
];

export interface SmartTypographySettings {
  /** `off` leaves both quote characters alone. */
  quoteStyle: QuoteStyleId;
  /** `it's` -> `it’s`. Independent of `quoteStyle`. */
  smartApostrophes: boolean;
  /** `--` -> en dash, `---` -> em dash. */
  dashes: boolean;
  /** `...` -> `…`. */
  ellipsis: boolean;
  /** `->` `<-` `<->` `=>` and friends. */
  arrows: boolean;
  /** `>=` `!=` `+-` and friends. */
  mathSymbols: boolean;
  /** Typing a closing quote over one that is already there moves past it. */
  skipClosingQuote: boolean;
}

export const DEFAULT_SETTINGS: SmartTypographySettings = {
  quoteStyle: 'english',
  smartApostrophes: true,
  dashes: true,
  ellipsis: true,
  arrows: true,
  mathSymbols: true,
  skipClosingQuote: true,
};

/** The convention in use, or null when quote substitution is switched off. */
export function conventionFor(id: QuoteStyleId): QuoteConvention | null {
  return QUOTE_CONVENTIONS.find((c) => c.id === id) ?? null;
}

/** Every quote character any convention can produce. */
export function allQuoteCharacters(): string[] {
  const chars = new Set<string>([APOSTROPHE]);
  for (const c of QUOTE_CONVENTIONS) {
    chars.add(c.doubleOpen);
    chars.add(c.doubleClose);
    chars.add(c.singleOpen);
    chars.add(c.singleClose);
  }
  return [...chars];
}
