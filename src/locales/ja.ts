import type { Messages } from '../i18n.ts';

const ja: Messages = {
  // Commands
  'command.toggleNote': 'このノートの自動置換をオフ／オンにする',
  'command.setQuotes': 'このノートの引用符を設定…',
  'command.applyToText': '選択範囲またはノート全体に組版を適用',

  // Notices
  'notice.substitutionsOff': 'Typography: このノートの自動置換はオフです。',
  'notice.substitutionsOn': 'Typography: このノートの自動置換はオンです。',
  'notice.removedButExcluded':
    'Typography: プロパティを削除しましたが、このノートは除外フォルダ内にあるため、自動置換はオフのままです。',
  'notice.nothingToChange': 'Typography: 変更する箇所はありません。',
  'notice.changedLines.one': 'Typography: 1 行を変更しました。',
  'notice.changedLines.other': 'Typography: {count} 行を変更しました。',
  'notice.quotesFollowFolder': 'Typography: このノートは再びフォルダ設定と全体設定の引用符に従います。',
  'notice.quotesSet': 'Typography: このノートの引用符を {style} にしました。',
  'notice.quotesStraight': 'Typography: このノートの引用符をストレート引用符にしました。',
  'notice.presetApplied': 'Typography: プリセット「{preset}」を適用しました。',
  'notice.presetRulesPresent': 'Typography: それらのルールはすでにリストにあります。',
  'notice.rulesAdded.one': 'Typography: ルールを 1 件追加しました。',
  'notice.rulesAdded.other': 'Typography: ルールを {count} 件追加しました。',

  // Quotation mark conventions (the sample characters stay as they are)
  'convention.english': '英語 “ ” ‘ ’',
  'convention.german': 'ドイツ語 „ “ ‚ ‘',
  'convention.french': 'フランス語 « » ‹ ›',
  'convention.spanish': 'スペイン語 « » “ ”',
  'convention.swedish': 'スウェーデン語 ” ” ’ ’',
  'convention.polish': 'ポーランド語 „ ” ‚ ’',
  'convention.russian': 'ロシア語 « » „ “',
  'convention.off': 'ストレート引用符はそのままにする',

  // Style presets
  'stylePreset.default.label': 'デフォルト',
  'stylePreset.default.desc': 'スマート引用符、ダッシュ、三点リーダー、矢印、記号。自動の大文字化はなし。',
  'stylePreset.writer.label': 'ライター',
  'stylePreset.writer.desc': '文章向け: スマート引用符、ダッシュ、三点リーダー、各文の先頭の大文字化。矢印と数学記号はなし。',
  'stylePreset.academic.label': 'アカデミック',
  'stylePreset.academic.desc': '矢印と数学記号を含むすべてをオンにし、自動の大文字化も行います。',
  'stylePreset.developer.label': '開発者（控えめ）',
  'stylePreset.developer.desc': 'ストレート引用符とハイフンは入力したまま。矢印と数学記号だけを変換します。',

  // Rule presets
  'rulePreset.guillemets': 'ギュメ << >>',
  'rulePreset.symbols': '記号 (c) (r) (tm)',

  // Settings
  'setting.quoteStyle.name': '引用符',
  'setting.quoteStyle.desc':
    'ストレート引用符をどの表記規則に変換するか。アポストロフィはどの規則でも同じ文字なので、別に設定します。',
  'setting.smartApostrophes.name': 'アポストロフィ',
  'setting.smartApostrophes.desc': "it's を it’s にします。引用符の設定にかかわらず動作します。",
  'setting.skipClosingQuote.name': '閉じ引用符を飛び越える',
  'setting.skipClosingQuote.desc': 'すでに閉じ引用符がある位置で閉じ引用符を入力すると、2 つ目を追加せずにカーソルがその後ろへ移動します。',
  'setting.capitalizeSentences.name': '文頭を大文字にする',
  'setting.capitalizeSentences.desc':
    '行頭、および . ! ? の後の文頭の文字を大文字で入力します。コード、リンク、タグ、パスの中や、Mr.、e.g.、etc. などの略語の後では動作しません。直後に Backspace を押すと小文字に戻ります。',
  'setting.tabOut.name': 'Tab で抜け出す',
  'setting.tabOut.desc':
    'カーソルが閉じ引用符や閉じ括弧の直前にあるとき、Tab でその後ろへ移動します。リストでは Tab は引き続きインデントに、表ではセル間の移動に使われます。',
  'setting.wrapSelection.name': '選択範囲を引用符で囲む',
  'setting.wrapSelection.desc': 'テキストを選択して引用符を入力すると、置き換えずにスマート引用符で囲みます。',
  'setting.dashes.name': 'ダッシュ',
  'setting.dashes.desc': '-- を – に、--- を — にします。',
  'setting.ellipsis.name': '三点リーダー',
  'setting.ellipsis.desc': '... を … にします。',
  'setting.arrows.name': '矢印',
  'setting.arrows.desc': '-> を →、<- を ←、<-> を ↔、=> を ⇒ にします。',
  'setting.mathSymbols.name': '数学記号',
  'setting.mathSymbols.desc': '>= を ≥、<= を ≤、!= を ≠、+- を ± にします。',
  'setting.excludedFolders.name': '除外フォルダ',
  'setting.excludedFolders.desc':
    'これらのフォルダ内のノートでは何も置換しません。1 行に 1 フォルダ（例: Code や Templates/Raw）。個別のノートは、プロパティ "typography: off" またはコマンド「このノートの自動置換をオフ／オンにする」で対象外にできます。',
  'setting.useLangProperty.name': 'ノートの lang プロパティを使う',
  'setting.useLangProperty.desc':
    '"lang: de" のようなプロパティを持つノートには、その言語の引用符（英語、ドイツ語、フランス語、スペイン語、スウェーデン語、ポーランド語、ロシア語）を使います。ただし、ノート自身に "typography-quotes" がある場合はそちらが優先されます。既存のノートに lang プロパティが付いている可能性があるため、初期設定ではオフです。',
  'setting.quotesByFolder.name': 'フォルダごとの引用符',
  'setting.quotesByFolder.desc':
    '1 行に 1 件、フォルダ、" -> "、表記規則の順に書きます（例: Deutsch -> german）。より具体的なフォルダが優先されます。ノートの "lang" プロパティ（上のスイッチがオンの場合）と "typography-quotes" プロパティは、フォルダ設定より優先されます。表記規則: english、german、french、spanish、swedish、polish、russian、ストレート引用符にする場合は off。',
  'setting.customRules.name': '独自の置換',
  'setting.customRules.desc':
    '1 行に 1 つのルールを、入力する文字、" -> "、変換後の文字の順に書きます（例: (c) -> ©）。ルールは並びの最後の文字を入力した時点で働き、上のルールと同じ場所で有効です。直後に Backspace を押すと入力した文字に戻ります。上のルールが優先され、それらも扱う並びは、そのスイッチがオフの間だけ独自ルールが使われます。並びは 2 文字以上必要です。',
  'setting.stylePreset.name': 'スタイルプリセット',
  'setting.stylePreset.desc':
    '上のスイッチをまとめて設定します: ライター、アカデミック、開発者（控えめ）、デフォルト。フォルダ、引用符のスタイル（開発者を除く）、独自の置換は保持されます。',
  'setting.rulePreset.name': 'プリセットを追加',
  'setting.rulePreset.desc':
    '用意されたルールのセットをリストに追加します。すでにあるルールはそのままです。>> は、入れ子の引用を始める行頭では置換されません。',
  'setting.keepsOut.name': '置換しない場所',
  'setting.keepsOut.desc':
    'コードブロック、インラインコード、数式、リンク先、フロントマター、HTML タグとコメント、Templater の式は、入力したままになります。置換の直後に Backspace を押すと入力した文字に戻ります。',
  'setting.folderStatus.name': '有効なフォルダ',
  'setting.rulesStatus.name': '有効なルール',

  // Status lines under the text areas
  'status.noFolders': 'フォルダはまだありません。',
  'status.folders.one': '1 件のフォルダが有効です。',
  'status.folders.other': '{count} 件のフォルダが有効です。',
  'status.noRules': 'ルールはまだありません。',
  'status.rules.one': '1 件のルールが有効です。',
  'status.rules.other': '{count} 件のルールが有効です。',
  'status.ignored': '無視: {line} 行目（{text}）: {reason}。',

  // Why a line of the custom rules is ignored
  'reason.noSeparator': '並びと置換後の文字の間に "{separator}" がありません',
  'reason.sequenceLineBreak': '並びに改行が含まれています',
  'reason.sequenceEmpty': '並びが空です',
  'reason.sequenceSpaces': '並びが空白だけです',
  'reason.sequenceShort': '並びは 2 文字以上必要です',
  'reason.sequenceEmoji': '並びの末尾が絵文字などの文字です',
  'reason.replacementLineBreak': '置換後の文字に改行が含まれています',
  'reason.replacementEmpty': '置換後の文字が空です',
  'reason.replacementSame': '置換後の文字が並びと同じです',
  'reason.duplicate': '同じ並びがすでに {line} 行目にあります',
  'reason.clash': '{line} 行目のルールがすでに同じキー入力で働きます',
  'reason.folderFormat': 'フォルダ、" -> "、表記規則の順に書いてください',
  'reason.noFolder': '"->" の前にフォルダがありません',
  'reason.unknownConvention': '不明な表記規則です',

  // Modals
  'modal.preset.title': '組版スタイルを選択',
  'modal.preset.intro': '出発点を選んでください。スイッチはあとからプラグインの設定ですべて変更でき、これらのプリセットもそこに並んでいます。',
  'modal.preset.keepDefault': 'デフォルトのままにする',
  'modal.preset.use': '「{preset}」を使う',
  'modal.quotes.placeholder': 'このノートの引用符',
  'modal.quotes.follow': 'フォルダ設定と全体設定に従う（プロパティを削除）',
  'modal.quotes.straight': 'ストレート引用符（オフ）',
};

export default ja;
