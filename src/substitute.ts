/**
 * The substitution engine: one keystroke in, one editor change out.
 *
 * The caller passes the document up to the cursor and a few characters
 * after it, so nothing here needs an editor, and every rule below is
 * covered by `tests/substitute.test.ts`.
 */

import { protectedRegionAt } from './context.ts';
import { matchRule } from './rules.ts';
import type { RuleGroup } from './rules.ts';
import { APOSTROPHE, conventionFor } from './settings.ts';
import type { QuoteConvention, SmartTypographySettings } from './settings.ts';

export type Action =
  /** Replace `[from, to)` with `insert`, where `to` is the cursor. */
  | {
      kind: 'replace';
      from: number;
      to: number;
      insert: string;
      /** What the keystrokes would have produced without the plugin. */
      literal: string;
      rule: string;
    }
  /** Type nothing and move the cursor to `to`, past a quote already there. */
  | { kind: 'skip'; to: number; rule: string };

/**
 * Characters after which a quote opens rather than closes. Anything else,
 * including a letter, a digit or a full stop, closes.
 *
 * The start of the document counts as an opening position too, which is
 * the first-line guillemet bug in the original
 * (mgmeyers/obsidian-smart-typography#65).
 */
const OPENS_AFTER = /[\s ([{<*_~\-–—…"'“„«‹‘‚]/;

/** A letter or a digit, in any script. */
const WORD_CHARACTER = /[\p{L}\p{N}]/u;

/**
 * The change a keystroke should make, or null to let the keystroke through
 * untouched.
 *
 * `before` is the document from its start up to the cursor and `after` the
 * text just after it; four characters of `after` are enough for every rule
 * here.
 */
export function substitutionFor(
  before: string,
  after: string,
  typed: string,
  settings: SmartTypographySettings,
): Action | null {
  if (typed.length !== 1) return null;
  if (protectedRegionAt(before) !== null) return null;

  const pos = before.length;
  const convention = conventionFor(settings.quoteStyle);

  if (typed === '"' || typed === "'") {
    return quoteAction(before, after, typed, settings, convention);
  }

  if (settings.smartApostrophes && convention && /[0-9]/.test(typed)) {
    const decade = decadeAction(before, typed, convention);
    if (decade) return decade;
  }

  const lineBefore = before.slice(before.lastIndexOf('\n') + 1);
  const rule = matchRule(before, lineBefore, typed, (group) => groupEnabled(group, settings));
  if (!rule) return null;

  return {
    kind: 'replace',
    from: pos - rule.before.length,
    to: pos,
    insert: rule.insert,
    literal: rule.literal,
    rule: rule.group,
  };
}

function groupEnabled(group: RuleGroup, settings: SmartTypographySettings): boolean {
  switch (group) {
    case 'dashes':
      return settings.dashes;
    case 'ellipsis':
      return settings.ellipsis;
    case 'arrows':
      return settings.arrows;
    case 'math':
      return settings.mathSymbols;
  }
}

function quoteAction(
  before: string,
  after: string,
  typed: string,
  settings: SmartTypographySettings,
  convention: QuoteConvention | null,
): Action | null {
  const pos = before.length;
  const prev = pos > 0 ? before[pos - 1] : null;

  // An apostrophe inside or at the end of a word is never a quote, whatever
  // the convention says, and it is U+2019 in all of them. This runs before
  // the convention check so that apostrophes still work with quote
  // substitution switched off.
  //
  // The exception is a convention whose closing single quote is some other
  // character, German and Spanish among them. There a `'` after a letter
  // is ambiguous, and with a single quotation already open on the line it
  // is far likelier to be closing it than to be an apostrophe.
  const closingAQuotation =
    convention !== null &&
    convention.singleClose !== APOSTROPHE &&
    singleQuoteIsOpen(before, convention);

  if (
    typed === "'" &&
    settings.smartApostrophes &&
    prev !== null &&
    WORD_CHARACTER.test(prev) &&
    !closingAQuotation
  ) {
    return {
      kind: 'replace',
      from: pos,
      to: pos,
      insert: APOSTROPHE,
      literal: "'",
      rule: 'apostrophe',
    };
  }

  if (!convention) return null;

  const open = typed === '"' ? convention.doubleOpen : convention.singleOpen;
  const close = typed === '"' ? convention.doubleClose : convention.singleClose;
  const pad = convention.padding;

  if (prev === null || OPENS_AFTER.test(prev)) {
    return {
      kind: 'replace',
      from: pos,
      to: pos,
      insert: open + pad,
      literal: typed,
      rule: 'quote-open',
    };
  }

  // Closing. If the closing quote is already sitting there, step over it
  // instead of adding a second one (#57, and the auto-pair complaints in
  // #56 and #59).
  if (settings.skipClosingQuote) {
    for (const ahead of [pad + close, close]) {
      if (ahead.length > 0 && after.startsWith(ahead)) {
        return { kind: 'skip', to: pos + ahead.length, rule: 'quote-skip' };
      }
    }
  }

  return {
    kind: 'replace',
    from: pos,
    to: pos,
    insert: pad + close,
    literal: typed,
    rule: 'quote-close',
  };
}

/** Whether a single quotation is open on the cursor's line. */
function singleQuoteIsOpen(before: string, convention: QuoteConvention): boolean {
  const line = before.slice(before.lastIndexOf('\n') + 1);
  return count(line, convention.singleOpen) > count(line, convention.singleClose);
}

function count(text: string, character: string): number {
  let total = 0;
  for (const c of text) if (c === character) total++;
  return total;
}

/**
 * `'90s` and `'til`: an apostrophe at the start of a word opens a single
 * quote, because nothing yet says otherwise. When the next keystroke is a
 * digit it does say otherwise, so the quote becomes an apostrophe
 * (mgmeyers/obsidian-smart-typography#43).
 */
function decadeAction(
  before: string,
  typed: string,
  convention: QuoteConvention,
): Action | null {
  const pos = before.length;
  if (before[pos - 1] !== convention.singleOpen) return null;

  const beforeQuote = pos >= 2 ? before[pos - 2] : null;
  if (beforeQuote !== null && !/[\s([{]/.test(beforeQuote)) return null;

  return {
    kind: 'replace',
    from: pos - 1,
    to: pos,
    insert: APOSTROPHE + typed,
    literal: "'" + typed,
    rule: 'decade',
  };
}
