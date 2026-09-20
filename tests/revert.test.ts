import assert from 'node:assert/strict';
import test from 'node:test';

import { revertFor } from '../src/revert.ts';
import type { LastSubstitution } from '../src/revert.ts';

/** `...` was turned into `…` at the start of `Wait… for it`. */
const ellipsis: LastSubstitution = {
  from: 4,
  to: 5,
  inserted: '…',
  literal: '...',
};
const doc = 'Wait… for it';

test('Backspace right after a substitution puts the keystrokes back', () => {
  assert.deepEqual(revertFor(ellipsis, doc, 5, 5), { from: 4, to: 5, insert: '...' });
});

test('Backspace does nothing special when there is no substitution', () => {
  assert.equal(revertFor(null, doc, 5, 5), null);
});

test('Backspace does not revert once the cursor has moved away', () => {
  // The original reverts on any Backspace, so pressing End and then
  // Backspace rewrites text the cursor is no longer anywhere near
  // (mgmeyers/obsidian-smart-typography#58).
  assert.equal(revertFor(ellipsis, doc, 12, 12), null);
});

test('Backspace does not revert from just before the substitution either', () => {
  assert.equal(revertFor(ellipsis, doc, 4, 4), null);
});

test('Backspace deletes a selection rather than reverting', () => {
  assert.equal(revertFor(ellipsis, doc, 0, 5), null);
});

test('a stale record is ignored', () => {
  // The document no longer holds what the record says was inserted, so
  // something else has edited it in between.
  assert.equal(revertFor(ellipsis, 'Wait... for it', 5, 5), null);
});

test('a substitution that changed nothing has nothing to put back', () => {
  const unchanged: LastSubstitution = { from: 0, to: 1, inserted: 'a', literal: 'a' };
  assert.equal(revertFor(unchanged, 'abc', 1, 1), null);
});

test('a multi-character substitution reverts as a whole', () => {
  // French guillemets insert two characters and can absorb a space, so
  // the record covers more than one character on each side.
  const guillemet: LastSubstitution = {
    from: 7,
    to: 9,
    inserted: ' »',
    literal: ' "',
  };
  assert.deepEqual(revertFor(guillemet, 'bonjour »', 9, 9), {
    from: 7,
    to: 9,
    insert: ' "',
  });
});
