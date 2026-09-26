import assert from 'node:assert/strict';
import test from 'node:test';

import { substitutionFor } from '../src/substitute.ts';
import type { Action } from '../src/substitute.ts';
import { DEFAULT_SETTINGS } from '../src/settings.ts';
import type { SmartTypographySettings } from '../src/settings.ts';

/**
 * Types `keys` one character at a time through the engine and returns the
 * document it leaves behind.
 *
 * Feeding the keystrokes one by one is the point: several rules chain off
 * a character an earlier rule produced, and a test that called the engine
 * once with `--` already in place would miss that.
 */
function type(
  keys: string,
  options: {
    start?: string;
    after?: string;
    settings?: Partial<SmartTypographySettings>;
  } = {},
): string {
  const settings = { ...DEFAULT_SETTINGS, ...options.settings };
  let before = options.start ?? '';
  let after = options.after ?? '';

  for (const key of keys) {
    const action = substitutionFor(before, after, key, settings);

    if (action === null) {
      before += key;
      continue;
    }

    if (action.kind === 'skip') {
      const stepped = action.to - before.length;
      before += after.slice(0, stepped);
      after = after.slice(stepped);
      continue;
    }

    before = before.slice(0, action.from) + action.insert;
  }

  return before + after;
}

/** The action a single keystroke produces, for the cases that need detail. */
function act(
  before: string,
  typed: string,
  options: { after?: string; settings?: Partial<SmartTypographySettings> } = {},
): Action | null {
  return substitutionFor(before, options.after ?? '', typed, {
    ...DEFAULT_SETTINGS,
    ...options.settings,
  });
}

// ── Quotation marks ──────────────────────────────────────────────────────

test('double quotes open and close around a word', () => {
  assert.equal(type('"hello"'), '“hello”');
});

test('a quote at the very start of the document opens', () => {
  // The original closes it, so a note beginning with a quotation gets the
  // wrong mark (mgmeyers/obsidian-smart-typography#65).
  const action = act('', '"');
  assert.deepEqual(action, {
    kind: 'replace',
    from: 0,
    to: 0,
    insert: '“',
    literal: '"',
    rule: 'quote-open',
  });
});

test('a quote after an opening bracket opens', () => {
  assert.equal(type('("hi")'), '(“hi”)');
});

test('a quote after a letter closes', () => {
  assert.equal(type('"', { start: 'he said hello' }), 'he said hello”');
});

test('single quotes nest inside double quotes', () => {
  assert.equal(type("\"he said 'no'\""), '“he said ‘no’”');
});

test('quote substitution can be switched off on its own', () => {
  assert.equal(type('"hi"', { settings: { quoteStyle: 'off' } }), '"hi"');
});

// ── Apostrophes ──────────────────────────────────────────────────────────

test('an apostrophe inside a word is not a quote', () => {
  assert.equal(type("it's"), 'it’s');
});

test('an apostrophe still works with quotation marks switched off', () => {
  assert.equal(type("it's", { settings: { quoteStyle: 'off' } }), 'it’s');
});

test('a German apostrophe is U+2019, not the closing single quote', () => {
  // German closes single quotes with U+2018, and the original uses that
  // character for apostrophes too (#70). `geht's` is not a quotation.
  assert.equal(type("geht's", { settings: { quoteStyle: 'german' } }), 'geht’s');
});

test('an apostrophe before a decade becomes an apostrophe, not a quote', () => {
  // Nothing at the time of typing says `'` is not opening a quotation; the
  // digit that follows does (#43).
  assert.equal(type("the '90s"), 'the ’90s');
});

test('an opening single quote before a letter stays a quote', () => {
  assert.equal(type("'quoted'"), '‘quoted’');
});

test('apostrophes can be switched off on their own', () => {
  // With them off the character falls back to the convention's closing
  // single quote, which in German is a different one.
  assert.equal(
    type("geht's", { settings: { quoteStyle: 'german', smartApostrophes: false } }),
    'geht‘s',
  );
});

// ── Other conventions ────────────────────────────────────────────────────

test('German quotes open low and close high', () => {
  assert.equal(type('"Hallo"', { settings: { quoteStyle: 'german' } }), '„Hallo“');
});

test('French guillemets carry a no-break space inside', () => {
  assert.equal(
    type('"bonjour"', { settings: { quoteStyle: 'french' } }),
    '« bonjour »',
  );
});

test('a German single quotation closes with its own mark, not an apostrophe', () => {
  // After a letter a `'` is usually an apostrophe, but not while a single
  // quotation is open in a convention that closes it differently.
  assert.equal(
    type("'ja' und geht's", { settings: { quoteStyle: 'german' } }),
    '‚ja‘ und geht’s',
  );
});

test('Spanish uses guillemets outside and curly quotes inside', () => {
  assert.equal(
    type('"dijo \'no\'"', { settings: { quoteStyle: 'spanish' } }),
    '«dijo “no”»',
  );
});

// ── Stepping over a closing quote ────────────────────────────────────────

test('typing a closing quote where one already sits steps over it', () => {
  // Obsidian's own auto-pair leaves the closing quote in place, and the
  // original adds a second one (#57, #56, #59).
  assert.equal(type('"', { start: '“hello', after: '”' }), '“hello”');
});

test('stepping over moves the cursor and types nothing', () => {
  assert.deepEqual(act('“hello', '"', { after: '”' }), {
    kind: 'skip',
    to: 7,
    rule: 'quote-skip',
  });
});

test('stepping over can be switched off', () => {
  assert.equal(
    type('"', { start: '“hello', after: '”', settings: { skipClosingQuote: false } }),
    '“hello””',
  );
});

// ── Dashes and the ellipsis ──────────────────────────────────────────────

test('two hyphens become an en dash and three an em dash', () => {
  assert.equal(type('a--b'), 'a–b');
  assert.equal(type('a---b'), 'a—b');
});

test('a horizontal rule in a quote or callout is left alone', () => {
  assert.equal(type('---', { start: '> ' }), '> ---');
  assert.equal(type('---', { start: '> [!note]\n> ' }), '> [!note]\n> ---');
});

test('the delimiter row of a table is left alone', () => {
  // One dash in it and the table stops rendering.
  const header = '| Name | Age |\n';
  assert.equal(type('| --- | :--: |', { start: header }), header + '| --- | :--: |');
  assert.equal(type('--- | ---', { start: 'Name | Age\n' }), 'Name | Age\n--- | ---');
  // Dashes in a table's cells are still prose.
  assert.equal(type('| a -- b |'), '| a – b |');
});

test('the opener of an HTML comment is left alone', () => {
  assert.equal(type('<!-- note -->'), '<!-- note -->');
});

test('a quote inside a Templater script is left straight', () => {
  const script = '<%*\nconst title = "x";\n%>\nShe said "hi"';
  assert.equal(type(script), '<%*\nconst title = "x";\n%>\nShe said “hi”');
});

test('a horizontal rule is left alone', () => {
  // `---` on its own line is a horizontal rule, a setext underline and the
  // frontmatter fence. None of them is an em dash.
  assert.equal(type('---'), '---');
  assert.equal(type('---', { start: 'Title\n' }), 'Title\n---');
});

test('a list bullet is left alone', () => {
  assert.equal(type('- item'), '- item');
});

test('three dots become an ellipsis', () => {
  assert.equal(type('Wait...'), 'Wait…');
});

// ── Arrows and mathematical symbols ──────────────────────────────────────

test('arrows', () => {
  assert.equal(type('a->b'), 'a→b');
  // `--` has already become an en dash by the time the `>` arrives.
  assert.equal(type('a-->b'), 'a→b');
  assert.equal(type('a<-b'), 'a←b');
  assert.equal(type('a<->b'), 'a↔b');
  assert.equal(type('a=>b'), 'a⇒b');
  assert.equal(type('a<=>b'), 'a⇔b');
});

test('mathematical symbols', () => {
  assert.equal(type('a>=b'), 'a≥b');
  assert.equal(type('a<=b'), 'a≤b');
  assert.equal(type('a!=b'), 'a≠b');
  assert.equal(type('a/=b'), 'a≠b');
  assert.equal(type('a+-b'), 'a±b');
  assert.equal(type('a+/-b'), 'a±b');
});

test('<== reaches the double arrow by chaining off <=', () => {
  assert.equal(type('a<==b'), 'a⇐b');
});

test('<= is the double arrow when the maths group is off', () => {
  assert.equal(type('a<=b', { settings: { mathSymbols: false } }), 'a⇐b');
});

test('each group can be switched off on its own', () => {
  assert.equal(type('a--b', { settings: { dashes: false } }), 'a--b');
  assert.equal(type('a...b', { settings: { ellipsis: false } }), 'a...b');
  assert.equal(type('a->b', { settings: { arrows: false } }), 'a->b');
  assert.equal(type('a>=b', { settings: { mathSymbols: false } }), 'a>=b');
});

// ── What the literal is, for Backspace ───────────────────────────────────

/** The keystrokes a substitution says it replaced. */
function literalOf(before: string, typed: string): string | null {
  const action = act(before, typed);
  return action !== null && action.kind === 'replace' ? action.literal : null;
}

test('a substitution reports the keystrokes it replaced', () => {
  // Backspace puts these back, so a rule that chained off an earlier one
  // has to report the whole chain and not just its last two characters.
  assert.equal(literalOf('a..', '.'), '...');
  assert.equal(literalOf('a-', '-'), '--');
  assert.equal(literalOf('a–', '-'), '---');
  assert.equal(literalOf('a≤', '='), '<==');
  assert.equal(literalOf('a–', '>'), '-->');
});

// ── Code and other places to keep out of ─────────────────────────────────

test('nothing is substituted inside inline code', () => {
  assert.equal(type("`it's`"), "`it's`");
});

test('nothing is substituted inside a Dataview query', () => {
  // Curly quotes are a syntax error there (#46).
  assert.equal(
    type('"Work"', { start: '```dataview\nLIST WHERE folder = ' }),
    '```dataview\nLIST WHERE folder = "Work"',
  );
});

test('substitution resumes after a code block closes', () => {
  assert.equal(type('"hi"', { start: '```\ncode\n```\n' }), '```\ncode\n```\n“hi”');
});

test('nothing is substituted inside a link target', () => {
  // Apostrophes in link targets break the link (#62).
  assert.equal(type("John's]]", { start: '[[' }), "[[John's]]");
  assert.equal(type("a's.md)", { start: '[label](' }), "[label](a's.md)");
});

test('nothing is substituted inside a Templater expression', () => {
  // Quote substitution there is a parse error (#39).
  assert.equal(type('"x"', { start: '<% tp.file.title == ' }), '<% tp.file.title == "x"');
});

test('nothing is substituted inside frontmatter', () => {
  assert.equal(type('"a - b"', { start: '---\ntitle: ' }), '---\ntitle: "a - b"');
});

test('nothing is substituted inside an HTML comment', () => {
  // `--` inside a comment is on its way to being `-->`.
  assert.equal(type('-->', { start: '<!-- todo ' }), '<!-- todo -->');
});

test('a price does not switch substitution off for the rest of the line', () => {
  assert.equal(type("it's $5, isn't it"), 'it’s $5, isn’t it');
});

test('nothing is substituted inside a formula', () => {
  assert.equal(type('a<=b$', { start: 'the bound $' }), 'the bound $a<=b$');
});

test('quotes inside an HTML tag stay straight, and the text around it is curled', () => {
  assert.equal(
    type('<span style="color: red">it\'s "hi"</span>'),
    '<span style="color: red">it’s “hi”</span>',
  );
  assert.equal(type('<img src="a.png" width="300">'), '<img src="a.png" width="300">');
  assert.equal(type('<font color=\'red\'>x</font>'), '<font color=\'red\'>x</font>');
});
