/**
 * Capital letter at the start of a sentence, as you type.
 *
 * The engine calls `capitalizeAction` for a lowercase letter that no other
 * rule claimed. Everything here works on the text of the cursor's line, so
 * the common keystroke (a letter in the middle of a word) is rejected after
 * one short string test; the whole-note protected-region scan in
 * `substitute.ts` only runs for the few keystrokes that really are at the
 * start of a sentence.
 */

/** A letter or a digit, in any script. */
const WORD_CHARACTER = /[\p{L}\p{N}]/u;

/**
 * Whether `typed` is a lowercase letter that has a one-letter capital.
 * `ß` is excluded: its capital is `SS`, which is not what anyone meant.
 */
export function isLowercaseLetter(typed: string): boolean {
  if (typed.length !== 1 || !/^\p{Ll}$/u.test(typed)) return false;
  return typed.toUpperCase().length === 1;
}

/**
 * Abbreviations after which a full stop does not end a sentence. Compared
 * lowercase, without the dot.
 */
const ABBREVIATIONS = new Set([
  'no', 'nos', 'co', 'al', 'ca', 'mr', 'mrs', 'ms', 'mx', 'dr', 'prof', 'sr', 'jr', 'sra', 'srta', 'lic', 'ing', 'dra',
  'vs', 'etc', 'cf', 'viz', 'approx', 'dept', 'inc', 'ltd', 'corp', 'est',
  'fig', 'figs', 'eq', 'eqs', 'vol', 'vols', 'pp', 'ch', 'sec', 'ed', 'eds', 'rev', 'gen', 'col',
  'gov', 'sen', 'rep', 'capt', 'lt', 'sgt', 'cpl', 'maj', 'cmdr', 'hon', 'st', 'mt', 'ft', 'ave', 'blvd',
  'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec',
  'ph.d', 'a.m', 'p.m', 'i.e', 'e.g', 'u.s', 'u.k', 'u.n', 'e.u',
]);

/**
 * Abbreviations that are also ordinary words, so they only count when
 * written with a capital: "No. 5" is an abbreviation, "no. Then" is not.
 */
const CAPITAL_ONLY = new Set(['no', 'nos', 'co', 'ca', 'sec', 'est', 'ch', 'st', 'col', 'gen', 'rep', 'rev', 'ed', 'mar', 'sep', 'may', 'jan', 'dec', 'oct', 'nov', 'feb', 'apr', 'jun', 'jul', 'aug', 'ing', 'inc', 'lt', 'mt', 'ft', 'sen', 'gov', 'hon', 'maj', 'cpl', 'eq', 'fig']);

/** Characters that may close a sentence's last word after its terminator. */
const CLOSERS = `)\\]}"'”’»›*_~=`;

/** Characters that may open the next sentence before its first letter. */
const OPENERS = `("'“‘«‹„‚*_~=`;

const AFTER_TERMINATOR = new RegExp(
  `([.!?‽])[${CLOSERS.replace(/[\]\\]/g, '\\$&')}]*[ \\u00A0]+[${OPENERS.replace(/[\]\\]/g, '\\$&')}]*$`,
);
const ONLY_OPENERS = new RegExp(`^[${OPENERS.replace(/[\]\\]/g, '\\$&')}]*$`);

interface Stripped {
  /** The line with its markdown prefix (quote, list marker, task box, heading) removed. */
  rest: string;
  /** False when the line is indented code or something else that is not prose. */
  prose: boolean;
}

/** Removes `> `, list markers, task boxes and heading markers from the start of a line. */
function stripPrefix(line: string): Stripped {
  let rest = line;
  let sawMarker = false;
  let inList = false;
  for (let guard = 0; guard < 12; guard++) {
    let m: RegExpExecArray | null;
    if ((m = /^[ \t]*>[ \t]?/.exec(rest))) {
      rest = rest.slice(m[0].length);
      sawMarker = true;
      inList = false;
    } else if ((m = /^[ \t]*(?:[-*+]|\d{1,9}[.)])[ \t]+/.exec(rest))) {
      rest = rest.slice(m[0].length);
      sawMarker = true;
      inList = true;
    } else if (inList && (m = /^\[.\][ \t]+/.exec(rest))) {
      rest = rest.slice(m[0].length);
      inList = false;
    } else if ((m = /^[ \t]*#{1,6}[ \t]+/.exec(rest))) {
      rest = rest.slice(m[0].length);
      sawMarker = true;
      break;
    } else break;
  }
  if (!sawMarker) {
    const indent = /^[ \t]*/.exec(rest)?.[0] ?? '';
    // Four spaces or a tab with nothing before them is an indented code
    // block, or a continuation that is not a new sentence.
    if (indent.includes('\t') || indent.length >= 4) return { rest, prose: false };
    rest = rest.slice(indent.length);
  } else {
    rest = rest.replace(/^[ \t]+/, '');
  }
  return { rest, prose: true };
}

/** Whether a full stop after `head` ends a sentence rather than an abbreviation, number or file name. */
function fullStopEndsSentence(head: string): boolean {
  const token = /(\S+)$/.exec(head)?.[1];
  if (token === undefined) return false;
  const word = token.replace(/^[([{"'“‘«‹„‚*_~=<]+/, '');
  if (word === '') return false;
  if (word.endsWith('.')) return false; // `..` or `...`
  if (/^[\d.,]+$/.test(word)) return false; // a number, `3.` or `1.5.`
  if (/^\p{L}$/u.test(word)) return false; // an initial: `J.`
  if (/^(\p{L}\.)+\p{L}$/u.test(word)) return false; // `i.e.`, `U.S.`
  const lower = word.toLowerCase();
  if (ABBREVIATIONS.has(lower) && !(CAPITAL_ONLY.has(lower) && word[0] === word[0].toLowerCase())) {
    return false;
  }
  if (/\d\.\d/.test(word) || /[/\\@]/.test(word) || /\p{L}\p{N}*\.\p{L}/u.test(word)) return false; // a path, address or file name
  return true;
}

/**
 * Whether a letter typed at the end of `lineBefore` starts a sentence:
 * the first word of a line (after any quote, list, task or heading marker)
 * or the first word after `. ` `! ` `? `, with closing quotes or brackets
 * allowed after the punctuation and opening ones before the letter.
 */
export function startsSentence(lineBefore: string): boolean {
  const { rest, prose } = stripPrefix(lineBefore);
  if (!prose) return false;
  if (ONLY_OPENERS.test(rest)) return true;

  const m = AFTER_TERMINATOR.exec(rest);
  if (!m) return false;
  const head = rest.slice(0, m.index);
  if (head.trim() === '') return false;
  if (m[1] === '.') {
    if (!fullStopEndsSentence(head)) return false;
  } else if (/\s$/.test(head)) {
    return false;
  }
  return true;
}

/**
 * The capital that replaces `typed`, or null. `lineBefore` is the cursor's
 * line up to the cursor and `after` the text following it.
 */
export function capitalizeInsert(lineBefore: string, after: string, typed: string): string | null {
  if (!isLowercaseLetter(typed)) return null;
  // Typing in the middle of a word is not the start of anything.
  if (after !== '' && WORD_CHARACTER.test(after[0])) return null;
  if (!startsSentence(lineBefore)) return null;
  return typed.toUpperCase();
}

/**
 * `Https:` typed at the start of a sentence was a capital this feature put
 * there for an address. Typing the first `/` undoes it, so URLs are never
 * capitalised. Returns the offset in `lineBefore` of the capital, or null.
 */
export function urlStart(lineBefore: string): number | null {
  const m = /H(ttps?:)$/.exec(lineBefore);
  if (!m) return null;
  return startsSentence(lineBefore.slice(0, m.index)) ? m.index : null;
}
