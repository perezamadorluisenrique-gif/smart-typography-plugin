import type { Messages } from '../i18n.ts';

const ko: Messages = {
  // Commands
  'command.toggleNote': '이 노트의 자동 치환 끄기/켜기',
  'command.setQuotes': '이 노트의 따옴표 설정…',
  'command.applyToText': '선택 영역 또는 노트 전체에 조판 적용',

  // Notices
  'notice.substitutionsOff': 'Typography: 이 노트의 자동 치환이 꺼져 있습니다.',
  'notice.substitutionsOn': 'Typography: 이 노트의 자동 치환이 켜져 있습니다.',
  'notice.removedButExcluded':
    'Typography: 속성을 제거했지만, 이 노트는 제외된 폴더에 있어 자동 치환은 계속 꺼져 있습니다.',
  'notice.nothingToChange': 'Typography: 바꿀 내용이 없습니다.',
  'notice.changedLines.one': 'Typography: 1줄을 변경했습니다.',
  'notice.changedLines.other': 'Typography: {count}줄을 변경했습니다.',
  'notice.quotesFollowFolder': 'Typography: 이 노트는 다시 폴더별 설정과 전체 설정의 따옴표를 따릅니다.',
  'notice.quotesSet': 'Typography: 이 노트의 따옴표를 {style}(으)로 설정했습니다.',
  'notice.quotesStraight': 'Typography: 이 노트의 따옴표를 곧은 따옴표로 설정했습니다.',
  'notice.presetApplied': 'Typography: "{preset}" 프리셋을 적용했습니다.',
  'notice.presetRulesPresent': 'Typography: 해당 규칙은 이미 목록에 있습니다.',
  'notice.rulesAdded.one': 'Typography: 규칙 1개를 추가했습니다.',
  'notice.rulesAdded.other': 'Typography: 규칙 {count}개를 추가했습니다.',

  // Quotation mark conventions (the sample characters stay as they are)
  'convention.english': '영어 “ ” ‘ ’',
  'convention.german': '독일어 „ “ ‚ ‘',
  'convention.french': '프랑스어 « » ‹ ›',
  'convention.spanish': '스페인어 « » “ ”',
  'convention.swedish': '스웨덴어 ” ” ’ ’',
  'convention.polish': '폴란드어 „ ” ‚ ’',
  'convention.russian': '러시아어 « » „ “',
  'convention.off': '곧은 따옴표 그대로 두기',

  // Style presets
  'stylePreset.default.label': '기본',
  'stylePreset.default.desc': '둥근 따옴표, 대시, 말줄임표, 화살표, 기호. 자동 대문자 변환은 없습니다.',
  'stylePreset.writer.label': '글쓰기',
  'stylePreset.writer.desc': '산문용: 둥근 따옴표, 대시, 말줄임표, 문장 첫 글자 대문자 변환. 화살표와 수학 기호는 제외합니다.',
  'stylePreset.academic.label': '학술',
  'stylePreset.academic.desc': '화살표와 수학 기호를 포함해 모두 켜고, 자동 대문자 변환도 사용합니다.',
  'stylePreset.developer.label': '개발자(조용히)',
  'stylePreset.developer.desc': '곧은 따옴표와 하이픈은 입력한 그대로 둡니다. 화살표와 수학 기호만 변환합니다.',

  // Rule presets
  'rulePreset.guillemets': '기유메 << >>',
  'rulePreset.symbols': '기호 (c) (r) (tm)',

  // Settings
  'setting.quoteStyle.name': '따옴표',
  'setting.quoteStyle.desc': '곧은 따옴표를 어떤 표기 규칙으로 바꿀지 정합니다. 아포스트로피는 모든 규칙에서 같은 문자이므로 따로 설정합니다.',
  'setting.smartApostrophes.name': '아포스트로피',
  'setting.smartApostrophes.desc': "it's를 it’s로 바꿉니다. 따옴표 설정과 관계없이 동작합니다.",
  'setting.skipClosingQuote.name': '닫는 따옴표 건너뛰기',
  'setting.skipClosingQuote.desc': '닫는 따옴표가 이미 있는 자리에서 닫는 따옴표를 입력하면, 하나를 더 넣지 않고 커서만 그 뒤로 이동합니다.',
  'setting.capitalizeSentences.name': '문장 첫 글자 대문자로',
  'setting.capitalizeSentences.desc':
    '줄의 첫 글자와 . ! ? 뒤에 오는 문장의 첫 글자를 대문자로 입력합니다. 코드, 링크, 태그, 경로 안과 Mr., e.g., etc. 같은 약어 뒤에서는 동작하지 않습니다. 바로 뒤에 Backspace를 누르면 소문자로 되돌아갑니다.',
  'setting.tabOut.name': 'Tab으로 빠져나오기',
  'setting.tabOut.desc':
    '커서가 닫는 따옴표나 괄호 바로 앞에 있을 때 Tab을 누르면 그 뒤로 이동합니다. 목록에서는 Tab이 여전히 들여쓰기를 하고, 표에서는 셀 사이를 이동합니다.',
  'setting.wrapSelection.name': '선택 영역을 따옴표로 감싸기',
  'setting.wrapSelection.desc': '텍스트를 선택하고 따옴표를 입력하면, 텍스트를 바꾸는 대신 둥근 따옴표로 감쌉니다.',
  'setting.dashes.name': '대시',
  'setting.dashes.desc': '--는 –로, ---는 —로 바뀝니다.',
  'setting.ellipsis.name': '말줄임표',
  'setting.ellipsis.desc': '...는 …로 바뀝니다.',
  'setting.arrows.name': '화살표',
  'setting.arrows.desc': '->는 →로, <-는 ←로, <->는 ↔로, =>는 ⇒로 바뀝니다.',
  'setting.mathSymbols.name': '수학 기호',
  'setting.mathSymbols.desc': '>=는 ≥로, <=는 ≤로, !=는 ≠로, +-는 ±로 바뀝니다.',
  'setting.excludedFolders.name': '제외할 폴더',
  'setting.excludedFolders.desc':
    '이 폴더 안의 노트에서는 아무것도 치환하지 않습니다. 한 줄에 폴더 하나씩 적습니다(예: Code 또는 Templates/Raw). 개별 노트는 속성 "typography: off" 또는 "이 노트의 자동 치환 끄기/켜기" 명령으로 제외할 수 있습니다.',
  'setting.useLangProperty.name': '노트의 lang 속성 사용',
  'setting.useLangProperty.desc':
    '"lang: de" 같은 속성이 있는 노트에는 해당 언어의 따옴표(영어, 독일어, 프랑스어, 스페인어, 스웨덴어, 폴란드어, 러시아어)를 적용합니다. 노트에 "typography-quotes"가 따로 있으면 그것이 우선합니다. 이미 가지고 있는 노트에 lang 속성이 있을 수 있어 기본값은 꺼짐입니다.',
  'setting.quotesByFolder.name': '폴더별 따옴표',
  'setting.quotesByFolder.desc':
    '한 줄에 하나씩 폴더, " -> ", 표기 규칙 순으로 적습니다(예: Deutsch -> german). 가장 구체적인 폴더가 우선합니다. 노트의 "lang" 속성(위 스위치를 켠 경우)과 "typography-quotes" 속성은 폴더 설정보다 우선합니다. 표기 규칙: english, german, french, spanish, swedish, polish, russian, 곧은 따옴표는 off.',
  'setting.customRules.name': '직접 만든 치환',
  'setting.customRules.desc':
    '한 줄에 규칙 하나씩, 입력할 문자, " -> ", 바뀔 문자 순으로 적습니다(예: (c) -> ©). 규칙은 입력열의 마지막 문자를 입력하는 순간 적용되며, 위의 규칙과 같은 위치에서 동작합니다. 바로 뒤에 Backspace를 누르면 입력한 문자로 되돌아갑니다. 위의 규칙이 먼저이며, 위 규칙이 처리하는 입력열은 해당 스위치가 꺼져 있을 때만 직접 만든 규칙이 사용됩니다. 입력열은 2자 이상이어야 합니다.',
  'setting.stylePreset.name': '스타일 프리셋',
  'setting.stylePreset.desc': '위의 스위치를 한 번에 설정합니다: 글쓰기, 학술, 개발자(조용히), 기본. 폴더, 따옴표 스타일(개발자 제외), 직접 만든 치환은 그대로 유지됩니다.',
  'setting.rulePreset.name': '프리셋 추가',
  'setting.rulePreset.desc': '미리 만들어진 규칙 묶음을 목록에 추가합니다. 이미 있는 규칙은 그대로 둡니다. >>는 중첩 인용을 여는 줄의 맨 앞에서는 절대 치환되지 않습니다.',
  'setting.keepsOut.name': '치환하지 않는 곳',
  'setting.keepsOut.desc':
    '코드 블록, 인라인 코드, 수식, 링크 대상, 프론트매터, HTML 태그와 주석, Templater 표현식은 입력한 그대로 둡니다. 치환 직후에 Backspace를 누르면 입력한 문자로 되돌아갑니다.',
  'setting.folderStatus.name': '사용 중인 폴더',
  'setting.rulesStatus.name': '사용 중인 규칙',

  // Status lines under the text areas
  'status.noFolders': '아직 폴더가 없습니다.',
  'status.folders.one': '폴더 1개를 사용 중입니다.',
  'status.folders.other': '폴더 {count}개를 사용 중입니다.',
  'status.noRules': '아직 규칙이 없습니다.',
  'status.rules.one': '규칙 1개를 사용 중입니다.',
  'status.rules.other': '규칙 {count}개를 사용 중입니다.',
  'status.ignored': '무시됨, {line}번째 줄({text}): {reason}.',

  // Why a line of the custom rules is ignored
  'reason.noSeparator': '입력열과 바뀔 문자 사이에 "{separator}"가 없습니다',
  'reason.sequenceLineBreak': '입력열에 줄바꿈이 있습니다',
  'reason.sequenceEmpty': '입력열이 비어 있습니다',
  'reason.sequenceSpaces': '입력열이 공백뿐입니다',
  'reason.sequenceShort': '입력열은 2자 이상이어야 합니다',
  'reason.sequenceEmoji': '입력열이 이모지 등의 문자로 끝납니다',
  'reason.replacementLineBreak': '바뀔 문자에 줄바꿈이 있습니다',
  'reason.replacementEmpty': '바뀔 문자가 비어 있습니다',
  'reason.replacementSame': '바뀔 문자가 입력열과 같습니다',
  'reason.duplicate': '같은 입력열이 이미 {line}번째 줄에 있습니다',
  'reason.clash': '{line}번째 줄의 규칙이 이미 같은 키 입력에 적용됩니다',
  'reason.folderFormat': '폴더, " -> ", 표기 규칙 순으로 적으세요',
  'reason.noFolder': '"->" 앞에 폴더가 없습니다',
  'reason.unknownConvention': '알 수 없는 표기 규칙입니다',

  // Modals
  'modal.preset.title': '조판 스타일 선택',
  'modal.preset.intro': '시작점을 고르세요. 모든 스위치는 나중에 플러그인 설정에서 바꿀 수 있으며, 이 프리셋도 거기에 있습니다.',
  'modal.preset.keepDefault': '기본값 유지',
  'modal.preset.use': '"{preset}" 사용',
  'modal.quotes.placeholder': '이 노트의 따옴표',
  'modal.quotes.follow': '폴더별 설정과 전체 설정 따르기(속성 제거)',
  'modal.quotes.straight': '곧은 따옴표(끔)',
};

export default ko;
