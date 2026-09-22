# Typography as You Type

Straight quotes become curly ones, `--` becomes an en dash, `...` becomes an
ellipsis and `->` becomes an arrow, as you type. Nothing is substituted
inside code, formulas or link targets, and Backspace puts back exactly what
you typed.

This is a rebuild rather than a fork. The plugin it replaces,
[mgmeyers/obsidian-smart-typography][original], has about 170,000 downloads
and has had no release since June 2022. Its open issues are the
specification for this one: the notes below say which issue each behaviour
answers.

[original]: https://github.com/mgmeyers/obsidian-smart-typography

## What it substitutes

| You type | You get | Group |
| --- | --- | --- |
| `"` | `“` or `”`, by position | Quotation marks |
| `'` | `‘` or `’`, or an apostrophe | Quotation marks, apostrophes |
| `--` | `–` | Dashes |
| `---` | `—` | Dashes |
| `...` | `…` | Ellipsis |
| `->` `-->` | `→` | Arrows |
| `<-` | `←` | Arrows |
| `<->` | `↔` | Arrows |
| `=>` | `⇒` | Arrows |
| `<==` | `⇐` | Arrows |
| `<=>` | `⇔` | Arrows |
| `>=` | `≥` | Mathematical symbols |
| `<=` | `≤` | Mathematical symbols |
| `!=` `/=` | `≠` | Mathematical symbols |
| `+-` `+/-` | `±` | Mathematical symbols |

Each group has its own switch in settings.

`<=` is the one real collision: it is both "less than or equal" and a
leftwards double arrow. With mathematical symbols on it gives `≤`, and
`<==` still reaches `⇐`. With them off, `<=` gives `⇐`.

## Quotation marks in your language

The convention is a dropdown, not a fixed set of curly quotes: English,
German, French, Spanish, Swedish, Polish and Russian, or off. French adds
the no-break space its typography asks for inside the guillemets. This is
what issues [#47], [#64] and [#51] ask for.

The apostrophe is `’` in every convention, which is a separate switch from
the quotation marks. German is the case that makes the difference visible:
it closes a single quotation with `‘`, but `geht's` still takes `’` ([#70]).

A quotation mark opens or closes depending on what precedes it, and the
start of a note counts as an opening position, so a note that begins with a
quotation gets the opening mark ([#65]).

Typing a closing quote where one already sits steps over it rather than
adding a second one, which is what Obsidian's own auto-pairing leaves
behind ([#56], [#57], [#59]).

[#47]: https://github.com/mgmeyers/obsidian-smart-typography/issues/47
[#51]: https://github.com/mgmeyers/obsidian-smart-typography/issues/51
[#56]: https://github.com/mgmeyers/obsidian-smart-typography/issues/56
[#57]: https://github.com/mgmeyers/obsidian-smart-typography/issues/57
[#59]: https://github.com/mgmeyers/obsidian-smart-typography/issues/59
[#64]: https://github.com/mgmeyers/obsidian-smart-typography/issues/64
[#65]: https://github.com/mgmeyers/obsidian-smart-typography/issues/65
[#70]: https://github.com/mgmeyers/obsidian-smart-typography/issues/70

## Where it keeps out

A curly quote in a query is a syntax error, and this is where most of the
original's bug reports come from. Nothing is substituted inside:

- fenced code blocks, which covers Dataview and every other query language
  written in one ([#46]);
- inline code, which covers inline Dataview;
- `$...$` and `$$...$$` formulas, though a lone `$` before a digit or a
  space is read as money and not as an unclosed formula;
- `[[wikilink]]` targets and the `(target)` of a markdown link ([#62]);
- YAML frontmatter;
- `<% ... %>` Templater expressions ([#39]);
- `<!-- HTML comments -->`, where `--` is usually on its way to `-->`;
- bare URLs.

`---` alone on a line is left alone too: it is a horizontal rule, a setext
underline and the frontmatter fence, and none of those is an em dash.

[#39]: https://github.com/mgmeyers/obsidian-smart-typography/issues/39
[#46]: https://github.com/mgmeyers/obsidian-smart-typography/issues/46
[#62]: https://github.com/mgmeyers/obsidian-smart-typography/issues/62

## Undo, and taking a substitution back

Each substitution is one editor transaction covering both the character you
typed and the replacement, so one undo removes the whole thing rather than
leaving half of it behind.

Backspace pressed straight afterwards restores the characters you typed: an
em dash goes back to `---`, not to `--`. That is the escape hatch that makes
the rules safe to leave on.

It only applies at the cursor position the substitution left, and any other
editor transaction, a bare cursor move included, drops the record. The
original reverts on any Backspace, so moving the cursor and then pressing it
rewrites text somewhere else in the note ([#58]).

[#58]: https://github.com/mgmeyers/obsidian-smart-typography/issues/58

## Input methods and dead keys

Nothing is substituted while an input method or a dead key is composing.
The characters that arrive mid-composition are half-finished and the
browser revises them afterwards, and rewriting them is what produces the
doubled quotes reported on GNOME ([#44], [#63]).

This is the part that cannot be verified outside a real vault. See
"What is not tested" below.

[#44]: https://github.com/mgmeyers/obsidian-smart-typography/issues/44
[#63]: https://github.com/mgmeyers/obsidian-smart-typography/issues/63

## How it is put together

- `main.ts` is the only file that touches Obsidian or CodeMirror. It holds
  the input handler, the Backspace binding, the state field that remembers
  the last substitution, and the settings tab.
- `src/` is pure logic with no imports from either: `context.ts` decides
  what is protected, `rules.ts` is the table of character substitutions,
  `substitute.ts` turns a keystroke into an editor change, `revert.ts`
  decides whether Backspace should put something back, and `settings.ts`
  holds the conventions.
- `tests/` runs under `node --test` with no test framework and no browser.

```
npm install
npm test
npm run build
```

## What is not tested

The 65 tests cover the engine, not the editor. They type through
`substitutionFor` one character at a time, which is how the chained rules
get exercised, but they cannot exercise:

- **composition events**, so the input-method and dead-key fix is reasoned
  rather than demonstrated;
- **undo grouping**, which depends on how CodeMirror's history extension
  treats the transaction;
- **the interaction with Obsidian's own auto-pairing**, which inserts the
  closing quote before this plugin sees anything;
- **other plugins that also handle typing**, Easy Typing among them ([#66]).

All of those need a throwaway vault and a person at the keyboard.

[#66]: https://github.com/mgmeyers/obsidian-smart-typography/issues/66

## What it deliberately does not do

- **Reading-view-only substitution** ([#40], [#67]). That is a different
  plugin: it would render substitutions without changing the note, and
  mixing the two in one settings tab makes both confusing.
- **Restricting substitution to particular folders** ([#41]). Worth doing,
  but it needs the editor to know which file it is showing, which the
  current extension does not.
- **Superscripts and subscripts** ([#69]), and **unit symbols** ([#73]).
  Both are substitutions of a different kind, and `^2` is live markdown in
  too many vaults to convert by default.
- **Right-to-left quotation order** ([#68]), which needs more than a rule
  table.

[#40]: https://github.com/mgmeyers/obsidian-smart-typography/issues/40
[#41]: https://github.com/mgmeyers/obsidian-smart-typography/issues/41
[#67]: https://github.com/mgmeyers/obsidian-smart-typography/issues/67
[#68]: https://github.com/mgmeyers/obsidian-smart-typography/issues/68
[#69]: https://github.com/mgmeyers/obsidian-smart-typography/issues/69
[#73]: https://github.com/mgmeyers/obsidian-smart-typography/issues/73

## Installing

From the community directory: Settings -> Community plugins -> Browse, search
for Typography as You Type, then install and enable it.

To install it by hand instead, download `main.js` and `manifest.json` from
the [latest release][releases] into
`<your vault>/.obsidian/plugins/typography-as-you-type/` and enable the plugin in
Settings -> Community plugins.

[releases]: https://github.com/perezamadorluisenrique-gif/smart-typography-plugin/releases

It needs Obsidian 1.3.5 or newer.

## More plugins by Siulved54

| Plugin | What it does | Source |
| --- | --- | --- |
| [Shared Blocks](https://obsidian.md/plugins?id=shared-blocks) | Write a block of text once and reuse it in any note. Edit the source and every reference re-renders live. | [shared-blocks](https://github.com/perezamadorluisenrique-gif/shared-blocks) |
| [Text Case and Cleanup](https://obsidian.md/plugins?id=text-format) | Change the case of a selection without touching code, URLs or task boxes, and repair prose pasted out of a PDF. | [text-format](https://github.com/perezamadorluisenrique-gif/text-format) |

Both are in the community directory: Settings -> Community plugins -> Browse,
then search for the name.

## Licence

MIT, (c) Siulved54.
