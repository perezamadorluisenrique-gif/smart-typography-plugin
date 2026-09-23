/**
 * The substitutions that depend only on the characters just typed.
 *
 * Quotes are not here: they need to know whether they open or close, so
 * they live in `substitute.ts`. Everything in this table is a plain
 * "these characters became that character" rule.
 *
 * `literal` is what the keystrokes would have produced without the
 * plugin. Backspace restores it, so the rules chain safely: typing `-`
 * three times passes through the en dash and lands on an em dash whose
 * literal is `---`, and one Backspace gives back all three hyphens.
 */

export type RuleGroup = 'dashes' | 'ellipsis' | 'arrows' | 'math';

export interface Rule {
  /** Text that has to sit immediately before the cursor. */
  before: string;
  /** The character being typed. */
  typed: string;
  /** What replaces `before` plus the typed character. */
  insert: string;
  /** The keystrokes the user actually pressed. */
  literal: string;
  group: RuleGroup;
  /**
   * An extra condition on the current line up to the cursor. Used to keep
   * the dash rules away from hyphens that are Markdown syntax rather than
   * punctuation.
   */
  guard?: (lineBefore: string) => boolean;
}

/**
 * False while the hyphens being typed are syntax:
 *
 * - `---` on a line of its own, which is a horizontal rule, a setext
 *   underline and the frontmatter fence, in a quote or callout as well;
 * - a table's delimiter row, `| --- | :-: |`, which stops being one the
 *   moment a hyphen in it becomes a dash, so the table no longer renders;
 * - the `<!--` that opens an HTML comment.
 */
const hyphensAreProse = (lineBefore: string): boolean => {
  const body = lineBefore.replace(/^\s*(?:>\s*)*/, '');
  if (/^-*$/.test(body)) return false;
  if (body.includes('|') && /^[\s|:-]*$/.test(body)) return false;
  return !lineBefore.endsWith('<!-');
};

/**
 * Longest `before` first inside each group, and `math` ahead of `arrows`
 * so that `<=` becomes U+2264 rather than U+21D0 when both are enabled.
 * `<==` still reaches U+21D0, by chaining off the U+2264 the first two
 * keystrokes produced.
 */
export const RULES: Rule[] = [
  // ...
  { before: '..', typed: '.', insert: '…', literal: '...', group: 'ellipsis' },

  // -- and ---
  {
    before: '–',
    typed: '-',
    insert: '—',
    literal: '---',
    group: 'dashes',
    guard: hyphensAreProse,
  },
  {
    before: '-',
    typed: '-',
    insert: '–',
    literal: '--',
    group: 'dashes',
    guard: hyphensAreProse,
  },

  // >= != /= +- +/-
  { before: '+/', typed: '-', insert: '±', literal: '+/-', group: 'math' },
  { before: '>', typed: '=', insert: '≥', literal: '>=', group: 'math' },
  { before: '<', typed: '=', insert: '≤', literal: '<=', group: 'math' },
  { before: '!', typed: '=', insert: '≠', literal: '!=', group: 'math' },
  { before: '/', typed: '=', insert: '≠', literal: '/=', group: 'math' },
  { before: '+', typed: '-', insert: '±', literal: '+-', group: 'math' },

  // Arrows. The three that chain off a character this table produced come
  // first, because their `before` is one of those characters.
  { before: '←', typed: '>', insert: '↔', literal: '<->', group: 'arrows' },
  { before: '≤', typed: '>', insert: '⇔', literal: '<=>', group: 'arrows' },
  { before: '⇐', typed: '>', insert: '⇔', literal: '<=>', group: 'arrows' },
  { before: '≤', typed: '=', insert: '⇐', literal: '<==', group: 'arrows' },
  { before: '←', typed: '-', insert: '←', literal: '<--', group: 'arrows' },
  // `--` has already become an en dash by the time the `>` arrives, so
  // `-->` reaches this rule and not the one below it.
  { before: '–', typed: '>', insert: '→', literal: '-->', group: 'arrows' },
  { before: '—', typed: '>', insert: '→', literal: '--->', group: 'arrows' },
  { before: '-', typed: '>', insert: '→', literal: '->', group: 'arrows' },
  { before: '=', typed: '>', insert: '⇒', literal: '=>', group: 'arrows' },
  { before: '<', typed: '-', insert: '←', literal: '<-', group: 'arrows' },
  // Only reached when the maths group is off; otherwise `<=` is U+2264.
  { before: '<', typed: '=', insert: '⇐', literal: '<=', group: 'arrows' },
];

/**
 * The first rule that fits, or null.
 *
 * `before` is the document up to the cursor, `lineBefore` the part of it
 * on the current line, and `enabled` says which groups are switched on.
 */
export function matchRule(
  before: string,
  lineBefore: string,
  typed: string,
  enabled: (group: RuleGroup) => boolean,
): Rule | null {
  for (const rule of RULES) {
    if (rule.typed !== typed) continue;
    if (!enabled(rule.group)) continue;
    if (!before.endsWith(rule.before)) continue;
    if (rule.guard && !rule.guard(lineBefore)) continue;
    return rule;
  }
  return null;
}
