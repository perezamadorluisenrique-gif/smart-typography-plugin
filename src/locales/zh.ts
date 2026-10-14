import type { Messages } from '../i18n.ts';

const zh: Messages = {
  // Commands
  'command.toggleNote': '在此笔记中关闭或开启自动替换',
  'command.setQuotes': '设置此笔记的引号…',
  'command.applyToText': '对所选文本或整篇笔记应用排版',

  // Notices
  'notice.substitutionsOff': 'Typography: 此笔记已关闭自动替换。',
  'notice.substitutionsOn': 'Typography: 此笔记已开启自动替换。',
  'notice.removedButExcluded': 'Typography: 已移除该属性，但此笔记位于被排除的文件夹中，因此自动替换仍保持关闭。',
  'notice.nothingToChange': 'Typography: 没有需要修改的内容。',
  'notice.changedLines.one': 'Typography: 已修改 1 行。',
  'notice.changedLines.other': 'Typography: 已修改 {count} 行。',
  'notice.quotesFollowFolder': 'Typography: 此笔记再次沿用文件夹和全局的引号设置。',
  'notice.quotesSet': 'Typography: 此笔记的引号现为{style}。',
  'notice.quotesStraight': 'Typography: 此笔记的引号现为直引号。',
  'notice.presetApplied': 'Typography: 已应用“{preset}”预设。',
  'notice.presetRulesPresent': 'Typography: 这些规则已在你的列表中。',
  'notice.rulesAdded.one': 'Typography: 已添加 1 条规则。',
  'notice.rulesAdded.other': 'Typography: 已添加 {count} 条规则。',

  // Quotation mark conventions (the sample characters stay as they are)
  'convention.english': '英文 “ ” ‘ ’',
  'convention.german': '德文 „ “ ‚ ‘',
  'convention.french': '法文 « » ‹ ›',
  'convention.spanish': '西班牙文 « » “ ”',
  'convention.swedish': '瑞典文 ” ” ’ ’',
  'convention.polish': '波兰文 „ ” ‚ ’',
  'convention.russian': '俄文 « » „ “',
  'convention.off': '保留直引号不变',

  // Style presets
  'stylePreset.default.label': '默认',
  'stylePreset.default.desc': '弯引号、破折号、省略号、箭头和符号。不自动大写。',
  'stylePreset.writer.label': '写作',
  'stylePreset.writer.desc': '适合行文：弯引号、破折号、省略号，以及每个句子开头自动大写。不转换箭头和数学符号。',
  'stylePreset.academic.label': '学术',
  'stylePreset.academic.desc': '全部开启，包括箭头和数学符号，并自动大写。',
  'stylePreset.developer.label': '开发者（静默）',
  'stylePreset.developer.desc': '直引号和普通连字符保持输入原样。只转换箭头和数学符号。',

  // Rule presets
  'rulePreset.guillemets': '法式引号 << >>',
  'rulePreset.symbols': '符号 (c) (r) (tm)',

  // Settings
  'setting.quoteStyle.name': '引号',
  'setting.quoteStyle.desc': '将直引号转换为哪种引号规范。撇号在所有规范中都是同一个字符，需单独设置。',
  'setting.smartApostrophes.name': '撇号',
  'setting.smartApostrophes.desc': "it's 变为 it’s。无论是否设置了引号都有效。",
  'setting.skipClosingQuote.name': '跳过右引号',
  'setting.skipClosingQuote.desc': '在已有右引号的位置输入右引号时，光标会移到它后面，而不是再添加一个。',
  'setting.capitalizeSentences.name': '句首大写',
  'setting.capitalizeSentences.desc':
    '在行首或在 . ! ? 之后的句子开头自动输入大写字母。代码、链接、标签和路径中不会生效，Mr.、e.g.、etc. 等缩写之后也不会。紧接着按退格键可恢复为小写字母。',
  'setting.tabOut.name': '用 Tab 跳出',
  'setting.tabOut.desc': '光标紧靠右引号或右括号之前时，按 Tab 会移到它之后。在列表中 Tab 仍用于缩进，在表格中仍用于在单元格之间移动。',
  'setting.wrapSelection.name': '用引号包住所选文本',
  'setting.wrapSelection.desc': '选中文本后输入引号，会在文本两侧加上弯引号，而不是替换该文本。',
  'setting.dashes.name': '破折号',
  'setting.dashes.desc': '-- 变为 –，--- 变为 —。',
  'setting.ellipsis.name': '省略号',
  'setting.ellipsis.desc': '... 变为 …。',
  'setting.arrows.name': '箭头',
  'setting.arrows.desc': '-> 变为 →，<- 变为 ←，<-> 变为 ↔，=> 变为 ⇒。',
  'setting.mathSymbols.name': '数学符号',
  'setting.mathSymbols.desc': '>= 变为 ≥，<= 变为 ≤，!= 变为 ≠，+- 变为 ±。',
  'setting.excludedFolders.name': '排除的文件夹',
  'setting.excludedFolders.desc':
    '这些文件夹内的笔记不做任何替换，每行一个文件夹（例如 Code 或 Templates/Raw）。单篇笔记可以通过属性 "typography: off" 或命令“在此笔记中关闭或开启自动替换”来退出。',
  'setting.useLangProperty.name': '使用笔记的 lang 属性',
  'setting.useLangProperty.desc':
    '带有 "lang: de" 之类属性的笔记会使用该语言的引号（英文、德文、法文、西班牙文、瑞典文、波兰文、俄文），除非它有自己的 "typography-quotes"。默认关闭，因为你现有的笔记可能已带有 lang 属性。',
  'setting.quotesByFolder.name': '按文件夹设置引号',
  'setting.quotesByFolder.desc':
    '每行一条：文件夹，然后是 " -> "，然后是规范，例如 Deutsch -> german。最具体的文件夹优先。笔记的 "lang" 属性（若上面的开关已开启）和 "typography-quotes" 属性优先于文件夹设置。可用规范：english、german、french、spanish、swedish、polish、russian，或用 off 表示直引号。',
  'setting.customRules.name': '自定义替换',
  'setting.customRules.desc':
    '每行一条规则：先写你要输入的字符，然后是 " -> "，然后是它们变成的内容，例如 (c) -> ©。输入规则序列的最后一个字符时触发，生效位置与上面的规则相同，紧接着按退格键可恢复你输入的内容。上面的规则优先：它们也处理的序列，只有在其开关关闭时才使用你的规则。序列至少需要两个字符。',
  'setting.stylePreset.name': '样式预设',
  'setting.stylePreset.desc': '一次设置上面的各个开关：写作、学术、开发者（静默）或默认。你的文件夹、引号样式（开发者预设除外）和自定义替换会保留。',
  'setting.rulePreset.name': '添加预设',
  'setting.rulePreset.desc': '将一组现成的规则添加到你的列表中；已有的规则不受影响。>> 在行首永远不会被替换，因为在那里它表示嵌套引用。',
  'setting.keepsOut.name': '不做替换的位置',
  'setting.keepsOut.desc':
    '代码块、行内代码、公式、链接目标、frontmatter、HTML 标签和注释，以及 Templater 表达式都会保持输入原样。替换之后紧接着按退格键可恢复你输入的内容。',
  'setting.folderStatus.name': '生效的文件夹',
  'setting.rulesStatus.name': '生效的规则',

  // Status lines under the text areas
  'status.noFolders': '还没有文件夹。',
  'status.folders.one': '有 1 个文件夹生效。',
  'status.folders.other': '有 {count} 个文件夹生效。',
  'status.noRules': '还没有规则。',
  'status.rules.one': '有 1 条规则生效。',
  'status.rules.other': '有 {count} 条规则生效。',
  'status.ignored': '已忽略，第 {line} 行（{text}）：{reason}。',

  // Why a line of the custom rules is ignored
  'reason.noSeparator': '序列和替换内容之间没有 "{separator}"',
  'reason.sequenceLineBreak': '序列包含换行',
  'reason.sequenceEmpty': '序列为空',
  'reason.sequenceSpaces': '序列只有空格',
  'reason.sequenceShort': '序列至少需要两个字符',
  'reason.sequenceEmoji': '序列以表情符号或类似字符结尾',
  'reason.replacementLineBreak': '替换内容包含换行',
  'reason.replacementEmpty': '替换内容为空',
  'reason.replacementSame': '替换内容与序列相同',
  'reason.duplicate': '相同的序列已在第 {line} 行',
  'reason.clash': '第 {line} 行的规则已由相同的按键触发',
  'reason.folderFormat': '先写文件夹，然后是 " -> "，然后是规范',
  'reason.noFolder': '"->" 之前没有文件夹',
  'reason.unknownConvention': '未知的规范',

  // Modals
  'modal.preset.title': '选择排版风格',
  'modal.preset.intro': '选一个起点。之后你可以在插件设置中修改每个开关，这些预设也列在那里。',
  'modal.preset.keepDefault': '保持默认',
  'modal.preset.use': '使用“{preset}”',
  'modal.quotes.placeholder': '此笔记的引号',
  'modal.quotes.follow': '沿用文件夹和全局设置（移除该属性）',
  'modal.quotes.straight': '直引号（关闭）',
};

export default zh;
