import assert from 'node:assert/strict';
import test from 'node:test';

import { typographize } from '../src/apply.ts';
import { API_VERSION, ExtensionRegistry, resolvedDash, withResolvedQuotes } from '../src/api.ts';
import { settingsForNote } from '../src/quotes.ts';
import { DEFAULT_SETTINGS } from '../src/settings.ts';

const GERMAN = { doubleOpen: '„', doubleClose: '“', singleOpen: '‚', singleClose: '‘', padding: '' };
const note = { path: 'Buch/kapitel.md' };

test('with nothing registered, the settings come out as they went in', () => {
  const registry = new ExtensionRegistry();
  assert.equal(registry.version, API_VERSION);
  assert.equal(withResolvedQuotes(DEFAULT_SETTINGS, registry, note, false), DEFAULT_SETTINGS);
  assert.equal(registry.dashesFor(note), null);
  assert.equal(resolvedDash('--', '–', null), '–');
  assert.equal(typographize('He said "hi" -- yes', DEFAULT_SETTINGS), 'He said “hi” – yes');
});

test('a quote resolver changes what a note types, and its marks reach the engine', () => {
  const registry = new ExtensionRegistry();
  registry.registerQuoteResolver((n) => (n.path.startsWith('Buch/') ? GERMAN : null));
  const settings = withResolvedQuotes(DEFAULT_SETTINGS, registry, note, false);
  assert.notEqual(settings.quoteStyle, DEFAULT_SETTINGS.quoteStyle);
  assert.equal(typographize('Er sagte "Hallo".', settings), 'Er sagte „Hallo“.');
  // A note the resolver has no answer for is untouched.
  assert.equal(withResolvedQuotes(DEFAULT_SETTINGS, registry, { path: 'other.md' }, false), DEFAULT_SETTINGS);
});

test('a note’s own typography-quotes property wins over a resolver', () => {
  const registry = new ExtensionRegistry();
  registry.registerQuoteResolver(() => GERMAN);
  const base = settingsForNote({ path: note.path, quotes: 'french' }, DEFAULT_SETTINGS);
  const settings = withResolvedQuotes(base, registry, note, true);
  assert.equal(settings, base);
  assert.equal(typographize('Il dit "oui".', settings), 'Il dit « oui ».');
});

test('the newest resolver with an answer wins; disposing one brings the older back', () => {
  const registry = new ExtensionRegistry();
  const french = { doubleOpen: '«', doubleClose: '»', singleOpen: '‹', singleClose: '›', padding: '' };
  registry.registerQuoteResolver(() => GERMAN);
  const dispose = registry.registerQuoteResolver(() => french);
  assert.equal(typographize('"a"', withResolvedQuotes(DEFAULT_SETTINGS, registry, note, false)), '«a»');
  dispose();
  dispose(); // twice is harmless
  assert.equal(typographize('"a"', withResolvedQuotes(DEFAULT_SETTINGS, registry, note, false)), '„a“');
});

test('a resolver that throws or answers badly is skipped', () => {
  const registry = new ExtensionRegistry();
  registry.registerQuoteResolver(() => GERMAN);
  registry.registerQuoteResolver(() => {
    throw new Error('boom');
  });
  registry.registerQuoteResolver(() => ({ doubleOpen: '', doubleClose: '”', singleOpen: '‘', singleClose: '’', padding: '' }));
  registry.registerQuoteResolver(() => ({ doubleOpen: 'toolong', doubleClose: '”', singleOpen: '‘', singleClose: '’', padding: '' }));
  registry.registerQuoteResolver(() => 'german' as never);
  assert.equal(typographize('"a"', withResolvedQuotes(DEFAULT_SETTINGS, registry, note, false)), '„a“');
});

test('a dash resolver swaps the characters of -- and --- only', () => {
  const registry = new ExtensionRegistry();
  registry.registerDashResolver((n) => (n.path.startsWith('Buch/') ? { en: '—', em: '—' } : null));
  const marks = registry.dashesFor(note);
  assert.equal(resolvedDash('--', '–', marks), '—');
  assert.equal(resolvedDash('---', '—', marks), '—');
  assert.equal(resolvedDash('...', '…', marks), '…');
  assert.equal(registry.dashesFor({ path: 'other.md' }), null);
  registry.registerDashResolver(() => ({ en: '', em: '—' }));
  assert.deepEqual(registry.dashesFor(note), { en: '—', em: '—' }, 'an invalid answer falls through to the older resolver');
});
