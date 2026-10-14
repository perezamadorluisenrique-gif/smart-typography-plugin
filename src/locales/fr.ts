import type { Messages } from '../i18n.ts';

const fr: Messages = {
  // Commands
  'command.toggleNote': 'Désactiver ou activer les substitutions dans cette note',
  'command.setQuotes': 'Définir les guillemets de cette note…',
  'command.applyToText': 'Appliquer la typographie à la sélection ou à toute la note',

  // Notices
  'notice.substitutionsOff': 'Typography : les substitutions sont désactivées dans cette note.',
  'notice.substitutionsOn': 'Typography : les substitutions sont activées dans cette note.',
  'notice.removedButExcluded':
    'Typography : la propriété a été supprimée, mais cette note se trouve dans un dossier exclu, les substitutions restent donc désactivées.',
  'notice.nothingToChange': 'Typography : rien à modifier.',
  'notice.changedLines.one': 'Typography : 1 ligne modifiée.',
  'notice.changedLines.other': 'Typography : {count} lignes modifiées.',
  'notice.quotesFollowFolder': 'Typography : cette note suit de nouveau les guillemets du dossier et le réglage global.',
  'notice.quotesSet': 'Typography : les guillemets de cette note sont maintenant : {style}.',
  'notice.quotesStraight': 'Typography : les guillemets de cette note sont maintenant droits.',
  'notice.presetApplied': 'Typography : préréglage « {preset} » appliqué.',
  'notice.presetRulesPresent': 'Typography : ces règles sont déjà dans votre liste.',
  'notice.rulesAdded.one': 'Typography : 1 règle ajoutée.',
  'notice.rulesAdded.other': 'Typography : {count} règles ajoutées.',

  // Quotation mark conventions (the sample characters stay as they are)
  'convention.english': 'Anglais “ ” ‘ ’',
  'convention.german': 'Allemand „ “ ‚ ‘',
  'convention.french': 'Français « » ‹ ›',
  'convention.spanish': 'Espagnol « » “ ”',
  'convention.swedish': 'Suédois ” ” ’ ’',
  'convention.polish': 'Polonais „ ” ‚ ’',
  'convention.russian': 'Russe « » „ “',
  'convention.off': 'Laisser les guillemets droits tels quels',

  // Style presets
  'stylePreset.default.label': 'Par défaut',
  'stylePreset.default.desc':
    'Guillemets typographiques, tirets, points de suspension, flèches et symboles. Pas de majuscules automatiques.',
  'stylePreset.writer.label': 'Rédaction',
  'stylePreset.writer.desc':
    'Prose : guillemets typographiques, tirets, points de suspension et majuscule en début de phrase. Pas de flèches ni de symboles mathématiques.',
  'stylePreset.academic.label': 'Académique',
  'stylePreset.academic.desc':
    'Tout est activé, y compris les flèches et les symboles mathématiques, plus les majuscules automatiques.',
  'stylePreset.developer.label': 'Développeur (discret)',
  'stylePreset.developer.desc':
    'Les guillemets droits et les traits d’union simples restent tels que saisis. Seuls les flèches et les symboles mathématiques sont convertis.',

  // Rule presets
  'rulePreset.guillemets': 'Guillemets << >>',
  'rulePreset.symbols': 'Symboles (c) (r) (tm)',

  // Settings
  'setting.quoteStyle.name': 'Guillemets',
  'setting.quoteStyle.desc':
    'La convention en laquelle les guillemets droits sont convertis. Les apostrophes sont le même caractère dans toutes les conventions et se règlent séparément.',
  'setting.smartApostrophes.name': 'Apostrophes',
  'setting.smartApostrophes.desc': "it's devient it’s. Fonctionne que les guillemets soient définis ou non.",
  'setting.skipClosingQuote.name': 'Passer par-dessus un guillemet fermant',
  'setting.skipClosingQuote.desc':
    'Saisir un guillemet fermant là où il y en a déjà un déplace le curseur après lui au lieu d’en ajouter un second.',
  'setting.capitalizeSentences.name': 'Majuscule en début de phrase',
  'setting.capitalizeSentences.desc':
    'Met en majuscule la première lettre d’une ligne ou d’une phrase après . ! ou ?. Sans effet dans le code, les liens, les étiquettes et les chemins, ni après des abréviations comme Mr., e.g. ou etc. Retour arrière juste après rétablit la minuscule.',
  'setting.tabOut.name': 'Tab pour sortir',
  'setting.tabOut.desc':
    'Avec le curseur juste avant un guillemet ou une parenthèse fermants, Tab passe après. Tab continue d’indenter dans les listes et de passer d’une cellule à l’autre dans les tableaux.',
  'setting.wrapSelection.name': 'Entourer une sélection de guillemets',
  'setting.wrapSelection.desc':
    'Avec du texte sélectionné, saisir un guillemet place des guillemets typographiques autour au lieu de remplacer le texte.',
  'setting.dashes.name': 'Tirets',
  'setting.dashes.desc': '-- devient – et --- devient —.',
  'setting.ellipsis.name': 'Points de suspension',
  'setting.ellipsis.desc': '... devient ….',
  'setting.arrows.name': 'Flèches',
  'setting.arrows.desc': '-> devient →, <- devient ←, <-> devient ↔, => devient ⇒.',
  'setting.mathSymbols.name': 'Symboles mathématiques',
  'setting.mathSymbols.desc': '>= devient ≥, <= devient ≤, != devient ≠, +- devient ±.',
  'setting.excludedFolders.name': 'Dossiers exclus',
  'setting.excludedFolders.desc':
    'Rien n’est substitué dans les notes de ces dossiers, un dossier par ligne (par exemple Code ou Templates/Raw). Une note peut aussi être exclue avec la propriété "typography: off" ou la commande « Désactiver ou activer les substitutions dans cette note ».',
  'setting.useLangProperty.name': 'Utiliser la propriété lang de la note',
  'setting.useLangProperty.desc':
    'Une note ayant une propriété comme "lang: de" reçoit les guillemets de cette langue (anglais, allemand, français, espagnol, suédois, polonais, russe), sauf si elle a sa propre propriété "typography-quotes". Désactivé par défaut, car vos notes existantes peuvent déjà avoir une propriété lang.',
  'setting.quotesByFolder.name': 'Guillemets par dossier',
  'setting.quotesByFolder.desc':
    'Un dossier par ligne, puis " -> ", puis la convention : Deutsch -> german. Le dossier le plus précis l’emporte. La propriété "lang" de la note (si l’interrupteur ci-dessus est activé) et sa propriété "typography-quotes" priment sur le dossier. Conventions : english, german, french, spanish, swedish, polish, russian, ou off pour des guillemets droits.',
  'setting.customRules.name': 'Vos propres substitutions',
  'setting.customRules.desc':
    'Une règle par ligne : les caractères saisis, puis " -> ", puis ce qu’ils deviennent : (c) -> ©. Une règle se déclenche à la saisie du dernier caractère de sa séquence, aux mêmes endroits que les règles ci-dessus, et Retour arrière juste après rétablit ce que vous avez saisi. Les règles ci-dessus passent d’abord : une séquence qu’elles gèrent aussi n’utilise la vôtre que tant que leur interrupteur est désactivé. Une séquence doit compter au moins deux caractères.',
  'setting.stylePreset.name': 'Préréglage de style',
  'setting.stylePreset.desc':
    'Règle d’un coup les interrupteurs ci-dessus : Rédaction, Académique, Développeur (discret) ou Par défaut. Vos dossiers, le style de guillemets (sauf pour Développeur) et vos propres substitutions sont conservés.',
  'setting.rulePreset.name': 'Ajouter un préréglage',
  'setting.rulePreset.desc':
    'Ajoute à votre liste un ensemble de règles prêt à l’emploi ; les règles déjà présentes sont laissées telles quelles. >> n’est jamais remplacé en début de ligne, où il ouvre une citation imbriquée.',
  'setting.keepsOut.name': 'Où rien n’est substitué',
  'setting.keepsOut.desc':
    'Les blocs de code, le code en ligne, les formules, les cibles de liens, le frontmatter, les balises et commentaires HTML et les expressions Templater restent exactement tels que saisis. Retour arrière juste après une substitution rétablit ce que vous avez saisi.',
  'setting.folderStatus.name': 'Dossiers utilisés',
  'setting.rulesStatus.name': 'Règles utilisées',

  // Status lines under the text areas
  'status.noFolders': 'Aucun dossier pour l’instant.',
  'status.folders.one': '1 dossier utilisé.',
  'status.folders.other': '{count} dossiers utilisés.',
  'status.noRules': 'Aucune règle pour l’instant.',
  'status.rules.one': '1 règle utilisée.',
  'status.rules.other': '{count} règles utilisées.',
  'status.ignored': 'Ignorée, ligne {line} ({text}) : {reason}.',

  // Why a line of the custom rules is ignored
  'reason.noSeparator': 'il manque "{separator}" entre la séquence et le remplacement',
  'reason.sequenceLineBreak': 'la séquence contient un saut de ligne',
  'reason.sequenceEmpty': 'la séquence est vide',
  'reason.sequenceSpaces': 'la séquence ne contient que des espaces',
  'reason.sequenceShort': 'la séquence doit compter au moins deux caractères',
  'reason.sequenceEmoji': 'la séquence se termine par un émoji ou un caractère semblable',
  'reason.replacementLineBreak': 'le remplacement contient un saut de ligne',
  'reason.replacementEmpty': 'le remplacement est vide',
  'reason.replacementSame': 'le remplacement est identique à la séquence',
  'reason.duplicate': 'la même séquence est déjà à la ligne {line}',
  'reason.clash': 'la règle de la ligne {line} se déclenche déjà avec les mêmes touches',
  'reason.folderFormat': 'écrivez le dossier, puis " -> ", puis la convention',
  'reason.noFolder': 'aucun dossier avant "->"',
  'reason.unknownConvention': 'convention inconnue',

  // Modals
  'modal.preset.title': 'Choisir un style typographique',
  'modal.preset.intro':
    'Choisissez un point de départ. Vous pourrez modifier chaque interrupteur plus tard dans les réglages du module, où ces préréglages sont aussi listés.',
  'modal.preset.keepDefault': 'Garder le réglage par défaut',
  'modal.preset.use': 'Utiliser {preset}',
  'modal.quotes.placeholder': 'Guillemets de cette note',
  'modal.quotes.follow': 'Suivre le dossier et le réglage global (supprimer la propriété)',
  'modal.quotes.straight': 'Guillemets droits (désactivé)',
};

export default fr;
