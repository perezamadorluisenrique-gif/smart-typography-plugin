/**
 * Which notes the substitutions stay out of altogether: notes in an excluded
 * folder, and notes whose `typography` property is `off`.
 */

/** The property a note sets to `off` to be left alone. */
export const NOTE_PROPERTY = 'typography';

/** The folders in the setting: one per line, without leading or trailing slashes. */
export function folderList(setting: string): string[] {
  return setting
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^\/+|\/+$/g, ''))
    .filter((line) => line !== '');
}

/** Whether the note at `path` is inside one of `folders`, at any depth. */
export function inFolder(path: string, folders: string[]): boolean {
  return folders.some((folder) => path === folder || path.startsWith(folder + '/'));
}

/** Whether a `typography` property value means "leave this note alone". */
export function isOff(value: unknown): boolean {
  if (value === false) return true;
  return typeof value === 'string' && /^(off|false|no)$/i.test(value.trim());
}

export interface TextEdit {
  from: number;
  to: number;
  insert: string;
}

const PROPERTY_LINE = new RegExp(`^${NOTE_PROPERTY}[ \\t]*:.*$`);

/**
 * The note's front matter as line offsets: where its first property line
 * starts and where its closing `---` starts. Null when there is none.
 */
function frontMatter(text: string): { bodyFrom: number; closeFrom: number } | null {
  const open = /^---[ \t]*\r?\n/.exec(text);
  if (!open) return null;
  let at = open[0].length;
  while (at <= text.length) {
    const end = text.indexOf('\n', at);
    const line = text.slice(at, end === -1 ? text.length : end).replace(/\r$/, '');
    if (/^(---|\.\.\.)[ \t]*$/.test(line)) return { bodyFrom: open[0].length, closeFrom: at };
    if (end === -1) return null;
    at = end + 1;
  }
  return null;
}

/** Whether the note's own front matter turns substitutions off, read from its text. */
export function noteIsOff(text: string): boolean {
  const fm = frontMatter(text);
  if (!fm) return false;
  for (const line of text.slice(fm.bodyFrom, fm.closeFrom).split(/\r?\n/)) {
    if (PROPERTY_LINE.test(line)) return isOff(line.slice(line.indexOf(':') + 1).replace(/^\s*(["']?)(.*?)\1\s*$/, '$2'));
  }
  return false;
}

/**
 * The edit that turns substitutions off in a note (`off` true) or back on.
 * Off adds `typography: off` to the front matter, creating it if needed; on
 * removes the property, and the front matter too if nothing else is left in
 * it. Null when there is nothing to change.
 */
export function setNoteOff(text: string, off: boolean): TextEdit | null {
  const fm = frontMatter(text);

  if (off) {
    if (!fm) return { from: 0, to: 0, insert: `---\n${NOTE_PROPERTY}: off\n---\n` };
    let at = fm.bodyFrom;
    while (at < fm.closeFrom) {
      const end = text.indexOf('\n', at);
      const line = text.slice(at, end).replace(/\r$/, '');
      if (PROPERTY_LINE.test(line)) {
        return isOff(line.slice(line.indexOf(':') + 1).trim())
          ? null
          : { from: at, to: at + line.length, insert: `${NOTE_PROPERTY}: off` };
      }
      at = end + 1;
    }
    return { from: fm.closeFrom, to: fm.closeFrom, insert: `${NOTE_PROPERTY}: off\n` };
  }

  if (!fm) return null;
  let at = fm.bodyFrom;
  while (at < fm.closeFrom) {
    const end = text.indexOf('\n', at);
    const line = text.slice(at, end).replace(/\r$/, '');
    if (PROPERTY_LINE.test(line)) {
      const others = text.slice(fm.bodyFrom, at) + text.slice(end + 1, fm.closeFrom);
      if (others.trim() === '') {
        const close = text.indexOf('\n', fm.closeFrom);
        return { from: 0, to: close === -1 ? text.length : close + 1, insert: '' };
      }
      return { from: at, to: end + 1, insert: '' };
    }
    at = end + 1;
  }
  return null;
}

/**
 * The edit that sets the front matter property `name` to the plain word
 * `value`, or removes it when `value` is null: the text-edit fallback for
 * apps without `processFrontMatter`. Null when there is nothing to change.
 * `name` and `value` are fixed words of this plugin, never user text.
 */
export function setNoteProperty(text: string, name: string, value: string | null): TextEdit | null {
  const fm = frontMatter(text);
  const wanted = `${name}: ${value}`;
  const own = new RegExp(`^${name}[ \\t]*:.*$`);

  if (value !== null) {
    if (!fm) return { from: 0, to: 0, insert: `---\n${wanted}\n---\n` };
    let at = fm.bodyFrom;
    while (at < fm.closeFrom) {
      const end = text.indexOf('\n', at);
      const line = text.slice(at, end).replace(/\r$/, '');
      if (own.test(line)) return line === wanted ? null : { from: at, to: at + line.length, insert: wanted };
      at = end + 1;
    }
    return { from: fm.closeFrom, to: fm.closeFrom, insert: `${wanted}\n` };
  }

  if (!fm) return null;
  let at = fm.bodyFrom;
  while (at < fm.closeFrom) {
    const end = text.indexOf('\n', at);
    const line = text.slice(at, end).replace(/\r$/, '');
    if (own.test(line)) {
      const others = text.slice(fm.bodyFrom, at) + text.slice(end + 1, fm.closeFrom);
      if (others.trim() === '') {
        const close = text.indexOf('\n', fm.closeFrom);
        return { from: 0, to: close === -1 ? text.length : close + 1, insert: '' };
      }
      return { from: at, to: end + 1, insert: '' };
    }
    at = end + 1;
  }
  return null;
}
