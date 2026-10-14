import type { Messages } from '../i18n.ts';

const ptBR: Messages = {
  // Commands
  'command.toggleNote': 'Desativar ou ativar as substituições nesta nota',
  'command.setQuotes': 'Definir as aspas desta nota…',
  'command.applyToText': 'Aplicar a tipografia à seleção ou à nota inteira',

  // Notices
  'notice.substitutionsOff': 'Typography: as substituições estão desativadas nesta nota.',
  'notice.substitutionsOn': 'Typography: as substituições estão ativadas nesta nota.',
  'notice.removedButExcluded':
    'Typography: a propriedade foi removida, mas esta nota está em uma pasta excluída, então as substituições continuam desativadas.',
  'notice.nothingToChange': 'Typography: nada para alterar.',
  'notice.changedLines.one': 'Typography: 1 linha alterada.',
  'notice.changedLines.other': 'Typography: {count} linhas alteradas.',
  'notice.quotesFollowFolder': 'Typography: esta nota volta a seguir as aspas da pasta e a configuração global.',
  'notice.quotesSet': 'Typography: as aspas desta nota agora são: {style}.',
  'notice.quotesStraight': 'Typography: as aspas desta nota agora são retas.',
  'notice.presetApplied': 'Typography: predefinição “{preset}” aplicada.',
  'notice.presetRulesPresent': 'Typography: essas regras já estão na sua lista.',
  'notice.rulesAdded.one': 'Typography: 1 regra adicionada.',
  'notice.rulesAdded.other': 'Typography: {count} regras adicionadas.',

  // Quotation mark conventions (the sample characters stay as they are)
  'convention.english': 'Inglês “ ” ‘ ’',
  'convention.german': 'Alemão „ “ ‚ ‘',
  'convention.french': 'Francês « » ‹ ›',
  'convention.spanish': 'Espanhol « » “ ”',
  'convention.swedish': 'Sueco ” ” ’ ’',
  'convention.polish': 'Polonês „ ” ‚ ’',
  'convention.russian': 'Russo « » „ “',
  'convention.off': 'Deixar as aspas retas como estão',

  // Style presets
  'stylePreset.default.label': 'Padrão',
  'stylePreset.default.desc': 'Aspas tipográficas, travessões, reticências, setas e símbolos. Sem maiúsculas automáticas.',
  'stylePreset.writer.label': 'Escritor',
  'stylePreset.writer.desc':
    'Prosa: aspas tipográficas, travessões, reticências e maiúscula no início de cada frase. Sem setas nem símbolos matemáticos.',
  'stylePreset.academic.label': 'Acadêmico',
  'stylePreset.academic.desc': 'Tudo ativado, incluindo setas e símbolos matemáticos, além de maiúsculas automáticas.',
  'stylePreset.developer.label': 'Desenvolvedor (discreto)',
  'stylePreset.developer.desc':
    'Aspas retas e hifens simples ficam como digitados. Só setas e símbolos matemáticos são convertidos.',

  // Rule presets
  'rulePreset.guillemets': 'Aspas angulares << >>',
  'rulePreset.symbols': 'Símbolos (c) (r) (tm)',

  // Settings
  'setting.quoteStyle.name': 'Aspas',
  'setting.quoteStyle.desc':
    'Em qual convenção as aspas retas são convertidas. O apóstrofo é o mesmo caractere em todas as convenções e é configurado separadamente.',
  'setting.smartApostrophes.name': 'Apóstrofos',
  'setting.smartApostrophes.desc': "it's vira it’s. Funciona com ou sem aspas configuradas.",
  'setting.skipClosingQuote.name': 'Pular a aspa de fechamento',
  'setting.skipClosingQuote.desc':
    'Ao digitar uma aspa de fechamento onde já existe uma, o cursor passa por cima dela em vez de acrescentar uma segunda.',
  'setting.capitalizeSentences.name': 'Capitalizar frases',
  'setting.capitalizeSentences.desc':
    'Digita maiúscula na primeira letra de uma linha ou de uma frase após . ! ou ?. Não age em código, links, tags e caminhos, nem após abreviações como Mr., e.g. ou etc. Backspace logo em seguida devolve a letra minúscula.',
  'setting.tabOut.name': 'Tab para sair',
  'setting.tabOut.desc':
    'Com o cursor logo antes de uma aspa ou de um parêntese de fechamento, Tab passa por cima. Em listas, Tab continua recuando, e em tabelas continua pulando entre células.',
  'setting.wrapSelection.name': 'Envolver a seleção em aspas',
  'setting.wrapSelection.desc': 'Com texto selecionado, digitar uma aspa coloca aspas tipográficas ao redor em vez de substituí-lo.',
  'setting.dashes.name': 'Travessões',
  'setting.dashes.desc': '-- vira – e --- vira —.',
  'setting.ellipsis.name': 'Reticências',
  'setting.ellipsis.desc': '... vira ….',
  'setting.arrows.name': 'Setas',
  'setting.arrows.desc': '-> vira →, <- vira ←, <-> vira ↔, => vira ⇒.',
  'setting.mathSymbols.name': 'Símbolos matemáticos',
  'setting.mathSymbols.desc': '>= vira ≥, <= vira ≤, != vira ≠, +- vira ±.',
  'setting.excludedFolders.name': 'Pastas excluídas',
  'setting.excludedFolders.desc':
    'Nada é substituído nas notas dessas pastas, uma pasta por linha (por exemplo, Code ou Templates/Raw). Uma nota pode ficar de fora com a propriedade "typography: off" ou com o comando "Desativar ou ativar as substituições nesta nota".',
  'setting.useLangProperty.name': 'Usar a propriedade lang da nota',
  'setting.useLangProperty.desc':
    'Uma nota com uma propriedade como "lang: de" recebe as aspas desse idioma (inglês, alemão, francês, espanhol, sueco, polonês, russo), a menos que tenha a própria propriedade "typography-quotes". Desativado por padrão, porque suas notas atuais podem ter uma propriedade lang.',
  'setting.quotesByFolder.name': 'Aspas por pasta',
  'setting.quotesByFolder.desc':
    'Uma pasta por linha, depois " -> " e depois a convenção: Deutsch -> german. A pasta mais específica vence. A propriedade "lang" da nota (se a chave acima estiver ativada) e a propriedade "typography-quotes" têm prioridade sobre a pasta. Convenções: english, german, french, spanish, swedish, polish, russian, ou off para aspas retas.',
  'setting.customRules.name': 'Suas próprias substituições',
  'setting.customRules.desc':
    'Uma regra por linha: os caracteres que você digita, depois " -> " e depois no que eles se transformam: (c) -> ©. Uma regra age quando você digita o último caractere da sequência, nos mesmos lugares das regras acima, e Backspace logo em seguida devolve o que você digitou. As regras acima têm prioridade: uma sequência que elas também tratam só usa a sua enquanto a chave delas estiver desativada. Uma sequência precisa de pelo menos dois caracteres.',
  'setting.stylePreset.name': 'Estilo predefinido',
  'setting.stylePreset.desc':
    'Define de uma vez as chaves acima: Escritor, Acadêmico, Desenvolvedor (discreto) ou Padrão. Suas pastas, o estilo de aspas (exceto em Desenvolvedor) e suas substituições são mantidos.',
  'setting.rulePreset.name': 'Adicionar uma predefinição',
  'setting.rulePreset.desc':
    'Adiciona à sua lista um conjunto de regras pronto; as regras que já estão nela são mantidas. >> nunca é substituído no início de uma linha, onde abre uma citação aninhada.',
  'setting.keepsOut.name': 'Onde nada é substituído',
  'setting.keepsOut.desc':
    'Blocos de código, código em linha, fórmulas, destinos de links, frontmatter, tags e comentários HTML e expressões do Templater ficam exatamente como digitados. Backspace logo após uma substituição devolve o que você digitou.',
  'setting.folderStatus.name': 'Pastas em uso',
  'setting.rulesStatus.name': 'Regras em uso',

  // Status lines under the text areas
  'status.noFolders': 'Ainda não há pastas.',
  'status.folders.one': '1 pasta em uso.',
  'status.folders.other': '{count} pastas em uso.',
  'status.noRules': 'Ainda não há regras.',
  'status.rules.one': '1 regra em uso.',
  'status.rules.other': '{count} regras em uso.',
  'status.ignored': 'Ignorada, linha {line} ({text}): {reason}.',

  // Why a line of the custom rules is ignored
  'reason.noSeparator': 'falta "{separator}" entre a sequência e a substituição',
  'reason.sequenceLineBreak': 'a sequência contém uma quebra de linha',
  'reason.sequenceEmpty': 'a sequência está vazia',
  'reason.sequenceSpaces': 'a sequência só tem espaços',
  'reason.sequenceShort': 'a sequência precisa de pelo menos dois caracteres',
  'reason.sequenceEmoji': 'a sequência termina com um emoji ou caractere semelhante',
  'reason.replacementLineBreak': 'a substituição contém uma quebra de linha',
  'reason.replacementEmpty': 'a substituição está vazia',
  'reason.replacementSame': 'a substituição é igual à sequência',
  'reason.duplicate': 'a mesma sequência já está na linha {line}',
  'reason.clash': 'a regra da linha {line} já age nas mesmas teclas',
  'reason.folderFormat': 'escreva a pasta, depois " -> " e depois a convenção',
  'reason.noFolder': 'nenhuma pasta antes de "->"',
  'reason.unknownConvention': 'convenção desconhecida',

  // Modals
  'modal.preset.title': 'Escolha um estilo tipográfico',
  'modal.preset.intro':
    'Escolha um ponto de partida. Você pode alterar cada chave depois, nas configurações do plugin, onde essas predefinições também aparecem.',
  'modal.preset.keepDefault': 'Manter o padrão',
  'modal.preset.use': 'Usar {preset}',
  'modal.quotes.placeholder': 'Aspas desta nota',
  'modal.quotes.follow': 'Seguir a pasta e a configuração global (remover a propriedade)',
  'modal.quotes.straight': 'Aspas retas (desativado)',
};

export default ptBR;
