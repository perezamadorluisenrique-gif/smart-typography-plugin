/**
 * Quotes that arrived through a composition.
 *
 * Text an input method composes never reaches the plugin one keystroke at a
 * time: Android keyboards such as Gboard compose each word as you type it,
 * apostrophe included, and a dead key composes the quote it produces. The
 * keystroke handler has to stay out of the way while that happens, because
 * the keyboard rewrites its own composition and would undo or garble a
 * change made underneath it (mgmeyers/obsidian-smart-typography#63).
 *
 * So once the composition is over, the text it produced is looked at as a
 * whole, and each straight quote in it gets the character it would have got
 * if it had been typed. Only quotes: each is replaced where it stands and
 * nothing around it is rewritten, so the word the keyboard remembers stays
 * the word in the note.
 */

import { substitutionFor } from './substitute.ts';
import type { SmartTypographySettings } from './settings.ts';

export interface QuoteChange {
  from: number;
  to: number;
  insert: string;
}

/** Enough of what follows a quote for the rules that look ahead. */
const LOOKAHEAD = 4;

/**
 * The changes that curl the straight quotes in `doc` between `from` and
 * `to`, in document order and in the coordinates of `doc` as given.
 *
 * Each quote is judged as if it had just been typed, with the quotes before
 * it already curled, so `"it's"` comes out the same as typing it would.
 */
export function curlComposedQuotes(
  doc: string,
  from: number,
  to: number,
  settings: SmartTypographySettings,
): QuoteChange[] {
  const changes: QuoteChange[] = [];
  let before = doc.slice(0, from);

  for (let pos = from; pos < to; pos++) {
    const typed = doc[pos];
    if (typed === '"' || typed === "'") {
      const after = doc.slice(pos + 1, pos + 1 + LOOKAHEAD);
      const action = substitutionFor(before, after, typed, settings);
      // A quote is only ever turned into another quote here. Stepping over a
      // closing quote, or a rule that would also rewrite what comes before,
      // makes no sense for text that is already in the note.
      if (action?.kind === 'replace' && action.from === before.length && action.to === before.length) {
        changes.push({ from: pos, to: pos + 1, insert: action.insert });
        before += action.insert;
        continue;
      }
    }
    before += typed;
  }

  return changes;
}
