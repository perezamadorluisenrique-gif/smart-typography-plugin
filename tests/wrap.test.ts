import assert from 'node:assert/strict';
import test from 'node:test';

import { wrapFor } from '../src/wrap.ts';
import { DEFAULT_SETTINGS } from '../src/settings.ts';

const w = (typed: string, s = {}) => wrapFor(typed, { ...DEFAULT_SETTINGS, ...s });

test('straight quotes wrap in the convention', () => {
  assert.deepEqual(w('"'), { open: '“', close: '”' });
  assert.deepEqual(w("'"), { open: '‘', close: '’' });
  assert.deepEqual(w('"', { quoteStyle: 'german' }), { open: '„', close: '“' });
  assert.deepEqual(w('"', { quoteStyle: 'spanish' }), { open: '«', close: '»' });
  assert.deepEqual(w('"', { quoteStyle: 'french' }), { open: '« ', close: ' »' });
});

test('curly and angle quotes typed directly wrap with their partner', () => {
  assert.deepEqual(w('“'), { open: '“', close: '”' });
  assert.deepEqual(w('«'), { open: '«', close: '»' });
  assert.deepEqual(w('«', { quoteStyle: 'french' }), { open: '« ', close: ' »' });
  assert.deepEqual(w('„'), { open: '„', close: '“' });
});

test('nothing for other keys, quotes off, or the setting off', () => {
  assert.equal(w('('), null);
  assert.equal(w('*'), null);
  assert.equal(w('a'), null);
  assert.equal(w('"', { quoteStyle: 'off' }), null);
  assert.equal(w('"', { wrapSelection: false }), null);
  assert.equal(w('“', { wrapSelection: false }), null);
});
