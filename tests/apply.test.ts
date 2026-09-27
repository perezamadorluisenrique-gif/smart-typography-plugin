import assert from 'node:assert/strict';
import test from 'node:test';

import { changesBetween, typographize } from '../src/apply.ts';
import { DEFAULT_SETTINGS } from '../src/settings.ts';

const t = (text: string, before = '') => typographize(text, DEFAULT_SETTINGS, before);

test('prose comes out as if it had been typed', () => {
  assert.equal(t(`"It's done," she said -- and left... -> home`), '“It’s done,” she said – and left… → home');
  assert.equal(t('a --- b'), 'a — b');
  assert.equal(t(`'quoted' and "double"`), '‘quoted’ and “double”');
});

test('code, math, links and front matter are left alone', () => {
  const note = [
    '---',
    'title: "A -- B"',
    '---',
    'Text "here".',
    '```js',
    'const a = "x" -> y;',
    '```',
    'Inline `a -- "b"` and $x >= 1$ and [[Note -- "x"]].',
    '[link](https://e.com/a--b) <span style="c">"x"</span>',
  ].join('\n');
  const out = t(note);
  const lines = out.split('\n');
  assert.equal(lines[1], 'title: "A -- B"');
  assert.equal(lines[3], 'Text “here”.');
  assert.equal(lines[5], 'const a = "x" -> y;');
  assert.equal(lines[7], 'Inline `a -- "b"` and $x >= 1$ and [[Note -- "x"]].');
  assert.equal(lines[8], '[link](https://e.com/a--b) <span style="c">“x”</span>');
});

test('markdown structure survives', () => {
  const note = '| a | b |\n|---|--:|\n| 1 | 2 |\n\n---\n\n- item\n-- not a list';
  const out = t(note);
  assert.ok(out.startsWith('| a | b |\n|---|--:|\n| 1 | 2 |\n\n---\n\n- item\n'), out);
});

test('text already typeset is unchanged', () => {
  const done = '“It’s done,” she said – and left… → home';
  assert.equal(t(done), done);
});

test('a selection inside code stays as it is', () => {
  assert.equal(t('"a" -- b', '```\n'), '"a" -- b');
  assert.equal(t('"a" -- b', 'x `'), '"a" -- b');
});

test('a selection starting mid-sentence closes quotes by context', () => {
  assert.equal(t('" he said', 'word'), '” he said');
});

test('a rule never reaches back before the selection', () => {
  assert.equal(t('- b', 'a -'), '- b');
});

test('settings that are off stay off', () => {
  assert.equal(typographize('a -- b "c"', { ...DEFAULT_SETTINGS, dashes: false, quoteStyle: 'off' }), 'a -- b "c"');
});

test('changes are per line and minimal', () => {
  assert.deepEqual(changesBetween('ab\n"c"\nd', 'ab\n“c”\nd'), [{ from: 3, to: 6, insert: '“c”' }]);
  assert.deepEqual(changesBetween('a--b', 'a–b', 10), [{ from: 11, to: 13, insert: '–' }]);
  assert.deepEqual(changesBetween('same', 'same'), []);
});
