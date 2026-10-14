import type { Messages } from '../i18n.ts';

const de: Messages = {
  // Commands
  'command.toggleNote': 'Ersetzungen in dieser Notiz aus- oder einschalten',
  'command.setQuotes': 'Anführungszeichen für diese Notiz festlegen…',
  'command.applyToText': 'Typografie auf die Auswahl oder die ganze Notiz anwenden',

  // Notices
  'notice.substitutionsOff': 'Typography: Ersetzungen sind in dieser Notiz ausgeschaltet.',
  'notice.substitutionsOn': 'Typography: Ersetzungen sind in dieser Notiz eingeschaltet.',
  'notice.removedButExcluded':
    'Typography: Die Eigenschaft wurde entfernt, aber diese Notiz liegt in einem ausgeschlossenen Ordner, daher bleiben die Ersetzungen aus.',
  'notice.nothingToChange': 'Typography: Nichts zu ändern.',
  'notice.changedLines.one': 'Typography: 1 Zeile geändert.',
  'notice.changedLines.other': 'Typography: {count} Zeilen geändert.',
  'notice.quotesFollowFolder': 'Typography: Diese Notiz folgt wieder den Anführungszeichen des Ordners und der globalen Einstellung.',
  'notice.quotesSet': 'Typography: Die Anführungszeichen dieser Notiz sind jetzt: {style}.',
  'notice.quotesStraight': 'Typography: Die Anführungszeichen dieser Notiz sind jetzt gerade.',
  'notice.presetApplied': 'Typography: Voreinstellung „{preset}“ angewendet.',
  'notice.presetRulesPresent': 'Typography: Diese Regeln stehen bereits in deiner Liste.',
  'notice.rulesAdded.one': 'Typography: 1 Regel hinzugefügt.',
  'notice.rulesAdded.other': 'Typography: {count} Regeln hinzugefügt.',

  // Quotation mark conventions (the sample characters stay as they are)
  'convention.english': 'Englisch “ ” ‘ ’',
  'convention.german': 'Deutsch „ “ ‚ ‘',
  'convention.french': 'Französisch « » ‹ ›',
  'convention.spanish': 'Spanisch « » “ ”',
  'convention.swedish': 'Schwedisch ” ” ’ ’',
  'convention.polish': 'Polnisch „ ” ‚ ’',
  'convention.russian': 'Russisch « » „ “',
  'convention.off': 'Gerade Anführungszeichen unverändert lassen',

  // Style presets
  'stylePreset.default.label': 'Standard',
  'stylePreset.default.desc':
    'Typografische Anführungszeichen, Gedankenstriche, Auslassungspunkte, Pfeile und Symbole. Keine automatische Großschreibung.',
  'stylePreset.writer.label': 'Schreiben',
  'stylePreset.writer.desc':
    'Fließtext: typografische Anführungszeichen, Gedankenstriche, Auslassungspunkte und Großbuchstabe am Satzanfang. Keine Pfeile oder mathematischen Symbole.',
  'stylePreset.academic.label': 'Akademisch',
  'stylePreset.academic.desc': 'Alles eingeschaltet, auch Pfeile und mathematische Symbole, dazu automatische Großschreibung.',
  'stylePreset.developer.label': 'Entwicklung (dezent)',
  'stylePreset.developer.desc':
    'Gerade Anführungszeichen und einfache Bindestriche bleiben, wie getippt. Nur Pfeile und mathematische Symbole werden umgewandelt.',

  // Rule presets
  'rulePreset.guillemets': 'Guillemets << >>',
  'rulePreset.symbols': 'Symbole (c) (r) (tm)',

  // Settings
  'setting.quoteStyle.name': 'Anführungszeichen',
  'setting.quoteStyle.desc':
    'In welche Konvention gerade Anführungszeichen umgewandelt werden. Apostrophe sind in jeder Konvention dasselbe Zeichen und werden separat eingestellt.',
  'setting.smartApostrophes.name': 'Apostrophe',
  'setting.smartApostrophes.desc': "it's wird zu it’s. Funktioniert unabhängig von den Anführungszeichen.",
  'setting.skipClosingQuote.name': 'Schließendes Anführungszeichen überspringen',
  'setting.skipClosingQuote.desc':
    'Wer ein schließendes Anführungszeichen tippt, wo schon eines steht, springt mit dem Cursor dahinter, statt ein zweites einzufügen.',
  'setting.capitalizeSentences.name': 'Sätze großschreiben',
  'setting.capitalizeSentences.desc':
    'Schreibt den ersten Buchstaben einer Zeile oder eines Satzes nach . ! oder ? groß. Nicht in Code, Links, Tags und Pfaden und nicht nach Abkürzungen wie Mr., e.g. oder etc. Die Rücktaste direkt danach stellt den Kleinbuchstaben wieder her.',
  'setting.tabOut.name': 'Mit Tab herausspringen',
  'setting.tabOut.desc':
    'Steht der Cursor direkt vor einem schließenden Anführungszeichen oder einer schließenden Klammer, springt Tab dahinter. In Listen rückt Tab weiterhin ein, in Tabellen wechselt es weiterhin die Zelle.',
  'setting.wrapSelection.name': 'Auswahl in Anführungszeichen setzen',
  'setting.wrapSelection.desc':
    'Wenn Text ausgewählt ist, setzt das Tippen eines Anführungszeichens typografische Anführungszeichen darum, statt den Text zu ersetzen.',
  'setting.dashes.name': 'Striche',
  'setting.dashes.desc': '-- wird zu – und --- wird zu —.',
  'setting.ellipsis.name': 'Auslassungspunkte',
  'setting.ellipsis.desc': '... wird zu ….',
  'setting.arrows.name': 'Pfeile',
  'setting.arrows.desc': '-> wird zu →, <- wird zu ←, <-> wird zu ↔, => wird zu ⇒.',
  'setting.mathSymbols.name': 'Mathematische Symbole',
  'setting.mathSymbols.desc': '>= wird zu ≥, <= wird zu ≤, != wird zu ≠, +- wird zu ±.',
  'setting.excludedFolders.name': 'Ausgeschlossene Ordner',
  'setting.excludedFolders.desc':
    'In Notizen dieser Ordner wird nichts ersetzt, ein Ordner pro Zeile (zum Beispiel Code oder Templates/Raw). Eine einzelne Notiz kann mit der Eigenschaft "typography: off" oder dem Befehl „Ersetzungen in dieser Notiz aus- oder einschalten“ ausgenommen werden.',
  'setting.useLangProperty.name': 'Eigenschaft lang der Notiz verwenden',
  'setting.useLangProperty.desc':
    'Eine Notiz mit einer Eigenschaft wie "lang: de" erhält die Anführungszeichen dieser Sprache (Englisch, Deutsch, Französisch, Spanisch, Schwedisch, Polnisch, Russisch), sofern sie nicht ihr eigenes "typography-quotes" hat. Standardmäßig aus, weil deine vorhandenen Notizen schon eine Eigenschaft lang haben können.',
  'setting.quotesByFolder.name': 'Anführungszeichen pro Ordner',
  'setting.quotesByFolder.desc':
    'Ein Ordner pro Zeile, dann " -> ", dann die Konvention: Deutsch -> german. Der spezifischste Ordner gewinnt. Die Eigenschaft "lang" der Notiz (wenn der Schalter oben an ist) und ihre Eigenschaft "typography-quotes" haben Vorrang vor dem Ordner. Konventionen: english, german, french, spanish, swedish, polish, russian oder off für gerade Anführungszeichen.',
  'setting.customRules.name': 'Eigene Ersetzungen',
  'setting.customRules.desc':
    'Eine Regel pro Zeile: die getippten Zeichen, dann " -> ", dann was daraus wird: (c) -> ©. Eine Regel greift, sobald du das letzte Zeichen ihrer Zeichenfolge tippst, an denselben Stellen wie die Regeln oben, und die Rücktaste direkt danach stellt das Getippte wieder her. Die Regeln oben haben Vorrang: Eine Zeichenfolge, die auch sie behandeln, nutzt deine Regel nur, solange ihr Schalter aus ist. Eine Zeichenfolge braucht mindestens zwei Zeichen.',
  'setting.stylePreset.name': 'Stilvoreinstellung',
  'setting.stylePreset.desc':
    'Stellt die Schalter oben in einem Schritt ein: Schreiben, Akademisch, Entwicklung (dezent) oder Standard. Deine Ordner, der Anführungszeichen-Stil (außer bei Entwicklung) und deine eigenen Ersetzungen bleiben erhalten.',
  'setting.rulePreset.name': 'Voreinstellung hinzufügen',
  'setting.rulePreset.desc':
    'Fügt deiner Liste einen fertigen Regelsatz hinzu; vorhandene Regeln bleiben unberührt. >> wird am Zeilenanfang nie ersetzt, weil es dort ein verschachteltes Zitat einleitet.',
  'setting.keepsOut.name': 'Wo nichts ersetzt wird',
  'setting.keepsOut.desc':
    'Codeblöcke, Inline-Code, Formeln, Linkziele, Frontmatter, HTML-Tags und -Kommentare sowie Templater-Ausdrücke bleiben genau so, wie sie getippt wurden. Die Rücktaste direkt nach einer Ersetzung stellt das Getippte wieder her.',
  'setting.folderStatus.name': 'Verwendete Ordner',
  'setting.rulesStatus.name': 'Verwendete Regeln',

  // Status lines under the text areas
  'status.noFolders': 'Noch keine Ordner.',
  'status.folders.one': '1 Ordner wird verwendet.',
  'status.folders.other': '{count} Ordner werden verwendet.',
  'status.noRules': 'Noch keine Regeln.',
  'status.rules.one': '1 Regel wird verwendet.',
  'status.rules.other': '{count} Regeln werden verwendet.',
  'status.ignored': 'Ignoriert, Zeile {line} ({text}): {reason}.',

  // Why a line of the custom rules is ignored
  'reason.noSeparator': 'Zwischen Zeichenfolge und Ersatz fehlt "{separator}"',
  'reason.sequenceLineBreak': 'Die Zeichenfolge enthält einen Zeilenumbruch',
  'reason.sequenceEmpty': 'Die Zeichenfolge ist leer',
  'reason.sequenceSpaces': 'Die Zeichenfolge besteht nur aus Leerzeichen',
  'reason.sequenceShort': 'Die Zeichenfolge braucht mindestens zwei Zeichen',
  'reason.sequenceEmoji': 'Die Zeichenfolge endet mit einem Emoji oder ähnlichen Zeichen',
  'reason.replacementLineBreak': 'Der Ersatz enthält einen Zeilenumbruch',
  'reason.replacementEmpty': 'Der Ersatz ist leer',
  'reason.replacementSame': 'Der Ersatz ist mit der Zeichenfolge identisch',
  'reason.duplicate': 'Dieselbe Zeichenfolge steht schon in Zeile {line}',
  'reason.clash': 'Die Regel in Zeile {line} greift bereits bei denselben Tasten',
  'reason.folderFormat': 'Erst den Ordner schreiben, dann " -> ", dann die Konvention',
  'reason.noFolder': 'Kein Ordner vor "->"',
  'reason.unknownConvention': 'Unbekannte Konvention',

  // Modals
  'modal.preset.title': 'Typografie-Stil wählen',
  'modal.preset.intro':
    'Wähle einen Ausgangspunkt. Jeden Schalter kannst du später in den Einstellungen der Erweiterung ändern; dort sind diese Voreinstellungen ebenfalls aufgeführt.',
  'modal.preset.keepDefault': 'Standard beibehalten',
  'modal.preset.use': '{preset} verwenden',
  'modal.quotes.placeholder': 'Anführungszeichen für diese Notiz',
  'modal.quotes.follow': 'Ordner und globaler Einstellung folgen (Eigenschaft entfernen)',
  'modal.quotes.straight': 'Gerade Anführungszeichen (aus)',
};

export default de;
