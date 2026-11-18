import assert from 'node:assert/strict';
import test from 'node:test';

import { typographize } from '../src/apply.ts';
import { loneHyphenInQuote, quoteDashRule } from '../src/quote-dashes.ts';
import { revertFor } from '../src/revert.ts';
import { DEFAULT_SETTINGS } from '../src/settings.ts';
import type { SmartTypographySettings } from '../src/settings.ts';
import { substitutionFor } from '../src/substitute.ts';

const ON: Partial<SmartTypographySettings> = { dashesInQuotes: true };

/** Types `keys` one character at a time and returns the document; `last` is the record Backspace would use. */
function typeIn(keys: string, start = '', patch: Partial<SmartTypographySettings> = ON) {
  const settings = { ...DEFAULT_SETTINGS, ...patch };
  let doc = start;
  let last: { from: number; to: number; inserted: string; literal: string } | null = null;
  for (const key of keys) {
    const action = substitutionFor(doc, '', key, settings);
    if (action === null || action.kind !== 'replace') {
      doc += key;
      last = null;
      continue;
    }
    doc = doc.slice(0, action.from) + action.insert;
    last = { from: action.from, to: doc.length, inserted: action.insert, literal: action.literal };
  }
  return { doc, last };
}
const type = (keys: string, start = '', patch: Partial<SmartTypographySettings> = ON) => typeIn(keys, start, patch).doc;

const ISSUE = '>This is a:\n>\n>Blockquote with multiple lines.\n>\n>Line before\n';

test('off by default: a lone -- or --- in a quote stays as typed', () => {
  assert.equal(DEFAULT_SETTINGS.dashesInQuotes, false);
  assert.equal(type('>--', ISSUE, {}), ISSUE + '>--');
  assert.equal(type('---', '> ', {}), '> ---');
});

test('issue #37: >-- on the last line of a quote becomes an en dash, >--- an em dash', () => {
  assert.equal(type('>--', ISSUE), ISSUE + '>–');
  assert.equal(type('>---', ISSUE), ISSUE + '>—');
});

test('with a space after >, in a callout and in nested quotes', () => {
  assert.equal(type('--', '> '), '> –');
  assert.equal(type('---', '> [!note]\n> '), '> [!note]\n> —');
  assert.equal(type('> >--'), '> >–');
  assert.equal(type('>>---'), '>>—');
  assert.equal(type('  > > --'), '  > > –');
});

test('outside a quote every guard stays: rule, setext underline, front matter, table, list', () => {
  assert.equal(type('---'), '---');
  assert.equal(type('---', 'Title\n'), 'Title\n---');
  assert.equal(type('--', 'Title\n'), 'Title\n--');
  assert.equal(type('---\ntitle: x\n---\n'), '---\ntitle: x\n---\n');
  assert.equal(type('| --- | --- |', '| a | b |\n'), '| a | b |\n| --- | --- |');
  assert.equal(type('- item'), '- item');
});

test('a table delimiter row inside a quote stays a table', () => {
  assert.equal(type('> | --- | :-: |', '> | a | b |\n'), '> | a | b |\n> | --- | :-: |');
});

test('a quote line inside a code block or front matter stays as typed', () => {
  assert.equal(type('>--', '```\n'), '```\n>--');
  assert.equal(type('>--', '> ```\n'), '> ```\n>--');
  assert.equal(type('>--', '---\nkey: |\n'), '---\nkey: |\n>--');
});

test('hyphens after text on a quote line are prose already, and the option changes nothing there', () => {
  assert.equal(type('> a -- b', ''), '> a – b');
  assert.equal(type('> a -- b', '', {}), '> a – b');
});

test('dashes switched off win over the option', () => {
  assert.equal(type('>--', '', { dashes: false, dashesInQuotes: true }), '>--');
});

test('an existing -- is not turned into -– by a third hyphen', () => {
  assert.equal(type('-', '>--'), '>---');
  assert.equal(quoteDashRule('>--', '-', { ...DEFAULT_SETTINGS, ...ON }), null);
});

test('Backspace straight after puts the hyphens back', () => {
  const en = typeIn('>--');
  assert.deepEqual(revertFor(en.last, en.doc, en.doc.length, en.doc.length), { from: 1, to: 2, insert: '--' });
  const em = typeIn('>---');
  assert.deepEqual(revertFor(em.last, em.doc, em.doc.length, em.doc.length), { from: 1, to: 2, insert: '---' });
});

test('Apply typography leaves lone hyphens in quotes alone, even with the option on', () => {
  const settings = { ...DEFAULT_SETTINGS, ...ON };
  assert.equal(typographize('> quote\n> ---\n>--\n> a -- b', settings), '> quote\n> ---\n>--\n> a – b');
});

test('loneHyphenInQuote', () => {
  for (const yes of ['>-', '> -', '>>-', '> > -', '  >\t-']) assert.ok(loneHyphenInQuote(yes), yes);
  for (const no of ['-', '>', '>--', '> a -', '- >-', '> |-', 'x>-']) assert.ok(!loneHyphenInQuote(no), no);
});
