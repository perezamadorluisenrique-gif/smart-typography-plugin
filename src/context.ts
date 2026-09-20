/**
 * Where substitution must keep its hands off.
 *
 * This is the part the original plugin does not have, and most of its bug
 * reports come back to it: curly quotes landing inside Dataview queries
 * (mgmeyers/obsidian-smart-typography#46), inside Templater expressions
 * (#39) and inside link targets (#62). A plugin that rewrites what you
 * type has to know when the thing you are typing is code.
 *
 * The scan is a plain pass over the document text up to the cursor, with
 * no CodeMirror syntax tree involved, so every rule here is unit tested.
 */

export type Region =
  | 'frontmatter'
  | 'code-block'
  | 'math-block'
  | 'inline-code'
  | 'math'
  | 'wikilink'
  | 'link-target'
  | 'template'
  | 'html-comment'
  | 'url';

/** A fenced block, ``` or ~~~, possibly indented by up to three spaces. */
const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/;

/** A bare URL, up to the first whitespace. */
const URL_START = /^<?https?:\/\//;

/**
 * The protected region the cursor sits in, or null when it sits in prose.
 *
 * `text` is the document from its start up to the cursor; the cursor is at
 * `text.length`. Passing only the prefix keeps the caller from copying a
 * whole note on every keystroke, and nothing here needs to look ahead: an
 * unclosed delimiter counts as open to the end of the line, which is the
 * normal state of affairs while someone is still typing.
 */
export function protectedRegionAt(text: string): Region | null {
  const lineStart = text.lastIndexOf('\n') + 1;
  const blockRegion = blockRegionAt(text, lineStart);
  if (blockRegion) return blockRegion;

  return inlineRegionAt(text.slice(lineStart));
}

/**
 * Block-level state at the start of the cursor's line: frontmatter, a
 * fenced code block, or a `$$` math block.
 */
function blockRegionAt(text: string, lineStart: number): Region | null {
  const lines = text.slice(0, lineStart).split('\n');

  let inFrontmatter = lines.length > 0 && lines[0] === '---';
  let fence: string | null = null;
  let inMathBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Frontmatter only counts when it opens on the very first line, and it
    // ends at the next `---` on its own.
    if (inFrontmatter && i > 0 && line === '---') {
      inFrontmatter = false;
      continue;
    }
    if (inFrontmatter) continue;

    const fenceMatch = FENCE.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (fence === null) {
        fence = marker;
        continue;
      }
      // A closing fence uses the same character, is at least as long, and
      // carries no info string.
      if (marker[0] === fence[0] && marker.length >= fence.length && fenceMatch[2].trim() === '') {
        fence = null;
      }
      continue;
    }
    if (fence !== null) continue;

    if (line.trim() === '$$') inMathBlock = !inMathBlock;
  }

  if (inFrontmatter) return 'frontmatter';
  if (fence !== null) return 'code-block';
  if (inMathBlock) return 'math-block';
  return null;
}

/**
 * Inline state at the end of `line`, which runs from the start of the
 * cursor's line up to the cursor.
 *
 * Every span is scanned left to right. A span that closes before the
 * cursor is stepped over; a span still open when the text runs out holds
 * the cursor, which is what happens while the span is being typed.
 */
function inlineRegionAt(line: string): Region | null {
  let i = 0;

  while (i < line.length) {
    if (line.startsWith('<!--', i)) {
      const end = endOf(line, i + 4, '-->');
      if (end === null) return 'html-comment';
      i = end;
      continue;
    }

    if (line.startsWith('<%', i)) {
      const end = endOf(line, i + 2, '%>');
      if (end === null) return 'template';
      i = end;
      continue;
    }

    if (line.startsWith('[[', i)) {
      const end = endOf(line, i + 2, ']]');
      if (end === null) return 'wikilink';
      i = end;
      continue;
    }

    // The destination of a markdown link or image: the `(...)` in
    // `[label](target)`. The label itself is prose and stays unprotected.
    if (line.startsWith('](', i)) {
      const end = endOf(line, i + 2, ')');
      if (end === null) return 'link-target';
      i = end;
      continue;
    }

    if (line[i] === '`') {
      const run = runLength(line, i, '`');
      const end = endOf(line, i + run, '`'.repeat(run));
      if (end === null) return 'inline-code';
      i = end;
      continue;
    }

    if (line[i] === '$') {
      const run = runLength(line, i, '$');
      const end = endOf(line, i + run, '$'.repeat(run));
      if (end !== null) {
        i = end;
        continue;
      }
      // Unterminated, so either a formula being typed or a price.
      if (run === 1 && !opensMath(line, i)) {
        i++;
        continue;
      }
      return 'math';
    }

    if (URL_START.test(line.slice(i))) {
      const rest = line.slice(i);
      const space = rest.search(/\s|>/);
      if (space === -1) return 'url';
      i += space;
      continue;
    }

    i++;
  }

  return null;
}

/**
 * Whether a lone `$` opens inline math rather than naming a price.
 *
 * Prices are far commoner than maths in the kind of note this plugin is
 * for, and a `$` read as an unclosed formula would switch substitution off
 * for the rest of the line. So `$5` and `$ ` are money and `$x` is maths.
 * A formula that really does open on a digit still parses once it closes,
 * because a closed `$...$` span is matched before this ever runs.
 */
function opensMath(line: string, at: number): boolean {
  const next = line[at + 1];
  if (next === undefined) return false;
  return !/[\s\d]/.test(next);
}

/** How many copies of `char` start at `from`. */
function runLength(line: string, from: number, char: string): number {
  let n = 0;
  while (line[from + n] === char) n++;
  return n;
}

/**
 * The index just past the next `closer` at or after `from`, or null when
 * the span never closes on this line.
 */
function endOf(line: string, from: number, closer: string): number | null {
  const at = line.indexOf(closer, from);
  return at === -1 ? null : at + closer.length;
}
