import assert from 'node:assert/strict';
import test from 'node:test';

import { tabOutTarget } from '../src/tabout.ts';
import { DEFAULT_SETTINGS } from '../src/settings.ts';

/** `before|after`: the offset Tab moves to, relative to the cursor, or null. */
function tab(doc: string, settings = {}): number | null {
  const at = doc.indexOf('|');
  const before = doc.slice(0, at);
  const target = tabOutTarget(before, doc.slice(at + 1), { ...DEFAULT_SETTINGS, ...settings });
  return target === null ? null : target - before.length;
}

test('jumps over one closing bracket', () => {
  assert.equal(tab('(see this|)'), 1);
  assert.equal(tab('[a|]'), 1);
  assert.equal(tab('{a|}'), 1);
  assert.equal(tab('«a|»'), 1);
  assert.equal(tab('(a|)) tail'), 1);
});

test('jumps over a curly closing quote of the convention', () => {
  assert.equal(tab('He said “go|” now'), 1);
});

test('the single closer ’ needs an open single quote', () => {
  assert.equal(tab('‘go|’'), 1);
  assert.equal(tab('it|’s'), null);
});

test('guillemet padding is stepped over with the guillemet', () => {
  assert.equal(tab('« go| »', { quoteStyle: 'french' }), null);
  assert.equal(tab('« go| »', { quoteStyle: 'french' }), 2);
});

test('straight quotes need an open quote before the cursor', () => {
  assert.equal(tab('say "go|" now'), 1);
  assert.equal(tab('say |"go"'), null);
  assert.equal(tab("it's 'go|'"), 1);
  assert.equal(tab("it|'s"), null);
});

test('not a closer, nothing after the cursor, or a selection-free miss', () => {
  assert.equal(tab('abc|def'), null);
  assert.equal(tab('abc|'), null);
  assert.equal(tab('abc| )'), null);
  assert.equal(tab('(abc|\n)'), null);
});

test('not in lists at the marker, tables, code, math, links or front matter', () => {
  assert.equal(tab('- |)'), null);
  assert.equal(tab('1. |)'), null);
  assert.equal(tab('- [ ] |)'), null);
  assert.equal(tab('|)'), null);
  assert.equal(tab('| a | (b|) |'), null);
  assert.equal(tab('```\n(a|)'), null);
  assert.equal(tab('`(a|)`'), null);
  assert.equal(tab('$(a|)$'), null);
  assert.equal(tab('---\nk: (a|)'), null);
  assert.equal(tab('[[Note|]]'), null);
  assert.equal(tab('[x](http://a|)'), null);
});

test('a list item with text before the closer is still prose', () => {
  assert.equal(tab('- note (see|)'), 1);
});

test('off when the setting is off', () => {
  assert.equal(tab('(a|)', { tabOut: false }), null);
});
