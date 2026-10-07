import assert from 'node:assert/strict';
import test from 'node:test';

import { STYLE_PRESETS, applyStylePreset, shouldPromptForPreset } from '../src/presets.ts';
import { DEFAULT_SETTINGS } from '../src/settings.ts';

const preset = (id: string) => STYLE_PRESETS.find((p) => p.id === id)!;

test('four presets, the default one equal to the shipped defaults', () => {
  assert.deepEqual(STYLE_PRESETS.map((p) => p.id), ['default', 'writer', 'academic', 'developer']);
  assert.deepEqual(applyStylePreset(DEFAULT_SETTINGS, preset('default')), DEFAULT_SETTINGS);
});

test('presets set the switches and leave folders, rules and quote style alone', () => {
  const mine = { ...DEFAULT_SETTINGS, excludedFolders: 'Code', customRules: '(c) -> ©', quoteStyle: 'german' as const };
  const writer = applyStylePreset(mine, preset('writer'));
  assert.equal(writer.capitalizeSentences, true);
  assert.equal(writer.arrows, false);
  assert.equal(writer.quoteStyle, 'german');
  assert.equal(writer.excludedFolders, 'Code');
  assert.equal(writer.customRules, '(c) -> ©');
  const dev = applyStylePreset(mine, preset('developer'));
  assert.equal(dev.quoteStyle, 'off');
  assert.equal(dev.dashes, false);
  assert.equal(dev.capitalizeSentences, false);
  assert.equal(dev.customRules, '(c) -> ©');
  const acad = applyStylePreset(mine, preset('academic'));
  assert.equal(acad.arrows, true);
  assert.equal(acad.capitalizeSentences, true);
});

test('the first-run prompt is for a missing data.json only', () => {
  assert.equal(shouldPromptForPreset(null), true);
  assert.equal(shouldPromptForPreset(undefined), true);
  assert.equal(shouldPromptForPreset({}), false);
  assert.equal(shouldPromptForPreset({ dashes: false }), false);
  assert.equal(shouldPromptForPreset({ quoteStyle: 'english', customRules: '' }), false);
  assert.equal(shouldPromptForPreset({ presetPrompted: true }), false);
});

test('defaults: capital off, tab-out and wrap on', () => {
  assert.equal(DEFAULT_SETTINGS.capitalizeSentences, false);
  assert.equal(DEFAULT_SETTINGS.tabOut, true);
  assert.equal(DEFAULT_SETTINGS.wrapSelection, true);
});
