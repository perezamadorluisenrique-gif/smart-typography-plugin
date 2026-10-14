import type { Messages } from '../i18n.ts';

const ru: Messages = {
  // Commands
  'command.toggleNote': 'Выключить или включить замены в этой заметке',
  'command.setQuotes': 'Задать кавычки для этой заметки…',
  'command.applyToText': 'Применить типографику к выделенному или ко всей заметке',

  // Notices
  'notice.substitutionsOff': 'Typography: замены в этой заметке выключены.',
  'notice.substitutionsOn': 'Typography: замены в этой заметке включены.',
  'notice.removedButExcluded':
    'Typography: свойство удалено, но заметка находится в исключённой папке, поэтому замены остаются выключенными.',
  'notice.nothingToChange': 'Typography: менять нечего.',
  'notice.changedLines.one': 'Typography: изменена 1 строка.',
  'notice.changedLines.other': 'Typography: изменено строк: {count}.',
  'notice.quotesFollowFolder': 'Typography: эта заметка снова использует кавычки папки и общие настройки.',
  'notice.quotesSet': 'Typography: кавычки в этой заметке теперь такие: {style}.',
  'notice.quotesStraight': 'Typography: кавычки в этой заметке теперь прямые.',
  'notice.presetApplied': 'Typography: применён набор «{preset}».',
  'notice.presetRulesPresent': 'Typography: эти правила уже есть в вашем списке.',
  'notice.rulesAdded.one': 'Typography: добавлено 1 правило.',
  'notice.rulesAdded.other': 'Typography: добавлено правил: {count}.',

  // Quotation mark conventions (the sample characters stay as they are)
  'convention.english': 'Английские “ ” ‘ ’',
  'convention.german': 'Немецкие „ “ ‚ ‘',
  'convention.french': 'Французские « » ‹ ›',
  'convention.spanish': 'Испанские « » “ ”',
  'convention.swedish': 'Шведские ” ” ’ ’',
  'convention.polish': 'Польские „ ” ‚ ’',
  'convention.russian': 'Русские « » „ “',
  'convention.off': 'Не трогать прямые кавычки',

  // Style presets
  'stylePreset.default.label': 'По умолчанию',
  'stylePreset.default.desc': 'Типографские кавычки, тире, многоточие, стрелки и символы. Без автоматических заглавных букв.',
  'stylePreset.writer.label': 'Писатель',
  'stylePreset.writer.desc':
    'Проза: типографские кавычки, тире, многоточие и заглавная буква в начале каждого предложения. Без стрелок и математических символов.',
  'stylePreset.academic.label': 'Научный',
  'stylePreset.academic.desc': 'Всё включено, в том числе стрелки и математические символы, плюс автоматические заглавные буквы.',
  'stylePreset.developer.label': 'Разработчик (тихий)',
  'stylePreset.developer.desc':
    'Прямые кавычки и обычные дефисы остаются как набраны. Преобразуются только стрелки и математические символы.',

  // Rule presets
  'rulePreset.guillemets': 'Кавычки-ёлочки << >>',
  'rulePreset.symbols': 'Символы (c) (r) (tm)',

  // Settings
  'setting.quoteStyle.name': 'Кавычки',
  'setting.quoteStyle.desc':
    'В какой стандарт преобразуются прямые кавычки. Апостроф — один и тот же символ во всех стандартах, он настраивается отдельно.',
  'setting.smartApostrophes.name': 'Апострофы',
  'setting.smartApostrophes.desc': "it's превращается в it’s. Работает независимо от того, заданы ли кавычки.",
  'setting.skipClosingQuote.name': 'Перешагивать закрывающую кавычку',
  'setting.skipClosingQuote.desc':
    'Если набрать закрывающую кавычку там, где она уже стоит, курсор переместится за неё, а вторая не добавится.',
  'setting.capitalizeSentences.name': 'Заглавные буквы в начале предложений',
  'setting.capitalizeSentences.desc':
    'Набирает заглавной первую букву строки или предложения после . ! или ?. Не срабатывает в коде, ссылках, тегах и путях, а также после сокращений вроде Mr., e.g. или etc. Backspace сразу после этого возвращает строчную букву.',
  'setting.tabOut.name': 'Выход по Tab',
  'setting.tabOut.desc':
    'Если курсор стоит прямо перед закрывающей кавычкой или скобкой, Tab переместит его за неё. В списках Tab по-прежнему делает отступ, а в таблицах переходит между ячейками.',
  'setting.wrapSelection.name': 'Обрамлять выделение кавычками',
  'setting.wrapSelection.desc': 'Если выделен текст, набранная кавычка ставит типографские кавычки вокруг него, а не заменяет его.',
  'setting.dashes.name': 'Тире',
  'setting.dashes.desc': '-- превращается в –, а --- в —.',
  'setting.ellipsis.name': 'Многоточие',
  'setting.ellipsis.desc': '... превращается в ….',
  'setting.arrows.name': 'Стрелки',
  'setting.arrows.desc': '-> превращается в →, <- в ←, <-> в ↔, => в ⇒.',
  'setting.mathSymbols.name': 'Математические символы',
  'setting.mathSymbols.desc': '>= превращается в ≥, <= в ≤, != в ≠, +- в ±.',
  'setting.excludedFolders.name': 'Исключённые папки',
  'setting.excludedFolders.desc':
    'В заметках из этих папок ничего не заменяется; по одной папке на строку (например, Code или Templates/Raw). Отдельную заметку можно исключить свойством "typography: off" или командой «Выключить или включить замены в этой заметке».',
  'setting.useLangProperty.name': 'Использовать свойство lang заметки',
  'setting.useLangProperty.desc':
    'Заметка со свойством вроде "lang: de" получает кавычки этого языка (английские, немецкие, французские, испанские, шведские, польские, русские), если у неё нет собственного свойства "typography-quotes". По умолчанию выключено, потому что в ваших заметках свойство lang может уже быть.',
  'setting.quotesByFolder.name': 'Кавычки по папкам',
  'setting.quotesByFolder.desc':
    'По одной папке на строку, затем " -> ", затем стандарт: Deutsch -> german. Побеждает самая конкретная папка. Свойства заметки "lang" (если переключатель выше включён) и "typography-quotes" главнее папки. Стандарты: english, german, french, spanish, swedish, polish, russian или off для прямых кавычек.',
  'setting.customRules.name': 'Собственные замены',
  'setting.customRules.desc':
    'По одному правилу на строку: набираемые символы, затем " -> ", затем то, во что они превращаются: (c) -> ©. Правило срабатывает при наборе последнего символа его последовательности, в тех же местах, что и правила выше, а Backspace сразу после этого возвращает набранное. Правила выше имеют приоритет: последовательность, которую они тоже обрабатывают, использует ваше правило, только пока их переключатель выключен. Последовательность должна состоять минимум из двух символов.',
  'setting.stylePreset.name': 'Набор стиля',
  'setting.stylePreset.desc':
    'Сразу задаёт переключатели выше: Писатель, Научный, Разработчик (тихий) или По умолчанию. Ваши папки, стиль кавычек (кроме набора «Разработчик») и собственные замены сохраняются.',
  'setting.rulePreset.name': 'Добавить набор правил',
  'setting.rulePreset.desc':
    'Добавляет в ваш список готовый набор правил; правила, которые там уже есть, не затрагиваются. >> никогда не заменяется в начале строки, где оно открывает вложенную цитату.',
  'setting.keepsOut.name': 'Где ничего не заменяется',
  'setting.keepsOut.desc':
    'Блоки кода, встроенный код, формулы, адреса ссылок, frontmatter, HTML-теги и комментарии, а также выражения Templater остаются в точности такими, как набраны. Backspace сразу после замены возвращает набранное.',
  'setting.folderStatus.name': 'Используемые папки',
  'setting.rulesStatus.name': 'Используемые правила',

  // Status lines under the text areas
  'status.noFolders': 'Папок пока нет.',
  'status.folders.one': 'Используется 1 папка.',
  'status.folders.other': 'Используется папок: {count}.',
  'status.noRules': 'Правил пока нет.',
  'status.rules.one': 'Используется 1 правило.',
  'status.rules.other': 'Используется правил: {count}.',
  'status.ignored': 'Пропущено, строка {line} ({text}): {reason}.',

  // Why a line of the custom rules is ignored
  'reason.noSeparator': 'между последовательностью и заменой нет "{separator}"',
  'reason.sequenceLineBreak': 'последовательность содержит перевод строки',
  'reason.sequenceEmpty': 'последовательность пуста',
  'reason.sequenceSpaces': 'последовательность состоит только из пробелов',
  'reason.sequenceShort': 'последовательность должна состоять минимум из двух символов',
  'reason.sequenceEmoji': 'последовательность заканчивается эмодзи или похожим символом',
  'reason.replacementLineBreak': 'замена содержит перевод строки',
  'reason.replacementEmpty': 'замена пуста',
  'reason.replacementSame': 'замена совпадает с последовательностью',
  'reason.duplicate': 'такая же последовательность уже есть в строке {line}',
  'reason.clash': 'правило в строке {line} уже срабатывает на те же клавиши',
  'reason.folderFormat': 'напишите папку, затем " -> ", затем стандарт',
  'reason.noFolder': 'перед "->" нет папки',
  'reason.unknownConvention': 'неизвестный стандарт',

  // Modals
  'modal.preset.title': 'Выберите типографский стиль',
  'modal.preset.intro':
    'Выберите отправную точку. Каждый переключатель потом можно изменить в настройках плагина, где эти наборы тоже перечислены.',
  'modal.preset.keepDefault': 'Оставить по умолчанию',
  'modal.preset.use': 'Использовать «{preset}»',
  'modal.quotes.placeholder': 'Кавычки для этой заметки',
  'modal.quotes.follow': 'Следовать папке и общей настройке (удалить свойство)',
  'modal.quotes.straight': 'Прямые кавычки (выключено)',
};

export default ru;
