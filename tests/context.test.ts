import assert from 'node:assert/strict';
import test from 'node:test';

import { protectedRegionAt } from '../src/context.ts';

/** `protectedRegionAt` is given the document up to the cursor. */
const at = (before: string) => protectedRegionAt(before);

test('prose is not protected', () => {
  assert.equal(at('Just some words '), null);
  assert.equal(at(''), null);
});

// ── Block level ──────────────────────────────────────────────────────────

test('a fenced code block is protected', () => {
  assert.equal(at('```js\nconst a = '), 'code-block');
  assert.equal(at('~~~\nplain '), 'code-block');
});

test('an indented fence still opens a block', () => {
  assert.equal(at('- item\n  ```\n  code '), 'code-block');
});

test('a closed fence stops protecting', () => {
  assert.equal(at('```\ncode\n```\nback to prose '), null);
});

test('a closing fence has to match the one that opened', () => {
  // A `~~~` inside a ``` block is content, not the end of the block.
  assert.equal(at('```\n~~~\nstill code '), 'code-block');
});

test('a fence with an info string does not close a block', () => {
  assert.equal(at('```\ncode\n```js\nstill code '), 'code-block');
});

test('frontmatter is protected, and only at the top of the note', () => {
  assert.equal(at('---\ntitle: '), 'frontmatter');
  assert.equal(at('---\ntitle: x\n---\n\nProse '), null);
  // The same three hyphens further down are a horizontal rule.
  assert.equal(at('Prose\n\n---\nMore '), null);
});

test('a $$ block is protected', () => {
  assert.equal(at('$$\nx = '), 'math-block');
  assert.equal(at('$$\nx = 1\n$$\n\nProse '), null);
});

// ── Inline ───────────────────────────────────────────────────────────────

test('inline code is protected while it is still open', () => {
  assert.equal(at('run `npm '), 'inline-code');
});

test('inline code stops protecting once it closes', () => {
  assert.equal(at('run `npm test` and '), null);
});

test('a double backtick span needs a double backtick to close', () => {
  assert.equal(at('``a ` b '), 'inline-code');
  assert.equal(at('``a ` b`` then '), null);
});

test('a wikilink is protected', () => {
  assert.equal(at('see [[John'), 'wikilink');
  assert.equal(at('see [[John]] and '), null);
});

test('a link target is protected but its label is not', () => {
  assert.equal(at('[the '), null);
  assert.equal(at('[label](./a'), 'link-target');
  assert.equal(at('[label](./a.md) and '), null);
});

test('a Templater expression is protected', () => {
  assert.equal(at('<% tp.file.title '), 'template');
  assert.equal(at('<% tp.file.title %> and '), null);
});

test('an HTML comment is protected', () => {
  assert.equal(at('<!-- note '), 'html-comment');
  assert.equal(at('<!-- note --> and '), null);
});

test('a Templater block spanning several lines is protected to its end', () => {
  assert.equal(at('<%*\nconst name = '), 'template');
  assert.equal(at('<%*\nconst a = 1;\ntR += '), 'template');
  assert.equal(at('<%*\nconst a = 1;\n%>\nProse '), null);
  // It closes partway along the cursor's line.
  assert.equal(at('<%*\nconst a = 1; %> and '), null);
});

test('an HTML comment spanning several lines is protected to its end', () => {
  assert.equal(at('<!--\na draft '), 'html-comment');
  assert.equal(at('<!--\na draft\n-->\nProse '), null);
});

test('a Templater tag written about in inline code opens nothing', () => {
  assert.equal(at('Type `<%` to start a tag.\nProse '), null);
});

test('a Templater tag inside a code block opens nothing', () => {
  assert.equal(at('```\n<%*\n```\nProse '), null);
});

test('a bare URL is protected', () => {
  assert.equal(at('see https://example.com/a'), 'url');
  assert.equal(at('see https://example.com/a and '), null);
});

test('inline maths is protected', () => {
  assert.equal(at('the bound $x '), 'math');
  assert.equal(at('the bound $x$ is '), null);
});

test('a price is not read as an unclosed formula', () => {
  // A lone `$` before a digit or a space is money. Reading it as maths
  // would switch substitution off for the rest of the line.
  assert.equal(at('it costs $5 and '), null);
  assert.equal(at('it costs $ '), null);
  // A formula that opens on a digit still parses once it is closed.
  assert.equal(at('$2x$ and '), null);
});

test('protection is per line, so an unclosed span ends at the newline', () => {
  assert.equal(at('a `code\nnext line '), null);
});
