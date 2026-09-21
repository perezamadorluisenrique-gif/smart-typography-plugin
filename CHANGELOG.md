# Changelog

The release workflow uses the section named after the version being released
as the release description, so every version needs one. `npm version <x.y.z>`
renames the `Unreleased` heading below to that version.

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
