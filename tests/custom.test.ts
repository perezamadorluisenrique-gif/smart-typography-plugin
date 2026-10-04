import assert from 'node:assert/strict';
import test from 'node:test';

import { typographize } from '../src/apply.ts';
import { PRESETS, addPreset, compileCustomRules, problemWith } from '../src/custom.ts';
import { revertFor } from '../src/revert.ts';
import { RULES } from '../src/rules.ts';
import { DEFAULT_SETTINGS } from '../src/settings.ts';
import type { SmartTypographySettings } from '../src/settings.ts';
import { mightSubstitute, substitutionFor } from '../src/substitute.ts';

const SYMBOLS = ['(c) -> ©', '(r) -> ®', '(tm) -> ™', ':check: -> ✓'].join('\n');
const GUILLEMETS = '<< -> «\n>> -> »';

/** Types `keys` one at a time through the engine, as `substitute.test.ts` does. */
function type(
  keys: string,
  customRules: string,
  options: { start?: string; settings?: Partial<SmartTypographySettings> } = {},
): string {
  const settings = { ...DEFAULT_SETTINGS, ...options.settings, customRules };
  let before = options.start ?? '';
  for (const key of keys) {
    const action = substitutionFor(before, '', key, settings);
    if (action?.kind === 'replace') before = before.slice(0, action.from) + action.insert;
    else before += key;
  }
  return before;
}

// --- Matching ---------------------------------------------------------------

test('a custom rule fires on the last character of its sequence', () => {
  assert.equal(type('Acme (tm) and (c) 2026', SYMBOLS), 'Acme ™ and © 2026');
  assert.equal(type('done :check:', SYMBOLS), 'done ✓');
  assert.equal(type('a << b >> c', GUILLEMETS), 'a « b » c');
});

test('nothing fires before the sequence is complete', () => {
  assert.equal(type('(t', SYMBOLS), '(t');
  assert.equal(type(':check', SYMBOLS), ':check');
  assert.equal(type('(cx)', SYMBOLS), '(cx)');
});

test('the action records the whole sequence as the literal', () => {
  const settings = { ...DEFAULT_SETTINGS, customRules: SYMBOLS };
  const action = substitutionFor('x (tm', '', ')', settings);
  assert.deepEqual(action, { kind: 'replace', from: 2, to: 5, insert: '™', literal: '(tm)', rule: 'custom' });
});

test('custom trigger characters reach the engine only when a rule uses them', () => {
  assert.equal(mightSubstitute(')'), false);
  assert.equal(mightSubstitute(')', { ...DEFAULT_SETTINGS, customRules: SYMBOLS }), true);
  assert.equal(mightSubstitute('x', { ...DEFAULT_SETTINGS, customRules: SYMBOLS }), false);
});

test('a replacement can be longer than its sequence', () => {
  const rules = 'omw -> on my way';
  assert.equal(type('omw', rules), 'on my way');
});

// --- Priority over built-ins -------------------------------------------------

test('built-in rules keep priority over a custom rule with the same sequence', () => {
  const rules = '+- -> ∓\n-> -> ⟶';
  assert.equal(type('a +- b -> c', rules), 'a ± b → c');
  // With the groups off, the custom rules take over.
  assert.equal(
    type('a +- b -> c', rules, { settings: { mathSymbols: false, arrows: false } }),
    'a ∓ b ⟶ c',
  );
});

test('built-in chains are unchanged by custom rules', () => {
  const rules = '-x -> X\n.. -> DOTS';
  assert.equal(type('a --- b', rules), 'a — b');
  assert.equal(type('a -- b', rules), 'a – b');
  assert.equal(type('<->', rules), '↔');
  // `..` would be a custom rule, but `...` still reaches the ellipsis,
  // because the custom rule only fires when no built-in does: the second
  // `.` fires it, and the third finds `DOTS` and no built-in to chain.
  assert.equal(type('wait...', '...x -> Y'), 'wait…');
});

test('a custom sequence that a built-in rewrites halfway never appears, so never fires', () => {
  // `--` becomes an en dash before the `x` arrives.
  assert.equal(type('a --x', '--x -> Z'), 'a –x');
  // Written in terms of what is on screen, it does fire.
  assert.equal(type('a --x', '–x -> Z'), 'a Z');
});

test('quotes keep priority, and a quote-ending rule fires only when quotes are off', () => {
  const rules = `,, -> „`;
  assert.equal(type(',,', rules), '„');
  const quoteRule = `q" -> QUOTE`;
  assert.equal(type('q"', quoteRule), 'q”');
  assert.equal(type('q"', quoteRule, { settings: { quoteStyle: 'off' } }), 'QUOTE');
});

// --- Prefix and suffix overlap ---------------------------------------------

test('when several rules end at the cursor, the longest sequence wins', () => {
  const rules = 'a> -> A\nba> -> B';
  assert.equal(type('xa>', rules), 'xA');
  assert.equal(type('xba>', rules), 'xB');
  // The order in the list does not matter.
  assert.equal(type('xba>', 'ba> -> B\na> -> A'), 'xB');
});

test('a sequence that extends another chains off its replacement', () => {
  const rules = '<< -> «\n<<< -> ⋘';
  assert.equal(type('a <<', rules), 'a «');
  assert.equal(type('a <<<', rules), 'a ⋘');
  const compiled = compileCustomRules(rules).rules;
  assert.deepEqual(
    compiled.map((r) => [r.before, r.typed, r.literal]),
    [
      ['<', '<', '<<'],
      ['«', '<', '<<<'],
    ],
  );
});

test('two sequences that end up waiting for the same keystrokes: the first listed wins', () => {
  const { rules, ignored } = compileCustomRules('<< -> «\n«< -> X\n<<< -> Y');
  assert.equal(rules.length, 2);
  assert.deepEqual(ignored.map((i) => [i.line, i.reason]), [[3, 'the rule on line 2 already fires on the same keystrokes']]);
});

// --- Revert -----------------------------------------------------------------

test('Backspace right after a custom substitution puts the typed sequence back', () => {
  const settings = { ...DEFAULT_SETTINGS, customRules: SYMBOLS };
  const before = 'Acme (tm';
  const action = substitutionFor(before, '', ')', settings);
  assert.ok(action?.kind === 'replace');
  const doc = before.slice(0, action.from) + action.insert;
  const last = { from: action.from, to: action.from + action.insert.length, inserted: action.insert, literal: action.literal };
  assert.deepEqual(revertFor(last, doc, last.to, last.to), { from: 5, to: 6, insert: '(tm)' });
});

test('Backspace after a chained custom rule gives back every keystroke', () => {
  const settings = { ...DEFAULT_SETTINGS, customRules: '<< -> «\n<<< -> ⋘' };
  const action = substitutionFor('a «', '', '<', settings);
  assert.ok(action?.kind === 'replace');
  assert.equal(action.literal, '<<<');
  assert.equal(action.from, 2);
});

// --- Protected contexts -----------------------------------------------------

test('custom rules stay out of everything the built-ins stay out of', () => {
  const cases: [string, string][] = [
    ['front matter', '---\ntitle: x (c'],
    ['code block', '```\nx (c'],
    ['tilde code block', '~~~js\nx (c'],
    ['inline code', 'see `x (c'],
    ['math block', '$$\nx (c'],
    ['inline math', 'see $x (c'],
    ['wikilink', 'see [[Note (c'],
    ['link target', 'see [a](x (c'],
    ['Templater', 'see <% x (c'],
    ['HTML comment', 'see <!-- x (c'],
    ['HTML tag', 'see <span title=x(c'],
    ['URL', 'see https://example.com/(c'],
  ];
  const settings = { ...DEFAULT_SETTINGS, customRules: SYMBOLS };
  for (const [name, before] of cases) {
    assert.equal(substitutionFor(before, '', ')', settings), null, name);
  }
  // And the same text in prose does fire.
  assert.notEqual(substitutionFor('see x (c', '', ')', settings), null);
});

test('a sequence that starts inside code and ends outside it does not fire', () => {
  const settings = { ...DEFAULT_SETTINGS, customRules: 'x`y -> Z' };
  // The cursor is past the closing backtick, in prose, but the `x` the
  // sequence would replace is inside the code span.
  assert.equal(substitutionFor('a `code x`', '', 'y', settings), null);
  // A sequence whose start is prose, with a closed code span before it, fires.
  assert.equal(type('(c)', SYMBOLS, { start: 'a `code` ' }), 'a `code` ©');
});

test('after a code block closes, custom rules fire again', () => {
  assert.equal(type('(c)', SYMBOLS, { start: '```\ncode\n```\n' }), '```\ncode\n```\n©');
});

// --- Blockquote guard -------------------------------------------------------

test('>> at the start of a line is a nested blockquote and stays', () => {
  assert.equal(type('>> quoted', GUILLEMETS), '>> quoted');
  assert.equal(type('  >> quoted', GUILLEMETS), '  >> quoted');
  assert.equal(type('> >> deeper', GUILLEMETS), '> >> deeper');
  assert.equal(type('>> quoted', GUILLEMETS, { start: 'para\n' }), 'para\n>> quoted');
  assert.equal(type('>>> three', GUILLEMETS), '>>> three');
});

test('>> after text on the line is a guillemet, in a quote too', () => {
  assert.equal(type('a >>', GUILLEMETS), 'a »');
  assert.equal(type('> say <<hi>>', GUILLEMETS), '> say «hi»');
  assert.equal(type('<< at start', GUILLEMETS), '« at start');
});

// --- Validation -------------------------------------------------------------

test('invalid lines are ignored and reported with their line and reason', () => {
  const setting = [
    '(c) -> ©',
    '',
    'x -> y',
    '   -> z',
    ' -> z',
    'no arrow here',
    '(c) -> ©©',
    'ab ->  ',
    'ab -> ab',
    '(r)->®',
  ].join('\n');
  const { rules, ignored } = compileCustomRules(setting);
  assert.deepEqual(rules.map((r) => r.literal), ['(c)']);
  assert.deepEqual(
    ignored.map((i) => [i.line, i.reason]),
    [
      [3, 'the sequence needs at least two characters'],
      [4, 'the sequence is only spaces'],
      [5, 'the sequence is empty'],
      [6, 'no "->" between the sequence and the replacement'],
      [7, 'the same sequence is already on line 1'],
      [8, 'the replacement is empty'],
      [9, 'the replacement is the same as the sequence'],
      [10, 'no "->" between the sequence and the replacement'],
    ],
  );
});

test('the validation itself refuses line breaks, whitespace and short sequences', () => {
  assert.equal(problemWith('', 'x'), 'the sequence is empty');
  assert.equal(problemWith('  ', 'x'), 'the sequence is only spaces');
  assert.equal(problemWith('\t \t', 'x'), 'the sequence is only spaces');
  assert.equal(problemWith('a', 'x'), 'the sequence needs at least two characters');
  assert.equal(problemWith('a\nb', 'x'), 'the sequence contains a line break');
  assert.equal(problemWith('ab', 'x\ny'), 'the replacement contains a line break');
  assert.equal(problemWith(':)', '🙂'), null);
  assert.equal(problemWith(':🙂', 'x'), 'the sequence ends with an emoji or similar character');
  assert.equal(problemWith('ab', 'x'), null);
});

test('spaces around the arrow and Windows line endings are layout', () => {
  const { rules, ignored } = compileCustomRules('  (c)   ->   ©  \r\n(r) -> ®\r\n');
  assert.deepEqual(ignored, []);
  assert.deepEqual(rules.map((r) => [r.literal, r.insert]), [['(c)', '©'], ['(r)', '®']]);
});

test('an arrow sequence can itself be a rule', () => {
  assert.deepEqual(compileCustomRules('-> -> ⟶').rules.map((r) => [r.literal, r.insert]), [['->', '⟶']]);
});

// --- Presets ----------------------------------------------------------------

test('the presets do not duplicate a built-in rule', () => {
  const builtIn = new Set(RULES.map((r) => r.literal));
  for (const preset of PRESETS) {
    for (const [sequence] of preset.rules) assert.ok(!builtIn.has(sequence), sequence);
  }
});

test('adding a preset appends its rules and skips those already there', () => {
  const guillemets = PRESETS.find((p) => p.id === 'guillemets');
  assert.ok(guillemets);
  assert.deepEqual(addPreset('', guillemets), { setting: '<< -> «\n>> -> »', added: 2 });
  assert.deepEqual(addPreset('(c) -> ©\n\n', guillemets), { setting: '(c) -> ©\n<< -> «\n>> -> »', added: 2 });
  assert.deepEqual(addPreset('<< -> ‹', guillemets), { setting: '<< -> ‹\n>> -> »', added: 1 });
  assert.deepEqual(addPreset('<< -> «\n>> -> »', guillemets), { setting: '<< -> «\n>> -> »', added: 0 });
  for (const preset of PRESETS) {
    assert.deepEqual(compileCustomRules(addPreset('', preset).setting).ignored, []);
  }
});

test('custom rules are off by default', () => {
  assert.equal(DEFAULT_SETTINGS.customRules, '');
});

// --- Apply command ----------------------------------------------------------

test('Apply typography uses the custom rules, and keeps them out of code', () => {
  const settings = { ...DEFAULT_SETTINGS, customRules: `${SYMBOLS}\n${GUILLEMETS}` };
  const note = ['Acme (tm) -- <<yes>>', '`(c)`', '>> nested', '```', '(r)', '```', 'ok (r)'].join('\n');
  assert.equal(
    typographize(note, settings),
    ['Acme ™ – «yes»', '`(c)`', '>> nested', '```', '(r)', '```', 'ok ®'].join('\n'),
  );
});

test('Apply on a selection does not reach back before it', () => {
  const settings = { ...DEFAULT_SETTINGS, customRules: SYMBOLS };
  // `(t` is before the selection, `m)` inside it.
  assert.equal(typographize('m)', settings, 'x (t'), 'm)');
});

// --- No change without rules -------------------------------------------------

test('rules whose sequences never occur leave every result as it was', () => {
  const corpus = [
    `"It's done," she said -- and left... -> home <-> <= >= != +- +/- => <== <=>`,
    "'90s rock 'n' roll, ---, <!-- x -->, | --- | :-: |",
    '> > quoted -- text\n>> nested "q"\n```\n"code" -- x\n```\n$a -- b$ `x -- y`',
  ];
  const settings = { ...DEFAULT_SETTINGS, customRules: '(zz) -> Z\n:qq: -> Q\n%% -> P' };
  for (const text of corpus) {
    assert.equal(typographize(text, settings), typographize(text, DEFAULT_SETTINGS));
    assert.equal(type(text, settings.customRules), type(text, ''));
  }
});

test('a closing bracket the editor auto-paired goes with the rule', () => {
  const settings: SmartTypographySettings = { ...DEFAULT_SETTINGS, customRules: SYMBOLS };
  // Obsidian's "Auto-pair brackets" leaves `Made (c|)` before the `)` is typed.
  const paired = substitutionFor('Made (c', ') 2026', ')', settings);
  assert.deepEqual(paired, { kind: 'replace', from: 5, to: 8, insert: '©', literal: '(c)', rule: 'custom' });
  // Without the twin, or with a `)` the sequence did not open, the text after the cursor stays.
  assert.equal(substitutionFor('Made (c', ' 2026', ')', settings)?.to, 7);
  const own = { ...DEFAULT_SETTINGS, customRules: 'c) -> ©' };
  assert.equal(substitutionFor('(a c', ')', ')', own)?.to, 4);
});
