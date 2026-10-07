/**
 * Type-to-wrap: with text selected, typing a quote wraps the selection in
 * the convention's curly quotes instead of replacing it.
 */

import { conventionFor } from './settings.ts';
import type { SmartTypographySettings } from './settings.ts';

export interface Wrap {
  open: string;
  close: string;
}

/** Curly and angle quotes typed directly, and what closes them. */
const CLOSER_OF: Record<string, string> = {
  '“': '”',
  '‘': '’',
  '„': '“',
  '‚': '‘',
  '«': '»',
  '‹': '›',
};

/**
 * What to put around a selection when `typed` is typed over it, or null to
 * leave the keystroke alone. Straight quotes follow the quote convention
 * (and do nothing when it is off); a quote typed already curly closes with
 * its own partner; a typed `«` takes the convention's padding when it is a
 * guillemet convention, so French wraps as « text ».
 */
export function wrapFor(typed: string, settings: SmartTypographySettings): Wrap | null {
  if (!settings.wrapSelection) return null;
  const convention = conventionFor(settings.quoteStyle);

  if (typed === '"' || typed === "'") {
    if (!convention) return null;
    const pad = convention.padding;
    return typed === '"'
      ? { open: convention.doubleOpen + pad, close: pad + convention.doubleClose }
      : { open: convention.singleOpen + pad, close: pad + convention.singleClose };
  }

  const close = CLOSER_OF[typed];
  if (close === undefined) return null;
  const pad = convention && convention.doubleOpen === '«' && typed === '«' ? convention.padding : '';
  return { open: typed + pad, close: pad + close };
}
