import assert from 'node:assert/strict';
import test from 'node:test';

import { ExtensionRegistry } from '../src/api.ts';
import { marksOf, noteStatus, statusText, statusTooltip } from '../src/note-status.ts';
import { DEFAULT_SETTINGS } from '../src/settings.ts';
import type { QuoteStyleId, SmartTypographySettings } from '../src/settings.ts';

/** Makes the registry invent a convention, the way another plugin's resolver would, and returns its id. */
function registerConvention(): QuoteStyleId {
  const registry = new ExtensionRegistry();
  registry.registerQuoteResolver(() => ({ doubleOpen: '⟪', doubleClose: '⟫', singleOpen: '⟨', singleClose: '⟩', padding: '' }));
  const id = registry.quoteStyleFor({ path: 'x.md' });
  if (id === null) throw new Error('resolver ignored');
  return id;
}

const settings = (patch: Partial<SmartTypographySettings> = {}) => ({ ...DEFAULT_SETTINGS, ...patch });

test('a plain note: on, global quotes', () => {
  const status = noteStatus({ path: 'a.md' }, settings());
  assert.deepEqual(status, { off: null, quoteStyle: 'english', source: 'default' });
  assert.equal(statusText(status), '“ ”');
});

test('typography: off and excluded folders turn the note off, the folder first', () => {
  assert.equal(noteStatus({ path: 'a.md', typography: 'off' }, settings()).off, 'property');
  assert.equal(noteStatus({ path: 'a.md', typography: false }, settings()).off, 'property');
  assert.equal(noteStatus({ path: 'a.md', typography: 'on' }, settings()).off, null);
  assert.equal(noteStatus({ path: 'Code/a.md', typography: 'off' }, settings({ excludedFolders: 'Code' })).off, 'folder');
  assert.equal(noteStatus({ path: 'Codex/a.md' }, settings({ excludedFolders: 'Code' })).off, null);
  assert.equal(statusText(noteStatus({ path: 'a.md', typography: 'off' }, settings())), '“ ” off');
});

test('where the quotes come from, in the order the editor uses', () => {
  const s = settings({ useLangProperty: true, quotesByFolder: 'Deutsch -> german' });
  assert.deepEqual(noteStatus({ path: 'Deutsch/a.md', quotes: 'fr', lang: 'ru' }, s, 'polish'), { off: null, quoteStyle: 'french', source: 'property' });
  assert.deepEqual(noteStatus({ path: 'Deutsch/a.md', lang: 'ru' }, s, 'polish'), { off: null, quoteStyle: 'polish', source: 'plugin' });
  assert.deepEqual(noteStatus({ path: 'Deutsch/a.md', lang: 'ru' }, s), { off: null, quoteStyle: 'russian', source: 'lang' });
  assert.deepEqual(noteStatus({ path: 'Deutsch/a.md', lang: 'ru' }, settings({ quotesByFolder: 'Deutsch -> german' })), { off: null, quoteStyle: 'german', source: 'folder' });
  assert.deepEqual(noteStatus({ path: 'Deutsch/a.md', quotes: 'klingon' }, s), { off: null, quoteStyle: 'german', source: 'folder' });
  assert.deepEqual(noteStatus({ path: 'b.md' }, settings({ quoteStyle: 'spanish' })), { off: null, quoteStyle: 'spanish', source: 'default' });
});

test('marks: each convention, straight quotes and an extension convention', () => {
  assert.equal(marksOf('german'), '„ “');
  assert.equal(marksOf('french'), '« »');
  assert.equal(marksOf('off'), '" "');
  const ext = registerConvention();
  assert.equal(marksOf(ext), '⟪ ⟫');
  assert.match(statusTooltip({ off: null, quoteStyle: ext, source: 'plugin' }), /⟪ ⟫ ⟨ ⟩, chosen by another plugin/);
});

test('the tooltip says the state, the quotes and their source', () => {
  const lines = statusTooltip({ off: 'folder', quoteStyle: 'german', source: 'folder' }).split('\n');
  assert.deepEqual(lines, [
    'Typography is off: this note is in an excluded folder.',
    'Quotation marks: German „ “ ‚ ‘, from Quotes per folder.',
    'Click for options.',
  ]);
  assert.match(statusTooltip({ off: 'property', quoteStyle: 'off', source: 'property' }), /off in this note \(typography: off\)[\s\S]*Straight quotes \(off\), from the typography-quotes property/);
  assert.match(statusTooltip({ off: null, quoteStyle: 'english', source: 'default' }), /^Typography is on in this note\.\nQuotation marks: English “ ” ‘ ’, from the plugin settings\./);
  assert.match(statusTooltip({ off: null, quoteStyle: 'russian', source: 'lang' }), /from the lang property/);
});
