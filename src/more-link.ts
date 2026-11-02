// Canonical copy: obsidian-dev/tools/more-plugins/more-link.ts. `node tools/more-plugins/link-rollout.mjs
// <clone>...` writes it to `src/more-link.ts` in each plugin; edit it here, never in a plugin.
//
// One settings row, "More plugins and Pro", that opens a web page when the user clicks it. No pop-up,
// no notice, no network request, no counting: the page opens only on a click.
import { getLocale, type Locale } from './i18n.ts';

/** Fixed on purpose: a plain https URL on the author's own site. */
export const MORE_URL = 'https://perezamadorluisenrique-gif.github.io/pro/';

interface MoreText {
	name: string;
	desc: string;
	button: string;
}

const TEXT: Record<Locale, MoreText> = {
	en: { name: 'More plugins and Pro', desc: 'Other plugins by Siulved54, the optional Pro versions and template vaults. Opens a web page.', button: 'Open' },
	zh: { name: '更多插件和 Pro 版', desc: 'Siulved54 的其他插件、可选的 Pro 版本和模板库。将打开一个网页。', button: '打开' },
	ja: { name: 'その他のプラグインと Pro', desc: 'Siulved54 の他のプラグイン、任意の Pro 版、テンプレート Vault。Web ページを開きます。', button: '開く' },
	ko: { name: '더 많은 플러그인과 Pro', desc: 'Siulved54의 다른 플러그인, 선택형 Pro 버전과 템플릿 보관함입니다. 웹 페이지가 열립니다.', button: '열기' },
	es: { name: 'Más plugins y Pro', desc: 'Otros plugins de Siulved54, las versiones Pro opcionales y los vaults de plantillas. Abre una página web.', button: 'Abrir' },
	de: { name: 'Weitere Plugins und Pro', desc: 'Weitere Plugins von Siulved54, die optionalen Pro-Versionen und Vorlagen-Vaults. Öffnet eine Webseite.', button: 'Öffnen' },
	fr: { name: 'Plus de plugins et Pro', desc: 'Les autres plugins de Siulved54, les versions Pro facultatives et les coffres de modèles. Ouvre une page web.', button: 'Ouvrir' },
	'pt-BR': { name: 'Mais plugins e Pro', desc: 'Outros plugins do Siulved54, as versões Pro opcionais e os vaults de modelos. Abre uma página da web.', button: 'Abrir' },
	ru: { name: 'Другие плагины и Pro', desc: 'Другие плагины Siulved54, дополнительные версии Pro и наборы шаблонов. Открывает веб-страницу.', button: 'Открыть' },
};

export function moreText(locale: Locale = getLocale()): MoreText {
	return TEXT[locale] ?? TEXT.en;
}

/** Opens the page. Called only from a click handler. */
export function openMore(): void {
	window.open(MORE_URL, '_blank', 'noopener');
}
