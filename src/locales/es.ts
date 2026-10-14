import type { Messages } from '../i18n.ts';

const es: Messages = {
  // Commands
  'command.toggleNote': 'Desactivar o activar las sustituciones en esta nota',
  'command.setQuotes': 'Definir las comillas de esta nota…',
  'command.applyToText': 'Aplicar la tipografía a la selección o a toda la nota',

  // Notices
  'notice.substitutionsOff': 'Typography: las sustituciones están desactivadas en esta nota.',
  'notice.substitutionsOn': 'Typography: las sustituciones están activadas en esta nota.',
  'notice.removedButExcluded':
    'Typography: se quitó la propiedad, pero esta nota está en una carpeta excluida, así que las sustituciones siguen desactivadas.',
  'notice.nothingToChange': 'Typography: no hay nada que cambiar.',
  'notice.changedLines.one': 'Typography: se cambió 1 línea.',
  'notice.changedLines.other': 'Typography: se cambiaron {count} líneas.',
  'notice.quotesFollowFolder': 'Typography: esta nota vuelve a seguir las comillas de la carpeta y las globales.',
  'notice.quotesSet': 'Typography: las comillas de esta nota ahora son: {style}.',
  'notice.quotesStraight': 'Typography: las comillas de esta nota ahora son rectas.',
  'notice.presetApplied': 'Typography: se aplicó el ajuste predefinido «{preset}».',
  'notice.presetRulesPresent': 'Typography: esas reglas ya están en tu lista.',
  'notice.rulesAdded.one': 'Typography: se añadió 1 regla.',
  'notice.rulesAdded.other': 'Typography: se añadieron {count} reglas.',

  // Quotation mark conventions (the sample characters stay as they are)
  'convention.english': 'Inglés “ ” ‘ ’',
  'convention.german': 'Alemán „ “ ‚ ‘',
  'convention.french': 'Francés « » ‹ ›',
  'convention.spanish': 'Español « » “ ”',
  'convention.swedish': 'Sueco ” ” ’ ’',
  'convention.polish': 'Polaco „ ” ‚ ’',
  'convention.russian': 'Ruso « » „ “',
  'convention.off': 'Dejar las comillas rectas como están',

  // Style presets
  'stylePreset.default.label': 'Predeterminado',
  'stylePreset.default.desc': 'Comillas tipográficas, rayas, puntos suspensivos, flechas y símbolos. Sin mayúsculas automáticas.',
  'stylePreset.writer.label': 'Escritor',
  'stylePreset.writer.desc':
    'Prosa: comillas tipográficas, rayas, puntos suspensivos y mayúscula al comienzo de cada frase. Sin flechas ni símbolos matemáticos.',
  'stylePreset.academic.label': 'Académico',
  'stylePreset.academic.desc': 'Todo activado, incluidas las flechas y los símbolos matemáticos, además de las mayúsculas automáticas.',
  'stylePreset.developer.label': 'Desarrollador (discreto)',
  'stylePreset.developer.desc':
    'Las comillas rectas y los guiones simples se quedan como se escriben. Solo se convierten las flechas y los símbolos matemáticos.',

  // Rule presets
  'rulePreset.guillemets': 'Comillas angulares << >>',
  'rulePreset.symbols': 'Símbolos (c) (r) (tm)',

  // Settings
  'setting.quoteStyle.name': 'Comillas',
  'setting.quoteStyle.desc':
    'En qué convención se convierten las comillas rectas. El apóstrofo es el mismo carácter en todas las convenciones y se configura aparte.',
  'setting.smartApostrophes.name': 'Apóstrofos',
  'setting.smartApostrophes.desc': "it's se convierte en it’s. Funciona tengas o no definidas las comillas.",
  'setting.skipClosingQuote.name': 'Saltar la comilla de cierre',
  'setting.skipClosingQuote.desc':
    'Al escribir una comilla de cierre donde ya hay una, el cursor pasa por encima en lugar de añadir una segunda.',
  'setting.capitalizeSentences.name': 'Poner mayúscula al inicio de las frases',
  'setting.capitalizeSentences.desc':
    'Escribe en mayúscula la primera letra de una línea o de una frase que sigue a . ! o ?. No actúa en código, enlaces, etiquetas ni rutas, ni después de abreviaturas como Mr., e.g. o etc. Retroceso justo después devuelve la minúscula.',
  'setting.tabOut.name': 'Tabulador para salir',
  'setting.tabOut.desc':
    'Con el cursor justo antes de una comilla o un paréntesis de cierre, el tabulador pasa por encima. En las listas sigue sangrando y en las tablas sigue moviéndose entre celdas.',
  'setting.wrapSelection.name': 'Envolver la selección entre comillas',
  'setting.wrapSelection.desc': 'Con texto seleccionado, escribir una comilla pone comillas tipográficas alrededor en lugar de reemplazarlo.',
  'setting.dashes.name': 'Rayas',
  'setting.dashes.desc': '-- se convierte en – y --- en —.',
  'setting.ellipsis.name': 'Puntos suspensivos',
  'setting.ellipsis.desc': '... se convierte en ….',
  'setting.arrows.name': 'Flechas',
  'setting.arrows.desc': '-> se convierte en →, <- en ←, <-> en ↔ y => en ⇒.',
  'setting.mathSymbols.name': 'Símbolos matemáticos',
  'setting.mathSymbols.desc': '>= se convierte en ≥, <= en ≤, != en ≠ y +- en ±.',
  'setting.excludedFolders.name': 'Carpetas excluidas',
  'setting.excludedFolders.desc':
    'No se sustituye nada en las notas de estas carpetas; una carpeta por línea (por ejemplo, Code o Templates/Raw). Una nota concreta puede excluirse con la propiedad "typography: off" o con el comando "Desactivar o activar las sustituciones en esta nota".',
  'setting.useLangProperty.name': 'Usar la propiedad lang de la nota',
  'setting.useLangProperty.desc':
    'Una nota con una propiedad como "lang: de" recibe las comillas de ese idioma (inglés, alemán, francés, español, sueco, polaco, ruso), salvo que tenga su propia propiedad "typography-quotes". Desactivado por defecto, porque tus notas actuales pueden tener una propiedad lang.',
  'setting.quotesByFolder.name': 'Comillas por carpeta',
  'setting.quotesByFolder.desc':
    'Una carpeta por línea, luego " -> " y luego la convención: Deutsch -> german. Gana la carpeta más específica. La propiedad "lang" de la nota (si el interruptor de arriba está activado) y su propiedad "typography-quotes" tienen prioridad sobre la carpeta. Convenciones: english, german, french, spanish, swedish, polish, russian, u off para comillas rectas.',
  'setting.customRules.name': 'Tus propias sustituciones',
  'setting.customRules.desc':
    'Una regla por línea: los caracteres que escribes, luego " -> " y luego en qué se convierten: (c) -> ©. Una regla se activa al escribir el último carácter de su secuencia, en los mismos lugares que las reglas de arriba, y Retroceso justo después devuelve lo que escribiste. Las reglas de arriba van primero: una secuencia que ellas también gestionan solo usa la tuya mientras su interruptor esté desactivado. Una secuencia necesita al menos dos caracteres.',
  'setting.stylePreset.name': 'Estilo predefinido',
  'setting.stylePreset.desc':
    'Ajusta de una vez los interruptores de arriba: Escritor, Académico, Desarrollador (discreto) o Predeterminado. Se conservan tus carpetas, el estilo de comillas (salvo en Desarrollador) y tus sustituciones.',
  'setting.rulePreset.name': 'Añadir un conjunto de reglas',
  'setting.rulePreset.desc':
    'Añade a tu lista un conjunto de reglas ya hecho; las reglas que ya estén en ella no se tocan. >> nunca se sustituye al comienzo de una línea, donde abre una cita anidada.',
  'setting.keepsOut.name': 'Dónde no se sustituye nada',
  'setting.keepsOut.desc':
    'Los bloques de código, el código en línea, las fórmulas, los destinos de enlaces, el frontmatter, las etiquetas y comentarios HTML y las expresiones de Templater se quedan exactamente como se escribieron. Retroceso justo después de una sustitución devuelve lo que escribiste.',
  'setting.folderStatus.name': 'Carpetas en uso',
  'setting.rulesStatus.name': 'Reglas en uso',

  // Status lines under the text areas
  'status.noFolders': 'Aún no hay carpetas.',
  'status.folders.one': '1 carpeta en uso.',
  'status.folders.other': '{count} carpetas en uso.',
  'status.noRules': 'Aún no hay reglas.',
  'status.rules.one': '1 regla en uso.',
  'status.rules.other': '{count} reglas en uso.',
  'status.ignored': 'Ignorada, línea {line} ({text}): {reason}.',

  // Why a line of the custom rules is ignored
  'reason.noSeparator': 'falta "{separator}" entre la secuencia y el reemplazo',
  'reason.sequenceLineBreak': 'la secuencia contiene un salto de línea',
  'reason.sequenceEmpty': 'la secuencia está vacía',
  'reason.sequenceSpaces': 'la secuencia son solo espacios',
  'reason.sequenceShort': 'la secuencia necesita al menos dos caracteres',
  'reason.sequenceEmoji': 'la secuencia termina con un emoji o un carácter similar',
  'reason.replacementLineBreak': 'el reemplazo contiene un salto de línea',
  'reason.replacementEmpty': 'el reemplazo está vacío',
  'reason.replacementSame': 'el reemplazo es igual a la secuencia',
  'reason.duplicate': 'la misma secuencia ya está en la línea {line}',
  'reason.clash': 'la regla de la línea {line} ya se activa con las mismas teclas',
  'reason.folderFormat': 'escribe la carpeta, luego " -> " y luego la convención',
  'reason.noFolder': 'no hay carpeta antes de "->"',
  'reason.unknownConvention': 'convención desconocida',

  // Modals
  'modal.preset.title': 'Elige un estilo tipográfico',
  'modal.preset.intro':
    'Elige un punto de partida. Podrás cambiar cada interruptor más adelante en los ajustes del complemento, donde también aparecen estos estilos predefinidos.',
  'modal.preset.keepDefault': 'Mantener el predeterminado',
  'modal.preset.use': 'Usar {preset}',
  'modal.quotes.placeholder': 'Comillas de esta nota',
  'modal.quotes.follow': 'Seguir la carpeta y el ajuste global (quitar la propiedad)',
  'modal.quotes.straight': 'Comillas rectas (desactivado)',
};

export default es;
