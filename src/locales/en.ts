// The source of the message keys and the fallback language. Every other file in
// this folder must have exactly these keys and the same {placeholders}; the
// build fails on a missing or extra key and `tests/i18n.test.ts` checks the rest.
// What the plugin writes into notes (the quote rules, property names, the
// replacements) is not here and is never translated.
const en = {
  // Commands
  'command.toggleNote': 'Turn substitutions off or on in this note',
  'command.setQuotes': 'Set quotation marks for this note…',
  'command.applyToText': 'Apply typography to the selection or the whole note',

  // Notices
  'notice.substitutionsOff': 'Typography: substitutions are off in this note.',
  'notice.substitutionsOn': 'Typography: substitutions are on in this note.',
  'notice.removedButExcluded':
    'Typography: removed the property, but this note is in an excluded folder, so substitutions stay off.',
  'notice.nothingToChange': 'Typography: nothing to change.',
  'notice.changedLines.one': 'Typography: changed 1 line.',
  'notice.changedLines.other': 'Typography: changed {count} lines.',
  'notice.quotesFollowFolder': 'Typography: this note follows your folder and global quotation marks again.',
  'notice.quotesSet': 'Typography: quotation marks in this note are now {style}.',
  'notice.quotesStraight': 'Typography: quotation marks in this note are now straight.',
  'notice.presetApplied': 'Typography: {preset} preset applied.',
  'notice.presetRulesPresent': 'Typography: those rules are already in your list.',
  'notice.rulesAdded.one': 'Typography: added 1 rule.',
  'notice.rulesAdded.other': 'Typography: added {count} rules.',

  // Quotation mark conventions (the sample characters stay as they are)
  'convention.english': 'English “ ” ‘ ’',
  'convention.german': 'German „ “ ‚ ‘',
  'convention.french': 'French « » ‹ ›',
  'convention.spanish': 'Spanish « » “ ”',
  'convention.swedish': 'Swedish ” ” ’ ’',
  'convention.polish': 'Polish „ ” ‚ ’',
  'convention.russian': 'Russian « » „ “',
  'convention.off': 'Leave straight quotes alone',

  // Style presets
  'stylePreset.default.label': 'Default',
  'stylePreset.default.desc': 'Curly quotes, dashes, ellipsis, arrows and symbols. No automatic capitals.',
  'stylePreset.writer.label': 'Writer',
  'stylePreset.writer.desc':
    'Prose: curly quotes, dashes, ellipsis and a capital at the start of each sentence. No arrows or math symbols.',
  'stylePreset.academic.label': 'Academic',
  'stylePreset.academic.desc': 'Everything on, including arrows and math symbols, plus automatic capitals.',
  'stylePreset.developer.label': 'Developer (quiet)',
  'stylePreset.developer.desc':
    'Straight quotes and plain hyphens stay as typed. Only arrows and math symbols are converted.',

  // Rule presets
  'rulePreset.guillemets': 'Guillemets << >>',
  'rulePreset.symbols': 'Symbols (c) (r) (tm)',

  // Settings
  'setting.quoteStyle.name': 'Quotation marks',
  'setting.quoteStyle.desc':
    'Which convention straight quotes are turned into. Apostrophes are the same character in every convention and are set separately.',
  'setting.smartApostrophes.name': 'Apostrophes',
  'setting.smartApostrophes.desc': "Turns it's into it’s. Works whether or not quotation marks are set.",
  'setting.skipClosingQuote.name': 'Step over a closing quote',
  'setting.skipClosingQuote.desc':
    'Typing a closing quote where one already sits steps over it instead of adding a second one.',
  'setting.capitalizeSentences.name': 'Capitalize sentences',
  'setting.capitalizeSentences.desc':
    'Types a capital for the first letter of a line or of a sentence after a period, an exclamation mark or a question mark. It keeps out of code, links, tags and paths, and after common abbreviations. Backspace right after puts back the lowercase letter.',
  'setting.tabOut.name': 'Tab to jump out',
  'setting.tabOut.desc':
    'Tab moves past a closing quote or bracket when the caret is right before it. Tab still indents in lists and moves between cells in tables.',
  'setting.wrapSelection.name': 'Wrap a selection in quotes',
  'setting.wrapSelection.desc': 'With text selected, typing a quote puts curly quotes around it instead of replacing it.',
  'setting.dashes.name': 'Dashes',
  'setting.dashes.desc': 'Turns -- into – and --- into —.',
  'setting.ellipsis.name': 'Ellipsis',
  'setting.ellipsis.desc': 'Turns three dots into ….',
  'setting.arrows.name': 'Arrows',
  'setting.arrows.desc': 'Turns -> into →, <- into ←, <-> into ↔ and => into ⇒.',
  'setting.mathSymbols.name': 'Mathematical symbols',
  'setting.mathSymbols.desc': 'Turns >= into ≥, <= into ≤, != into ≠ and +- into ±.',
  'setting.excludedFolders.name': 'Excluded folders',
  'setting.excludedFolders.desc':
    'Nothing is substituted in notes inside these folders, one folder per line (for example Code or Templates/Raw). A single note can opt out with the property "typography: off", or the command "Turn substitutions off or on in this note".',
  'setting.useLangProperty.name': "Use the note's lang property",
  'setting.useLangProperty.desc':
    'A note with a property such as "lang: de" gets that language\'s quotation marks (English, German, French, Spanish, Swedish, Polish, Russian), unless it has its own "typography-quotes". Off by default, because notes you already have may carry a lang property.',
  'setting.quotesByFolder.name': 'Quotes per folder',
  'setting.quotesByFolder.desc':
    'One folder per line, then " -> ", then the convention: Deutsch -> german. The most specific folder wins. A note\'s "lang" property (if the switch above is on) and its "typography-quotes" property beat the folder. Conventions: english, german, french, spanish, swedish, polish, russian, or off for straight quotes.',
  'setting.customRules.name': 'Your own replacements',
  'setting.customRules.desc':
    'One rule per line, the characters you type, then " -> ", then what they become: (c) -> ©. A rule fires as you type the last character of its sequence, in the same places as the rules above. Backspace straight after puts back what you typed. The rules above go first: a sequence they also handle only uses yours while their switch is off. A sequence needs at least two characters.',
  'setting.stylePreset.name': 'Style preset',
  'setting.stylePreset.desc':
    'Sets the switches above in one go: Writer, Academic, Developer (quiet) or Default. Your folders, quote style (except Developer) and own replacements are kept.',
  'setting.rulePreset.name': 'Add a preset',
  'setting.rulePreset.desc':
    'Adds a ready-made set of rules to your list; rules already in it are left alone. >> is never replaced at the start of a line, where it opens a nested quote.',
  'setting.keepsOut.name': 'Where nothing is substituted',
  'setting.keepsOut.desc':
    'Code blocks, inline code, formulas, link targets, frontmatter, HTML tags and comments, and Templater expressions are left exactly as typed. Backspace straight after a substitution puts back what you typed.',
  'setting.folderStatus.name': 'Folders in use',
  'setting.rulesStatus.name': 'Rules in use',

  // Status lines under the text areas
  'status.noFolders': 'No folders yet.',
  'status.folders.one': 'One folder in use.',
  'status.folders.other': '{count} folders in use.',
  'status.noRules': 'No rules yet.',
  'status.rules.one': 'One rule in use.',
  'status.rules.other': '{count} rules in use.',
  'status.ignored': 'Ignored, line {line} ({text}): {reason}.',

  // Why a line of the custom rules is ignored (a fragment after "Ignored, line n (...):")
  'reason.noSeparator': 'No "{separator}" between the sequence and the replacement',
  'reason.sequenceLineBreak': 'The sequence contains a line break',
  'reason.sequenceEmpty': 'The sequence is empty',
  'reason.sequenceSpaces': 'The sequence is only spaces',
  'reason.sequenceShort': 'The sequence needs at least two characters',
  'reason.sequenceEmoji': 'The sequence ends with an emoji or similar character',
  'reason.replacementLineBreak': 'The replacement contains a line break',
  'reason.replacementEmpty': 'The replacement is empty',
  'reason.replacementSame': 'The replacement is the same as the sequence',
  'reason.duplicate': 'The same sequence is already on line {line}',
  'reason.clash': 'The rule on line {line} already fires on the same keystrokes',
  'reason.folderFormat': 'Write the folder, then " -> ", then the convention',
  'reason.noFolder': 'No folder before "->"',
  'reason.unknownConvention': 'Unknown convention',

  // Modals
  'modal.preset.title': 'Choose a typography style',
  'modal.preset.intro':
    'Pick a starting point. You can change every switch later in the plugin settings, where these presets are also listed.',
  'modal.preset.keepDefault': 'Keep default',
  'modal.preset.use': 'Use {preset}',
  'modal.quotes.placeholder': 'Quotation marks for this note',
  'modal.quotes.follow': 'Follow the folder and global setting (remove the property)',
  'modal.quotes.straight': 'Straight quotes (off)',
} as const;

export default en;
