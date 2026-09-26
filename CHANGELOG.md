# Changelog

The release workflow uses the section named after the version being released
as the release description, so every version needs one. `npm version <x.y.z>`
renames the `Unreleased` heading below to that version.

## 0.1.4

- Quotes and apostrophes typed on Android now curl. Keyboards such as Gboard
  compose each word as you type it, apostrophe included, and nothing typed
  inside a composition was ever substituted, so `it's` stayed straight. The
  quotes a composition leaves behind are now curled as soon as it ends,
  which also fixes quotes typed with a dead key on a computer.
- Typing is lighter on long notes. Letters and spaces, nearly every
  keystroke, no longer make the plugin read the note up to the cursor;
  only the characters a rule reacts to do.
- The README explains how the plugin and iOS Smart Punctuation get along.

## 0.1.3

- The delimiter row of a table, `| --- | :-: |`, is no longer turned into
  en and em dashes as you type it. The dashes stopped the table rendering.
- `---` typed on its own line inside a quote or callout stays a horizontal
  rule, as it already did outside one.
- Typing `<!--` no longer turns the two hyphens into an en dash, which left
  a broken HTML comment behind.
- A Templater script or an HTML comment that runs over several lines is now
  protected all the way to its closing `%>` or `-->`. Before, only the line
  it opened on was, so quotes inside a `<%* … %>` script were curled and
  broke the script.

## 0.1.2

- Quotation marks are now curled when Obsidian's "Auto-pair brackets" is on,
  which is the default. Until now auto-pairing claimed every `"` and `'`
  first and inserted a straight pair, so no quotation mark was ever curled
  for most users. Apostrophes, dashes and the other substitutions were not
  affected. Inside code, formulas and link targets, auto-pairing still works
  as before.

## 0.1.1

- Settings are now described with Obsidian 1.13's declarative settings API, so
  they turn up when you search the settings window. The settings themselves,
  and what they do, are unchanged.
- Replaced the `builtin-modules` build dependency with Node's own
  `module.builtinModules`. The plugin itself is unaffected.
- The no-break space in the quote-position pattern is written as an escape
  rather than typed, where it was invisible. It matches the same characters.
- Added linting to the build, and release assets now carry a GitHub build
  provenance attestation.

## 0.1.0

First release.

Substitutes as you type: straight quotes to curly quotes in seven conventions,
apostrophes, `--` and `---` to en and em dashes, `...` to an ellipsis, arrows,
and mathematical symbols. Each can be switched off on its own.

Nothing is substituted inside fenced or inline code, `$…$` formulas,
wikilinks, link destinations, frontmatter, Templater expressions, HTML
comments or bare URLs.

Backspace straight after a substitution puts back the characters you typed,
and only then: any other edit, or moving the cursor, ends the chance to revert.
