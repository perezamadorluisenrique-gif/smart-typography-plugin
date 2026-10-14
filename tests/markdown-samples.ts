/**
 * Markdown for property tests: hand-written notes that use the syntax the
 * Obsidian help vault uses (front matter, callouts with code inside, tables,
 * maths, embeds, footnotes, comments, nested tasks), plus a seeded generator
 * of random notes built from the same pieces, and a reader of the parts of
 * a note a text edit must never touch. The generator is seeded so that a
 * failing property names a note that can be rebuilt exactly.
 */

export const SAMPLES: Record<string, string> = {
  'front matter and headings': [
    '---',
    'title: "Links -- and quotes"',
    'aliases: [It\'s, "Notes..."]',
    'tags:',
    '  - help',
    'cssclasses: wide-page',
    '---',
    '# Internal links',
    '',
    'Obsidian supports two link formats: [[Wikilinks]] and [Markdown links](Internal%20links.md).',
    "It's the same note -- either way... -> see [[#Link to a heading]] and [[Note#^block-id|an alias]].",
    '',
    '## Link to a heading',
    '',
    'Use `[[Note#Heading]]` to link to a heading, or `[[##heading]]` to search the vault.',
    '',
    '### Link to a block ^abc123',
    '',
    'A block is a paragraph. Add a block ID such as `^quote-of-the-day` at the end.',
  ].join('\n'),

  'callouts with code': [
    '> [!note] "Title" -- with quotes',
    '> Lorem ipsum... it\'s a callout.',
    '>',
    '> ```css',
    "> .callout[data-callout=\"custom\"] { --callout-icon: '<svg>...</svg>'; }",
    '> ```',
    '',
    '> [!tip]- Foldable',
    '> > [!warning] Nested "callout"',
    '> > Text -> more text.',
    '',
    '> [!example]',
    '> | Column "A" | Column B |',
    '> | --- | :-: |',
    "> | it's | 1 -- 2 |",
  ].join('\n'),

  'code, maths and comments': [
    'Inline `code -- "here"` and ``a ` tick`` stay as they are, and so does `$$`.',
    '',
    '```dataview',
    'TABLE file.mtime AS "Modified" FROM "Projects" WHERE status != "done"',
    '```',
    '',
    '~~~mermaid',
    'graph TD',
    '  A["Start"] --> B{Is it?}',
    '~~~',
    '',
    '$$',
    '\\begin{vmatrix}a & b\\\\ c & d \\end{vmatrix} = ad - bc',
    '$$',
    '',
    'Inline maths $e^{2i\\pi} = 1$ and a price of $5 -- or $6.',
    '',
    '%% An Obsidian comment -- "hidden" %%',
    '<!-- An HTML comment -- "also hidden" -->',
    '<% tp.date.now("YYYY-MM-DD") %>',
    '<span style="color: red">"red"</span>',
    '',
    '    indented code -- "block"',
  ].join('\n'),

  'lists and tasks': [
    '- [ ] Buy milk -- today',
    '  - [x] Sub-task "done"',
    '  - [ ] Sub-task #tag',
    '    1. First',
    '    2. Second...',
    '- [/] In progress',
    '- [-] Cancelled',
    '* Star item',
    '+ Plus item',
    '1) Paren item',
    '',
    '- item with code',
    '  ```js',
    '  const a = "b" -- 1;',
    '  ```',
    '- last',
  ].join('\n'),

  'tables and embeds': [
    '| First name | Last name |',
    '| ---------- | --------- |',
    '| Max | Planck |',
    '| Marie | Curie -- "Skłodowska" |',
    '',
    'Escaped pipe in a link: | [[Note\\|Alias]] | `a | b` |',
    '',
    '![[Engelbart.jpg|100x145]]',
    '![Engelbart|100](https://history-computer.com/ModernComputer/Basis/images/Engelbart.jpg)',
    '![[Document.pdf#page=3]]',
    'https://obsidian.md/help?q="x"--y and <https://example.com/a--b>',
    '',
    'Footnote reference[^1] and inline^[an inline footnote -- "x"].',
    '',
    '[^1]: The footnote text... with it\'s apostrophe.',
    '',
    '***',
    '___',
    '- - -',
  ].join('\n'),

  'other scripts and line endings': [
    '# Überschrift „Zitat“',
    '日本語のテキスト -- と "引用"',
    'Ελληνικά ... και עברית',
    'emoji 😀 -> 👍🏽 and a zero​width space',
    'tab\tseparated\tvalues',
    'line with CRLF\r',
    'trailing spaces   ',
    '',
    '',
  ].join('\n'),
};

/** Pieces that every generated line is built from. */
const PIECES = [
  'plain words ', "it's ", '"quoted" ', "'single' ", '-- ', '--- ', '... ', '-> ', '<- ', '=> ', '>= ', '!= ', '+- ',
  '`code -- "x"` ', '``a ` b`` ', '$x -- y$ ', '$5 and $6 ', '[[Note -- "x"]] ', '![[img.png|300]] ', '[[Note#Heading|alias]] ',
  '[label "x"](https://e.com/a--b) ', 'https://e.com/a--b?c="d" ', '<span style="c">x</span> ', '<!-- "c" -- -->',
  '<% tp.date.now("YYYY") %> ', '%% comment %% ', '**bold** ', '*em* ', '_u_ ', '==mark== ', '~~del~~ ', '#tag ', '^block-id ',
  '[^1] ', 'Ünïcödé ', '😀 ', '中文 ', '\\"escaped\\" ', '&amp; ', 'UPPER lower ', 'camelCase ', '42 ', '3.14 ', '', ' ', '\t',
  '| a | b |', '|---|--:|', 'Use `$$` for maths ',
];

/** Lines that only mean something on their own. */
const LINES = [
  '```', '```js', '~~~', '$$', '> ```', '> ```css', '  ```', '---', '***', '', '> ', '%%', 'A paragraph ^block-id',
  '- [ ] task', '- [x] done', '  - [ ] nested', '# Heading', '## 1. Numbered', '> [!note] Title', '| --- | --- |',
];

/** What a generated line may start with. */
const PREFIXES = ['> ', '>> ', '- ', '  - ', '\t- ', '1. ', '- [ ] ', '> - ', '    ', '# ', '### '];

/** A small seeded generator (xorshift32): the same seed, the same numbers. */
export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

export function pick<T>(random: () => number, items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}

/** A random note from `seed`, at most `maxLines` lines long. */
export function randomNote(seed: number, maxLines = 12): string {
  const random = rng(seed);
  const out: string[] = [];
  if (random() < 0.3) out.push('---', 'title: "A -- B\'s"', 'tags: [x, "y"]', '---');
  const lines = 1 + Math.floor(random() * maxLines);
  for (let i = 0; i < lines; i++) {
    if (random() < 0.15) {
      out.push(pick(random, LINES));
      continue;
    }
    let line = random() < 0.3 ? pick(random, PREFIXES) : '';
    const pieces = 1 + Math.floor(random() * 4);
    for (let j = 0; j < pieces; j++) line += pick(random, PIECES);
    out.push(line);
  }
  return out.join(random() < 0.1 ? '\r\n' : '\n');
}

/**
 * The parts of a note an edit to its prose must leave alone, in order:
 * front matter, fenced code (also inside quotes and lists), `$$` blocks,
 * inline code and maths, wikilinks and embeds, link targets, HTML
 * comments and tags, and bare URLs. A deliberately plain reading of
 * Markdown, independent of the code under test.
 */
export function protectedPieces(text: string): string[] {
  const pieces: string[] = [];
  const lines = text.split('\n');
  let i = 0;
  if (lines[0] === '---') {
    const close = lines.indexOf('---', 1);
    if (close !== -1) {
      pieces.push(lines.slice(0, close + 1).join('\n'));
      i = close + 1;
    }
  }
  let fence: string | null = null;
  let fenceDepth = 0;
  let fenceInList = false;
  let block: string[] = [];
  let maths = false;
  let span: string | null = null;
  for (; i < lines.length; i++) {
    const line = lines[i];
    // An HTML comment or a Templater block left open on an earlier line.
    if (span !== null) {
      const end = line.indexOf(span);
      if (end === -1) {
        block.push(line);
        continue;
      }
      block.push(line.slice(0, end + span.length));
      pieces.push(block.join('\n'));
      const rest = line.slice(end + span.length);
      span = null;
      const open = inlinePieces(rest, pieces);
      if (open !== null) [span, block] = [open.closer, [open.text]];
      continue;
    }
    const depth = (/^(?:[ \t]*>[ \t]?)*/.exec(line)?.[0].match(/>/g) ?? []).length;
    const body = line.replace(/^(?:[ \t]*>[ \t]?)*/, '').replace(/^[ \t]*(?:[-*+]|\d+[.)])[ \t]+/, '');
    const fenceMatch = /^[ \t]*(`{3,}|~{3,})(.*)$/.exec(body);
    // A fence that opened a list item (`- ````) ends with the item: at the
    // first line that is not indented under it.
    const leftList = fenceInList && line.trim() !== '' && !/^[ \t]/.test(line.replace(/^(?:[ \t]*>[ \t]?)*/, ''));
    if (fence !== null && (depth < fenceDepth || leftList)) {
      pieces.push(block.join('\n'));
      fence = null;
    }
    if (fence !== null) {
      block.push(line);
      if (fenceMatch && depth === fenceDepth && fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length && fenceMatch[2].trim() === '') {
        pieces.push(block.join('\n'));
        fence = null;
      }
      continue;
    }
    if (fenceMatch && !(fenceMatch[1][0] === '`' && fenceMatch[2].includes('`'))) {
      fence = fenceMatch[1];
      fenceDepth = depth;
      fenceInList = /^(?:[ \t]*>[ \t]?)*[ \t]*(?:[-*+]|\d+[.)])[ \t]+/.test(line);
      block = [line];
      continue;
    }
    if (maths) {
      block.push(line);
      if (body.trim() === '$$') {
        pieces.push(block.join('\n'));
        maths = false;
      }
      continue;
    }
    // A `$$` that nothing closes is a pair of dollar signs, not maths.
    if (body.trim() === '$$' && lines.slice(i + 1).some((l) => l.replace(/^(?:[ \t]*>[ \t]?)*/, '').trim() === '$$')) {
      maths = true;
      block = [line];
      continue;
    }
    const open = inlinePieces(line, pieces);
    if (open !== null) [span, block] = [open.closer, [open.text]];
  }
  if (fence !== null || maths || span !== null) pieces.push(block.join('\n'));
  return pieces;
}

const INLINE = [
  /^\$\$[^$]+\$\$/,
  /^\$(?=[^\s$])[^$`]*[^\s$\\`]\$(?!\d)/,
  /^\$[^\s$]\$/,
  /^!?\[\[[^\]]*\]\]/,
  /^\]\([^)]*\)/,
  /^<\/?[A-Za-z][^<>]*>/,
  /^https?:\/\/[^\s<>)\]]+/,
];

/**
 * Adds the protected pieces of one line. Returns the comment or Templater
 * block still open at its end, which carries on to the next lines.
 */
function inlinePieces(line: string, pieces: string[]): { closer: string; text: string } | null {
  let i = 0;
  outer: while (i < line.length) {
    for (const [opener, closer] of [['<!--', '-->'], ['<%', '%>']]) {
      if (!line.startsWith(opener, i)) continue;
      const end = line.indexOf(closer, i + opener.length);
      // Left open, it runs on to later lines only when it starts the line,
      // as an HTML block does; otherwise it ends with the paragraph, which
      // is more than this reader tracks, so only the rest of the line counts.
      if (end === -1 && /^ {0,3}$/.test(line.slice(0, i))) return { closer, text: line.slice(i) };
      if (end === -1) {
        pieces.push(line.slice(i));
        return null;
      }
      pieces.push(line.slice(i, end + closer.length));
      i = end + closer.length;
      continue outer;
    }
    if (line[i] === '`') {
      const run = /^`+/.exec(line.slice(i))?.[0] ?? '`';
      const end = line.indexOf(run, i + run.length);
      if (end !== -1) pieces.push(line.slice(i, end + run.length));
      i = end === -1 ? i + run.length : end + run.length;
      continue;
    }
    for (const pattern of INLINE) {
      const m = pattern.exec(line.slice(i));
      if (m) {
        pieces.push(m[0]);
        i += m[0].length;
        continue outer;
      }
    }
    i++;
  }
  return null;
}
