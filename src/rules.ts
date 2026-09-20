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
   * the dash rules away from `---`, which is a horizontal rule, a setext
   * underline and the frontmatter fence.
   */
  guard?: (lineBefore: string) => boolean;
}

/** True unless the line so far is nothing but hyphens. */
const notAHorizontalRule = (lineBefore: string): boolean => !/^\s*-*$/.test(lineBefore);

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
    guard: notAHorizontalRule,
  },
  {
    before: '-',
    typed: '-',
    insert: '–',
    literal: '--',
    group: 'dashes',
    guard: notAHorizontalRule,
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
