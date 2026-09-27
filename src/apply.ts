/**
 * Typography for text that is already there: a pasted paragraph, a note
 * written before the plugin was installed, or one imported from elsewhere.
 *
 * The text is fed through the same engine as typing, one character at a
 * time, so it comes out exactly as it would have if it had been typed
 * with the plugin on. Code, math, links, front matter and the rest of what
 * `context.ts` protects stay as they are, for the same reason they do
 * while typing.
 */

import { substitutionFor } from './substitute.ts';
import type { SmartTypographySettings } from './settings.ts';

/** A change to the original text: replace `[from, to)` with `insert`. */
export interface TextChange {
  from: number;
  to: number;
  insert: string;
}

/**
 * `text` with typography applied. `before` is whatever precedes it in the
 * note, which decides whether its start is inside code, a link or front
 * matter; it is not changed and not returned.
 */
export function typographize(
  text: string,
  settings: SmartTypographySettings,
  before = '',
): string {
  // Stepping over a closing quote is for a cursor with text after it; in a
  // replay the text after is the rest of the original, so every quote
  // would be swallowed.
  const replay = { ...settings, skipClosingQuote: false };
  let out = before;

  for (let i = 0; i < text.length; i++) {
    const typed = text[i];
    const action = substitutionFor(out, '', typed, replay);
    // A rule that reaches back past the start (a `-` just before the
    // selection) would change text outside it, so it is left alone.
    if (action?.kind === 'replace' && action.from >= before.length) {
      out = out.slice(0, action.from) + action.insert;
    } else {
      out += typed;
    }
  }
  return out.slice(before.length);
}

/**
 * The changes that turn `original` into `result`, one per line that
 * differs, trimmed to the part of the line that actually changed.
 *
 * No substitution adds or removes a line break, so the two have the same
 * lines and a line-by-line comparison is exact. Small edits, rather than
 * one replacing the whole note, keep folds and the scroll position where
 * they were.
 */
export function changesBetween(original: string, result: string, offset = 0): TextChange[] {
  if (original === result) return [];
  const a = original.split('\n');
  const b = result.split('\n');
  if (a.length !== b.length) {
    return [{ from: offset, to: offset + original.length, insert: result }];
  }

  const changes: TextChange[] = [];
  let pos = offset;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (x !== y) {
      let start = 0;
      while (start < x.length && start < y.length && x[start] === y[start]) start++;
      let endX = x.length;
      let endY = y.length;
      while (endX > start && endY > start && x[endX - 1] === y[endY - 1]) {
        endX--;
        endY--;
      }
      changes.push({ from: pos + start, to: pos + endX, insert: y.slice(start, endY) });
    }
    pos += x.length + 1;
  }
  return changes;
}
