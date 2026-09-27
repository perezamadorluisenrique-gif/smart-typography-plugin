import assert from 'node:assert/strict';
import test from 'node:test';

import { folderList, inFolder, isOff, noteIsOff, setNoteOff } from '../src/scope.ts';
import type { TextEdit } from '../src/scope.ts';

const apply = (text: string, edit: TextEdit | null) =>
  edit === null ? text : text.slice(0, edit.from) + edit.insert + text.slice(edit.to);

test('folderList reads one folder per line and trims slashes', () => {
  assert.deepEqual(folderList(' Code/\n\n/Journal/Raw \r\nx'), ['Code', 'Journal/Raw', 'x']);
  assert.deepEqual(folderList(''), []);
});

test('inFolder matches the folder and everything below it, not a prefix of a name', () => {
  assert.ok(inFolder('Code/a.md', ['Code']));
  assert.ok(inFolder('Code/deep/a.md', ['Code']));
  assert.ok(!inFolder('Codex/a.md', ['Code']));
  assert.ok(!inFolder('a.md', []));
});

test('isOff accepts off, false and no', () => {
  assert.ok(isOff('off'));
  assert.ok(isOff(false));
  assert.ok(isOff(' No '));
  assert.ok(!isOff('on'));
  assert.ok(!isOff(undefined));
  assert.ok(!isOff(true));
});

test('noteIsOff reads the property from the note text', () => {
  assert.ok(noteIsOff('---\ntags: a\ntypography: off\n---\nBody'));
  assert.ok(noteIsOff('---\ntypography: "false"\n---\n'));
  assert.ok(!noteIsOff('---\ntypography: on\n---\n'));
  assert.ok(!noteIsOff('typography: off\n'));
  assert.ok(!noteIsOff('---\ntypography: off\n'));
});

test('turning a note off adds the property, creating front matter if needed', () => {
  assert.equal(apply('Body', setNoteOff('Body', true)), '---\ntypography: off\n---\nBody');
  assert.equal(apply('---\ntags: a\n---\nBody', setNoteOff('---\ntags: a\n---\nBody', true)), '---\ntags: a\ntypography: off\n---\nBody');
  assert.equal(apply('---\ntypography: on\n---\n', setNoteOff('---\ntypography: on\n---\n', true)), '---\ntypography: off\n---\n');
  assert.equal(setNoteOff('---\ntypography: off\n---\n', true), null);
});

test('turning a note back on removes the property, and empty front matter with it', () => {
  assert.equal(apply('---\ntypography: off\n---\nBody', setNoteOff('---\ntypography: off\n---\nBody', false)), 'Body');
  const text = '---\ntags: a\ntypography: off\n---\nBody';
  assert.equal(apply(text, setNoteOff(text, false)), '---\ntags: a\n---\nBody');
  assert.equal(setNoteOff('Body', false), null);
});
