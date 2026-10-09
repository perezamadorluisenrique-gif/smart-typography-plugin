import assert from 'node:assert/strict';
import test from 'node:test';

import { folderQuoteStyle, folderQuotesFor, parseConvention, resolveQuoteStyle, settingsForNote } from '../src/quotes.ts';
import { setNoteProperty } from '../src/scope.ts';
import type { TextEdit } from '../src/scope.ts';
import { DEFAULT_SETTINGS } from '../src/settings.ts';
import type { SmartTypographySettings } from '../src/settings.ts';
import { typographize } from '../src/apply.ts';
import { substitutionFor } from '../src/substitute.ts';
import { wrapFor } from '../src/wrap.ts';
import { tabOutTarget } from '../src/tabout.ts';
import { revertFor } from '../src/revert.ts';

const apply = (text: string, edit: TextEdit | null) =>
  edit === null ? text : text.slice(0, edit.from) + edit.insert + text.slice(edit.to);

const withSettings = (patch: Partial<SmartTypographySettings>): SmartTypographySettings => ({ ...DEFAULT_SETTINGS, ...patch });

test('parseConvention accepts keys, names, language codes and off, in any case', () => {
  assert.equal(parseConvention('german'), 'german');
  assert.equal(parseConvention(' German '), 'german');
  assert.equal(parseConvention('Deutsch'), 'german');
  assert.equal(parseConvention('de'), 'german');
  assert.equal(parseConvention('DE-AT'), 'german');
  assert.equal(parseConvention('fr'), 'french');
  assert.equal(parseConvention('fr_CA'), 'french');
  assert.equal(parseConvention('français'), 'french');
  assert.equal(parseConvention('en-GB'), 'english');
  assert.equal(parseConvention('ru'), 'russian');
  assert.equal(parseConvention('off'), 'off');
  assert.equal(parseConvention(false), 'off');
});

test('parseConvention returns null for anything else', () => {
  for (const value of ['', '  ', 'klingon', 'pt', 'toString', '__proto__', 'constructor', 42, null, undefined, true, ['de'], {}]) {
    assert.equal(parseConvention(value), null, String(value));
  }
});

test('folderQuotesFor reads folder -> convention lines and reports the rest', () => {
  const { folders, ignored } = folderQuotesFor('Deutsch -> german\n/France/Notes/ -> fr\n\nno arrow\n -> german\nX -> nonsense\r\nA -> B -> english');
  assert.deepEqual(folders, [
    { folder: 'Deutsch', style: 'german' },
    { folder: 'France/Notes', style: 'french' },
    { folder: 'A -> B', style: 'english' },
  ]);
  assert.deepEqual(ignored.map((i) => i.line), [4, 5, 6]);
});

test('the most specific folder wins, whatever the order of the lines', () => {
  const setting = 'Work -> french\nWork/Berlin -> german\nWork/Berlin/Press -> english';
  assert.equal(folderQuoteStyle('Work/a.md', setting), 'french');
  assert.equal(folderQuoteStyle('Work/Berlin/a.md', setting), 'german');
  assert.equal(folderQuoteStyle('Work/Berlin/Press/deep/a.md', setting), 'english');
  assert.equal(folderQuoteStyle('Work/Berlin/Press/a.md', 'Work/Berlin/Press -> english\nWork -> french'), 'english');
  assert.equal(folderQuoteStyle('Workshop/a.md', setting), null);
  assert.equal(folderQuoteStyle('a.md', setting), null);
});

test('resolution order: property, then lang, then folder, then global', () => {
  const s = withSettings({ quoteStyle: 'english', useLangProperty: true, quotesByFolder: 'Notes -> spanish' });
  const path = 'Notes/a.md';
  assert.equal(resolveQuoteStyle({ path, quotes: 'german', lang: 'fr' }, s), 'german');
  assert.equal(resolveQuoteStyle({ path, lang: 'fr' }, s), 'french');
  assert.equal(resolveQuoteStyle({ path }, s), 'spanish');
  assert.equal(resolveQuoteStyle({ path: 'Other/a.md' }, s), 'english');
  assert.equal(resolveQuoteStyle({ path: null }, s), 'english');
});

test('the lang property is ignored unless the setting is on', () => {
  const s = withSettings({ quotesByFolder: 'Notes -> spanish' });
  assert.equal(s.useLangProperty, false);
  assert.equal(resolveQuoteStyle({ path: 'Notes/a.md', lang: 'de' }, s), 'spanish');
  assert.equal(resolveQuoteStyle({ path: 'x.md', lang: 'de' }, s), 'english');
});

test('unknown values are ignored and the next step decides', () => {
  const s = withSettings({ useLangProperty: true, quotesByFolder: 'Notes -> french' });
  assert.equal(resolveQuoteStyle({ path: 'Notes/a.md', quotes: 'klingon', lang: 'pt' }, s), 'french');
  assert.equal(resolveQuoteStyle({ path: 'Notes/a.md', quotes: 7, lang: ['de'] }, s), 'french');
  assert.equal(resolveQuoteStyle({ path: 'x.md', quotes: 'klingon', lang: 'xx' }, withSettings({ quoteStyle: 'polish', useLangProperty: true })), 'polish');
});

test('a note can switch quotes off, and a global off can be overridden', () => {
  assert.equal(resolveQuoteStyle({ path: 'a.md', quotes: 'off' }, DEFAULT_SETTINGS), 'off');
  assert.equal(resolveQuoteStyle({ path: 'a.md', quotes: 'german' }, withSettings({ quoteStyle: 'off' })), 'german');
});

test('settingsForNote returns the same object when nothing changes', () => {
  assert.equal(settingsForNote({ path: 'a.md' }, DEFAULT_SETTINGS), DEFAULT_SETTINGS);
  const changed = settingsForNote({ path: 'a.md', quotes: 'de' }, DEFAULT_SETTINGS);
  assert.equal(changed.quoteStyle, 'german');
  assert.equal(DEFAULT_SETTINGS.quoteStyle, 'english');
});

test('typing uses the resolved convention', () => {
  const german = settingsForNote({ path: 'a.md', quotes: 'german' }, DEFAULT_SETTINGS);
  const french = settingsForNote({ path: 'a.md', lang: 'fr' }, withSettings({ useLangProperty: true }));
  const open = substitutionFor('', '', '"', german);
  assert.equal(open?.kind === 'replace' && open.insert, '„');
  const close = substitutionFor('„Hallo', '', '"', german);
  assert.equal(close?.kind === 'replace' && close.insert, '“');
  const fr = substitutionFor('', '', '"', french);
  assert.equal(fr?.kind === 'replace' && fr.insert, '« ');
  const en = substitutionFor('', '', '"', DEFAULT_SETTINGS);
  assert.equal(en?.kind === 'replace' && en.insert, '“');
});

test('step-over uses the resolved convention', () => {
  const german = settingsForNote({ path: 'a.md', quotes: 'german' }, DEFAULT_SETTINGS);
  const step = substitutionFor('„Hallo', '“ x', '"', german);
  assert.equal(step?.kind, 'skip');
  const english = substitutionFor('„Hallo', '“ x', '"', DEFAULT_SETTINGS);
  assert.notEqual(english?.kind, 'skip');
});

test('wrapping and tab-out use the resolved convention', () => {
  const german = settingsForNote({ path: 'a.md', quotes: 'german' }, DEFAULT_SETTINGS);
  assert.deepEqual(wrapFor('"', german), { open: '„', close: '“' });
  assert.deepEqual(wrapFor('"', DEFAULT_SETTINGS), { open: '“', close: '”' });
  assert.equal(tabOutTarget('„abc', '“ x', german), 'abc'.length + 1 + 1);
});

test('Backspace revert gives back the straight quote whatever the convention', () => {
  const german = settingsForNote({ path: 'a.md', quotes: 'german' }, DEFAULT_SETTINGS);
  const action = substitutionFor('say ', '', '"', german);
  assert.ok(action?.kind === 'replace');
  const doc = 'say „';
  const revert = revertFor(
    { from: action.from, to: action.from + action.insert.length, inserted: action.insert, literal: action.literal },
    doc,
    doc.length,
    doc.length,
  );
  assert.equal(revert && doc.slice(0, revert.from) + revert.insert, 'say "');
});

test('apply typography uses the resolved convention', () => {
  const text = 'Er sagte "Hallo" und \'ging\'.';
  assert.equal(typographize(text, settingsForNote({ path: 'a.md', quotes: 'german' }, DEFAULT_SETTINGS)), 'Er sagte „Hallo“ und ‚ging‘.');
  assert.equal(typographize(text, DEFAULT_SETTINGS), 'Er sagte “Hallo” und ‘ging’.');
  assert.equal(typographize('Er sagte "Hallo".', settingsForNote({ path: 'a.md', quotes: 'off' }, DEFAULT_SETTINGS)), 'Er sagte "Hallo".');
});

test('setNoteProperty adds, replaces and removes only its own property', () => {
  const name = 'typography-quotes';
  assert.equal(apply('Body', setNoteProperty('Body', name, 'german')), `---\n${name}: german\n---\nBody`);
  assert.equal(apply('---\ntitle: x\n---\nBody', setNoteProperty('---\ntitle: x\n---\nBody', name, 'french')), `---\ntitle: x\n${name}: french\n---\nBody`);
  const has = `---\n${name}: german\ntypography: off\n---\nBody`;
  assert.equal(apply(has, setNoteProperty(has, name, 'french')), `---\n${name}: french\ntypography: off\n---\nBody`);
  assert.equal(setNoteProperty(has, name, 'german'), null);
  assert.equal(apply(has, setNoteProperty(has, name, null)), '---\ntypography: off\n---\nBody');
  const only = `---\n${name}: german\n---\nBody`;
  assert.equal(apply(only, setNoteProperty(only, name, null)), 'Body');
  assert.equal(setNoteProperty('Body', name, null), null);
  const other = '---\ntypography: off\n---\nBody';
  assert.equal(setNoteProperty(other, name, null), null);
  assert.equal(apply(other, setNoteProperty(other, name, 'german')), `---\ntypography: off\n${name}: german\n---\nBody`);
});
