import assert from 'node:assert/strict';
import test from 'node:test';

import { startsSentence, urlStart } from '../src/capitalize.ts';
import { substitutionFor } from '../src/substitute.ts';
import { DEFAULT_SETTINGS } from '../src/settings.ts';

const on = { ...DEFAULT_SETTINGS, capitalizeSentences: true };

/** The text after typing one letter, or the same text if nothing happens. */
function typeLetter(before: string, letter = 'x', after = '', settings = on): string {
  const a = substitutionFor(before, after, letter, settings);
  if (a === null || a.kind !== 'replace') return before + letter;
  return before.slice(0, a.from) + a.insert;
}

test('starts a sentence: line start, markers, after . ! ?', () => {
  for (const line of [
    '', '- ', '* ', '+ ', '1. ', '12) ', '- [ ] ', '- [x] ', '> ', '> > ', '# ', '### ', '  - ', '> - [ ] ',
    'Hello there. ', 'Really? ', 'Stop! ', 'He said "go." ', '(Done.) ', 'It ended.” ', 'Done.** ', 'Yes. “', 'Yes. (', '"',
    'The U.S. is big. ', 'Mr. Smith left. ', 'I paid 5 euros. ',
  ]) {
    assert.equal(startsSentence(line), true, JSON.stringify(line));
  }
});

test('does not start a sentence', () => {
  for (const line of [
    'hello ', 'hello', 'a, ', 'Hello, ', '    ', '\t', '    code ', '| ', '[[', '#', '@', 'a.b ', '3.5 ', 'see https://x.com ',
    'e.g. ', 'i.e. ', 'etc. ', 'vs. ', 'Mr. ', 'Dr. ', 'Mrs. ', 'No. ', 'J. ', 'J.R. ', 'U.S. ', 'item 3. ', 'v1.5. ',
    'wait... ', 'wait.. ', '. ', ' ? ', 'a.md. ', 'foo/bar. ', 'name@site.com. ', 'Hello.world ', 'Et al. ',
  ]) {
    assert.equal(startsSentence(line), false, JSON.stringify(line));
  }
});

test('"no." counts as an abbreviation only with a capital', () => {
  assert.equal(startsSentence('I said no. '), true);
  assert.equal(startsSentence('See No. '), false);
});

test('capitalises a typed lowercase letter at the start of a sentence', () => {
  assert.equal(typeLetter(''), 'X');
  assert.equal(typeLetter('Hi there. '), 'Hi there. X');
  assert.equal(typeLetter('- [ ] '), '- [ ] X');
  assert.equal(typeLetter('> '), '> X');
  assert.equal(typeLetter('## '), '## X');
  assert.equal(typeLetter('Done.\n'), 'Done.\nX');
  assert.equal(typeLetter('He said “Go.” '), 'He said “Go.” X');
  assert.equal(typeLetter('Yes! “'), 'Yes! “X');
  assert.equal(typeLetter('', 'é'), 'É');
});

test('leaves the letter alone mid-sentence, after abbreviations and numbers', () => {
  for (const before of ['Hello ', 'a, ', 'Hello, ', 'e.g. ', 'Mr. ', 'J. ', 'etc. ', '3.5 ', 'item 3. ', 'wait... ']) {
    assert.equal(typeLetter(before), before + 'x', before);
  }
});

test('never inside code, math, links, front matter, tags or addresses', () => {
  for (const before of [
    '`', '```\n', '---\ntitle: a\n', '$', '$$\n', '[[', '[x](', '<span ', '<%', '`code. ', '#', 'https://a.b. ', '$a. ',
  ]) {
    assert.equal(typeLetter(before), before + 'x', JSON.stringify(before));
  }
  assert.equal(typeLetter('```\n', 'x'), '```\nx');
  assert.equal(typeLetter('    '), '    x');
  assert.equal(typeLetter('foo`bar. '), 'foo`bar. x');
});

test('not in the middle of a word, not an uppercase letter, not with the option off', () => {
  assert.equal(typeLetter('', 'x', 'yz'), 'x');
  assert.equal(typeLetter('Hi. ', 'x', 'yz'), 'Hi. x');
  assert.equal(typeLetter('', 'X'), 'X');
  assert.equal(typeLetter('', '1'), '1');
  assert.equal(typeLetter('', 'ß'), 'ß');
  assert.equal(typeLetter('', 'x', '', DEFAULT_SETTINGS), 'x');
});

test('a custom rule wins over the capital', () => {
  const s = { ...on, customRules: 'x -> ✗'.replace('x', 'qq') };
  assert.equal(typeLetter('q', 'q', '', s), '✗');
});

test('the action records what Backspace restores', () => {
  const a = substitutionFor('Hi. ', '', 'x', on);
  assert.ok(a && a.kind === 'replace');
  assert.equal(a.insert, 'X');
  assert.equal(a.literal, 'x');
  assert.equal(a.rule, 'capitalize');
});

test('an address typed at the start of a sentence is put back in lowercase', () => {
  assert.equal(urlStart('Https:'), 0);
  assert.equal(urlStart('Go. Http:'), 4);
  assert.equal(urlStart('see Https:'), null);
  let doc = '';
  for (const c of 'https://x.org') doc = typeLetter(doc, c);
  assert.equal(doc, 'Https://x.org'.replace('H', 'h'));
});
