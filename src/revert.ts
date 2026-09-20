/**
 * Taking a substitution back.
 *
 * Backspace straight after a substitution restores the characters that
 * were typed, so an em dash goes back to `---` rather than vanishing.
 * That escape hatch is what makes the aggressive rules safe: nobody has to
 * go to settings to type three hyphens once.
 *
 * The original plugin has the same idea and a bug in it: it reverts on any
 * Backspace, including one pressed after the cursor has moved somewhere
 * else, which silently rewrites text elsewhere in the note
 * (mgmeyers/obsidian-smart-typography#58). Both guards below exist to stop
 * that, and the plugin drops the record on any transaction that is not the
 * substitution itself, so a cursor move alone already clears it.
 */

export interface LastSubstitution {
  /** Where the inserted text starts. */
  from: number;
  /** Where it ends, which is where the cursor was left. */
  to: number;
  /** The text the plugin inserted. */
  inserted: string;
  /** The text the user typed, restored by Backspace. */
  literal: string;
}

export interface Revert {
  from: number;
  to: number;
  insert: string;
}

/**
 * The change Backspace should make instead of deleting a character, or
 * null to let Backspace do its usual job.
 */
export function revertFor(
  last: LastSubstitution | null,
  doc: string,
  selectionFrom: number,
  selectionTo: number,
): Revert | null {
  if (last === null) return null;

  // A selection: Backspace deletes it, and reverting instead would throw
  // the selected text away.
  if (selectionFrom !== selectionTo) return null;

  // The cursor has to be exactly where the substitution left it.
  if (selectionFrom !== last.to) return null;

  // And the text has to still be the text that was inserted. Anything else
  // means an edit landed in between and the record is stale.
  if (doc.slice(last.from, last.to) !== last.inserted) return null;

  if (last.inserted === last.literal) return null;

  return { from: last.from, to: last.to, insert: last.literal };
}
