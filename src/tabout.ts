/**
 * Tab to jump out of a pair: with the cursor just before a closing quote or
 * bracket, Tab moves past it instead of inserting a tab.
 *
 * `tabOutTarget` is deliberately timid. Tab means "indent" in lists, "next
 * cell" in tables and "accept" in link suggestions, so it only acts in
 * plain prose, on a line that is none of those.
 */

import { protectedRegionAt } from './context.ts';
import { APOSTROPHE, conventionFor } from './settings.ts';
import type { SmartTypographySettings } from './settings.ts';

const BRACKET_CLOSERS = [')', ']', '}', '»'];

/** Occurrences of `ch` in `text` that are not apostrophes between letters. */
function quoteCount(text: string, ch: string): number {
  let n = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== ch) continue;
    const between = i > 0 && i < text.length - 1 && /\p{L}/u.test(text[i - 1]) && /\p{L}/u.test(text[i + 1]);
    if (ch === "'" && between) continue;
    n++;
  }
  return n;
}

function count(text: string, ch: string): number {
  let n = 0;
  for (const c of text) if (c === ch) n++;
  return n;
}

/**
 * How many characters Tab should step over, or 0 to leave Tab alone.
 * `lineBefore` and `after` are the cursor's line up to the cursor and the
 * rest of that line.
 */
export function closerLength(lineBefore: string, after: string, settings: SmartTypographySettings): number {
  if (after === '') return 0;
  const convention = conventionFor(settings.quoteStyle);

  // Guillemet padding: `« text| »` steps over the space and the guillemet.
  if (convention && convention.padding !== '') {
    const padded = convention.padding;
    for (const close of [convention.doubleClose, convention.singleClose]) {
      if (after.startsWith(padded + close)) return padded.length + close.length;
    }
  }

  const ch = after[0];
  if (BRACKET_CLOSERS.includes(ch)) return 1;

  if (ch === '"' || ch === "'") {
    // A straight quote is a closer only when one is open before the cursor.
    return quoteCount(lineBefore, ch) % 2 === 1 ? 1 : 0;
  }

  if (convention) {
    if (ch === convention.doubleClose && ch !== convention.doubleOpen) return 1;
    if (ch === convention.singleClose && ch !== convention.singleOpen) {
      // `’` is also the apostrophe: only a closer when a single quote is open.
      if (ch === APOSTROPHE) {
        return count(lineBefore, convention.singleOpen) > count(lineBefore, ch) ? 1 : 0;
      }
      return 1;
    }
    // Swedish and similar: the same character opens and closes.
    if (ch === convention.doubleClose) return count(lineBefore, ch) % 2 === 1 ? 1 : 0;
  }
  return 0;
}

/**
 * The offset Tab should move the cursor to, or null to let Tab do its usual
 * job. `docBefore` is the document up to the cursor.
 */
export function tabOutTarget(
  docBefore: string,
  after: string,
  settings: SmartTypographySettings,
): number | null {
  if (!settings.tabOut) return null;
  const lineStart = docBefore.lastIndexOf('\n') + 1;
  const lineBefore = docBefore.slice(lineStart);
  const lineAfter = after.split('\n', 1)[0];

  const n = closerLength(lineBefore, lineAfter, settings);
  if (n === 0) return null;

  // Tables: Tab moves between cells. Lists: Tab indents, and a cursor with
  // only the marker before it is exactly that.
  if (lineBefore.includes('|') || lineAfter.includes('|')) return null;
  if (/^[ \t]*(?:[-*+]|\d{1,9}[.)])[ \t]+(?:\[.\][ \t]+)?$/.test(lineBefore)) return null;
  if (lineBefore.trim() === '') return null;

  // Code, math, front matter, links and the rest keep their Tab.
  if (protectedRegionAt(docBefore) !== null) return null;

  return docBefore.length + n;
}
