/**
 * Properties that hold for any note, checked on hand-written notes in the
 * style of the Obsidian help vault and on a few thousand generated ones.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { changesBetween, typographize } from '../src/apply.ts';
import { setNoteOff } from '../src/scope.ts';
import { DEFAULT_SETTINGS, QUOTE_CONVENTIONS } from '../src/settings.ts';
import type { SmartTypographySettings } from '../src/settings.ts';
import { SAMPLES, protectedPieces, randomNote } from './markdown-samples.ts';

const NOTES: [string, string][] = [
  ...Object.entries(SAMPLES),
  ...Array.from({ length: 2000 }, (_, i): [string, string] => [`seed ${i + 1}`, randomNote(i + 1)]),
];

const SETTINGS: SmartTypographySettings[] = [
  DEFAULT_SETTINGS,
  ...QUOTE_CONVENTIONS.filter((c) => c.id !== 'english').map((c) => ({ ...DEFAULT_SETTINGS, quoteStyle: c.id })),
];

function apply(text: string, changes: { from: number; to: number; insert: string }[]): string {
  let out = text;
  for (const c of [...changes].reverse()) out = out.slice(0, c.from) + c.insert + out.slice(c.to);
  return out;
}

test('applying typography twice changes nothing the second time', () => {
  for (const settings of SETTINGS) {
    for (const [name, note] of NOTES) {
      const once = typographize(note, settings);
      assert.equal(typographize(once, settings), once, `${name}, ${settings.quoteStyle}`);
    }
  }
});

test('code, maths, links, comments and front matter come out unchanged', () => {
  for (const [name, note] of NOTES) {
    assert.deepEqual(protectedPieces(typographize(note, DEFAULT_SETTINGS)), protectedPieces(note), name);
  }
});

test('no line is added or removed, and the line edits rebuild the result', () => {
  for (const [name, note] of NOTES) {
    const out = typographize(note, DEFAULT_SETTINGS);
    assert.equal(out.split('\n').length, note.split('\n').length, name);
    assert.equal(apply(note, changesBetween(note, out)), out, name);
  }
});

test('turning a note off and back on gives back the same text', () => {
  for (const [name, note] of NOTES) {
    if (/^typography\s*:/m.test(note)) continue;
    const off = setNoteOff(note, true);
    assert.ok(off, name);
    const offText = apply(note, [off]);
    const on = setNoteOff(offText, false);
    assert.ok(on, name);
    assert.equal(apply(offText, [on]), note, name);
  }
});
