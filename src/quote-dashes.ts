/**
 * Dashes on a quote or callout line of their own (issue #37), opt-in.
 *
 * A line holding nothing but hyphens is left alone by default, quotes
 * included, because `---` is a horizontal rule and `--` or `---` under a
 * line of text is a setext heading underline. Some people end a quotation
 * with a dash on its own last line, `>--`, and want the dash there. With
 * `dashesInQuotes` on, the second hyphen on a line that is only quote markers
 * and that hyphen becomes an en dash; a third one then chains to an em dash
 * through the ordinary rule, exactly as in prose. Lines outside a quote, and
 * table delimiter rows inside one, keep their guard.
 */

import { RULES } from './rules.ts';
import type { Rule } from './rules.ts';
import type { SmartTypographySettings } from './settings.ts';

/**
 * One or more `>` (with spaces between or around them), then exactly one
 * hyphen: the line so far when the second hyphen of `>--` is typed. Two
 * hyphens already there are a `--` the user kept on purpose (typed with the
 * option off, or put back with Backspace), so a third hyphen leaves it.
 */
const QUOTE_THEN_ONE_HYPHEN = /^[ \t]*>(?:[ \t]*>)*[ \t]*-$/;

/** Whether `lineBefore` is a quote or callout line whose only content is one hyphen. */
export function loneHyphenInQuote(lineBefore: string): boolean {
  return QUOTE_THEN_ONE_HYPHEN.test(lineBefore);
}

const EN_DASH_RULE: Rule = RULES.find((rule) => rule.literal === '--' && rule.group === 'dashes') as Rule;

/**
 * The en dash rule for the second hyphen of `>--` when the option allows it,
 * or null. Only asked after the ordinary rules found nothing, so it never
 * changes what they do.
 */
export function quoteDashRule(lineBefore: string, typed: string, settings: SmartTypographySettings): Rule | null {
  if (typed !== '-' || !settings.dashes || !settings.dashesInQuotes) return null;
  return loneHyphenInQuote(lineBefore) ? EN_DASH_RULE : null;
}
