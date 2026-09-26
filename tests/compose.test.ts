import assert from 'node:assert/strict';
import test from 'node:test';

import { curlComposedQuotes } from '../src/compose.ts';
import { DEFAULT_SETTINGS } from '../src/settings.ts';
import type { SmartTypographySettings } from '../src/settings.ts';
import { mightSubstitute } from '../src/substitute.ts';

/** Applies the changes for the composed range `[from, to)` of `doc`. */
function curl(doc: string, from: number, to: number, settings: Partial<SmartTypographySettings> = {}): string {
  const changes = curlComposedQuotes(doc, from, to, { ...DEFAULT_SETTINGS, ...settings });
  let out = doc;
  for (const change of [...changes].reverse()) {
    out = out.slice(0, change.from) + change.insert + out.slice(change.to);
  }
  return out;
}

test('an apostrophe composed inside a word becomes U+2019', () => {
  assert.equal(curl("Say it's", 4, 8), 'Say it’s');
});

test('quotes composed together with a word open and close', () => {
  assert.equal(curl('Say "hi"', 4, 8), 'Say “hi”');
});

test('each quote sees the quotes curled before it', () => {
  assert.equal(curl(`"it's"`, 0, 6), '“it’s”');
});

test('only the composed range is touched', () => {
  assert.equal(curl(`"a" "b"`, 4, 7), `"a" “b”`);
});

test('the chosen convention is used', () => {
  assert.equal(curl('Er sagt "ja"', 8, 12, { quoteStyle: 'german' }), 'Er sagt „ja“');
});

test('nothing changes inside code', () => {
  assert.equal(curl('`it\'s`', 1, 5), '`it\'s`');
  assert.equal(curl('```\nit\'s', 4, 8), '```\nit\'s');
});

test('a quote already sitting ahead is replaced, not stepped over', () => {
  // The skip rule is for a keystroke; composed text is already in the note.
  assert.equal(curl('"hi"', 3, 4, {}), '"hi”');
});

test('switched-off rules stay off', () => {
  assert.equal(curl("it's", 0, 4, { smartApostrophes: false, quoteStyle: 'off' }), "it's");
  assert.equal(curl('"hi"', 0, 4, { quoteStyle: 'off' }), '"hi"');
});

test('dashes and ellipses are left to the keystroke handler', () => {
  assert.equal(curl('a -- b...', 0, 9), 'a -- b...');
});

test('letters and spaces never need the document', () => {
  for (const key of ['a', 'Z', ' ', 'é', '\n']) assert.equal(mightSubstitute(key), false, key);
  for (const key of ['"', "'", '-', '.', '>', '=', '7']) assert.equal(mightSubstitute(key), true, key);
});
