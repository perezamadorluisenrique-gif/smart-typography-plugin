/**
 * Replacement rules the user writes: `(c) -> ©`, `:check: -> ✓`.
 *
 * They are stored as text, one rule per line, the same way as the excluded
 * folders, and compiled here into the same shape as the built-in rules in
 * `rules.ts`: the text that has to sit before the cursor, the character
 * being typed, what replaces them and the literal keystrokes Backspace puts
 * back. That is what lets them run through `substitutionFor`, so code,
 * math, links, front matter and the rest of `context.ts` are protected
 * from them exactly as from the built-ins.
 *
 * Built-in rules are tried first. A custom rule whose sequence is also a
 * built-in one only fires while that built-in group is switched off, and a
 * custom sequence a built-in rule rewrites halfway through (`-->>`, whose
 * `--` becomes an en dash) never appears as typed, so it never fires.
 */

/** Splits a line into sequence and replacement. */
export const SEPARATOR = ' -> ';

export interface CustomRule {
  /** Text that has to sit immediately before the cursor. */
  before: string;
  /** The character being typed, the last one of the sequence. */
  typed: string;
  /** What replaces `before` plus the typed character. */
  insert: string;
  /** The whole sequence as typed, restored by Backspace. */
  literal: string;
  /** The 1-based line of the setting the rule came from. */
  line: number;
}

export interface IgnoredRule {
  /** The 1-based line of the setting. */
  line: number;
  /** The line as written. */
  text: string;
  /** Why it is ignored, as a sentence fragment for the settings tab. */
  reason: string;
}

export interface CompiledRules {
  rules: CustomRule[];
  ignored: IgnoredRule[];
}

/**
 * Why a sequence and replacement cannot be a rule, or null when they can.
 * Sequences shorter than two characters are refused because a single
 * character would fire on every keystroke of it, with no way to type it
 * other than Backspace each time.
 */
export function problemWith(sequence: string, replacement: string): string | null {
  if (sequence.includes('\n') || sequence.includes('\r')) return 'the sequence contains a line break';
  if (sequence.length === 0) return 'the sequence is empty';
  if (sequence.trim().length === 0) return 'the sequence is only spaces';
  if ([...sequence].length < 2) return 'the sequence needs at least two characters';
  // The editor hands over a character outside the Basic Multilingual Plane,
  // an emoji for instance, as two halves, so a rule could never see it typed.
  if (/[\uDC00-\uDFFF]$/.test(sequence)) return 'the sequence ends with an emoji or similar character';
  if (replacement.includes('\n') || replacement.includes('\r')) return 'the replacement contains a line break';
  if (replacement.length === 0) return 'the replacement is empty';
  if (replacement === sequence) return 'the replacement is the same as the sequence';
  return null;
}

/**
 * The rules in the setting, and the lines that are not rules, each with the
 * reason. Blank lines are neither.
 *
 * A sequence that starts with another rule's whole sequence chains off it,
 * the way the built-in `---` chains off `--`: with `<< -> «` and
 * `<<< -> ⋘`, the first two `<` already became `«`, so the longer rule
 * waits for `«<` and Backspace afterwards gives back all three `<`.
 */
export function compileCustomRules(setting: string): CompiledRules {
  const ignored: IgnoredRule[] = [];
  const parsed: { sequence: string; replacement: string; line: number }[] = [];
  const seen = new Map<string, number>();

  setting.split('\n').forEach((raw, index) => {
    const line = index + 1;
    const text = raw.replace(/\r$/, '');
    if (text.trim().length === 0) return;
    const at = text.indexOf(SEPARATOR);
    if (at === -1) {
      ignored.push({ line, text, reason: `no "${SEPARATOR.trim()}" between the sequence and the replacement` });
      return;
    }
    // Spaces around the arrow are layout, not part of the rule.
    const sequence = text.slice(0, at).trim() || text.slice(0, at);
    const replacement = text.slice(at + SEPARATOR.length).trim();
    const problem = problemWith(sequence, replacement);
    if (problem !== null) {
      ignored.push({ line, text, reason: problem });
      return;
    }
    const earlier = seen.get(sequence);
    if (earlier !== undefined) {
      ignored.push({ line, text, reason: `the same sequence is already on line ${earlier}` });
      return;
    }
    seen.set(sequence, line);
    parsed.push({ sequence, replacement, line });
  });

  // Shortest first, so the rules a longer sequence chains off are compiled
  // before it. The final order goes back to the setting's.
  const rules: CustomRule[] = [];
  const byLength = [...parsed].sort((a, b) => [...a.sequence].length - [...b.sequence].length);
  for (const { sequence, replacement, line } of byLength) {
    const typed = sequence.slice(-1);
    const before = replay(sequence.slice(0, -1), rules);
    const clash = rules.find((r) => r.before === before && r.typed === typed);
    if (clash) {
      ignored.push({
        line,
        text: `${sequence}${SEPARATOR}${replacement}`,
        reason: `the rule on line ${clash.line} already fires on the same keystrokes`,
      });
      continue;
    }
    rules.push({ before, typed, insert: replacement, literal: sequence, line });
  }
  rules.sort((a, b) => a.line - b.line);
  ignored.sort((a, b) => a.line - b.line);
  return { rules, ignored };
}

/** What `keys` leave in the document once `rules` have fired on them. */
function replay(keys: string, rules: CustomRule[]): string {
  let out = '';
  for (const typed of keys) {
    const rule = longestMatch(out, typed, rules, () => true);
    out = rule ? out.slice(0, out.length - rule.before.length) + rule.insert : out + typed;
  }
  return out;
}

/**
 * The custom rule that fires on `typed`, or null. When several fit, the one
 * with the most text before the cursor wins, so `ba>` beats `a>` after a
 * `b`; between equal lengths, the one higher in the list.
 */
export function matchCustomRule(
  before: string,
  lineBefore: string,
  typed: string,
  rules: CustomRule[],
): CustomRule | null {
  return longestMatch(before, typed, rules, (rule) => notBlockquoteMarker(rule, lineBefore, typed));
}

function longestMatch(
  before: string,
  typed: string,
  rules: CustomRule[],
  allowed: (rule: CustomRule) => boolean,
): CustomRule | null {
  let best: CustomRule | null = null;
  for (const rule of rules) {
    if (rule.typed !== typed) continue;
    if (!before.endsWith(rule.before)) continue;
    if (best !== null && rule.before.length <= best.before.length) continue;
    if (!allowed(rule)) continue;
    best = rule;
  }
  return best;
}

/**
 * False while the `>` being typed is blockquote syntax: a line that is only
 * spaces and `>` so far, as in `>>` or `> >` opening a nested quote. Any
 * rule whose keystrokes reach that point keeps out, `>> -> »` among them.
 */
function notBlockquoteMarker(rule: CustomRule, lineBefore: string, typed: string): boolean {
  if (typed !== '>') return true;
  return !/^[\s>]*$/.test(lineBefore);
}

/** Every character a custom rule reacts to. */
export function customTriggers(rules: CustomRule[]): Set<string> {
  return new Set(rules.map((rule) => rule.typed));
}

/** One compiled setting is kept, as the setting changes rarely and keystrokes often. */
let cache: { setting: string; compiled: CompiledRules } | null = null;

/** `compileCustomRules`, compiled once per distinct setting text. */
export function customRulesFor(setting: string): CompiledRules {
  if (cache === null || cache.setting !== setting) {
    cache = { setting, compiled: compileCustomRules(setting) };
  }
  return cache.compiled;
}

export interface Preset {
  id: string;
  /** Button text. */
  label: string;
  rules: [string, string][];
}

/**
 * Rule sets the settings tab can add in one click. None is on by default.
 * `+-` is not among the symbols because the mathematical symbols group
 * already turns it into ±.
 */
export const PRESETS: Preset[] = [
  {
    id: 'guillemets',
    label: 'Guillemets << >>',
    rules: [
      ['<<', '«'],
      ['>>', '»'],
    ],
  },
  {
    id: 'symbols',
    label: 'Symbols (c) (r) (tm)',
    rules: [
      ['(c)', '©'],
      ['(r)', '®'],
      ['(tm)', '™'],
    ],
  },
];

/**
 * The setting with a preset's rules added at the end, skipping any whose
 * sequence is already in it, and how many were added.
 */
export function addPreset(setting: string, preset: Preset): { setting: string; added: number } {
  const present = new Set<string>();
  for (const raw of setting.split('\n')) {
    const at = raw.indexOf(SEPARATOR);
    if (at !== -1) present.add(raw.slice(0, at).trim());
  }
  const lines = preset.rules
    .filter(([sequence]) => !present.has(sequence))
    .map(([sequence, replacement]) => `${sequence}${SEPARATOR}${replacement}`);
  if (lines.length === 0) return { setting, added: 0 };
  const base = setting.replace(/\s+$/, '');
  return { setting: (base ? base + '\n' : '') + lines.join('\n'), added: lines.length };
}
