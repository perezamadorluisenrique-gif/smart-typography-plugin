// Canonical copy: obsidian-dev/tools/more-plugins/more-link.ts. `node tools/more-plugins/link-rollout.mjs
// <clone>...` writes it to `src/more-link.ts` in each plugin, next to a generated `src/more-list.ts` (the
// three picks for that plugin, built from plugins.json). Edit it here, never in a plugin.
//
// A small "More plugins by Siulved54" block at the end of the settings tab: up to three other free plugins,
// each with a one-line description and a View button. The button opens that plugin's page inside Obsidian
// (obsidian://show-plugin). Plugins listed in pro.json also get one last row, "Pro and templates", whose button
// opens the public Pro page in the browser (with `?ref=more-<id>`). No pop-up, no notice, no network request,
// no counting: nothing happens until a click.
import { PICKS, PRO_PAGE } from './more-list.ts';

export interface MorePick {
	id: string;
	name: string;
	desc: string;
}

/** The parts of Obsidian's `Setting` and `ButtonComponent` used here, so this file never imports `obsidian`. */
export interface ButtonLike {
	setButtonText(text: string): this;
	onClick(callback: () => unknown): this;
}
export interface SettingLike {
	setName(name: string): this;
	setDesc(desc: string): this;
	setHeading(): this;
	addButton(callback: (button: ButtonLike) => unknown): this;
}

interface MoreText {
	heading: string;
	button: string;
	pro: string;
	proDesc: string;
}

const ENGLISH: MoreText = {
	heading: 'More plugins by Siulved54',
	button: 'View',
	pro: 'Pro and templates',
	proDesc: 'Optional paid extras, one-time payment. Everything in the free plugins stays free.',
};

const TEXT: Record<string, MoreText | undefined> = {
	en: ENGLISH,
	zh: { heading: 'Siulved54 的更多插件', button: '查看', pro: 'Pro 与模板', proDesc: '可选的付费扩展，一次性付款。免费插件中的一切仍然免费。' },
	ja: { heading: 'Siulved54 のその他のプラグイン', button: '表示', pro: 'Pro とテンプレート', proDesc: '任意の有料拡張、買い切り。無料プラグインの機能はすべて無料のままです。' },
	ko: { heading: 'Siulved54의 다른 플러그인', button: '보기', pro: 'Pro 및 템플릿', proDesc: '선택형 유료 확장, 한 번 결제. 무료 플러그인의 기능은 모두 계속 무료입니다.' },
	es: { heading: 'Más plugins de Siulved54', button: 'Ver', pro: 'Pro y plantillas', proDesc: 'Extras de pago opcionales, pago único. Todo lo de los plugins gratis sigue gratis.' },
	de: { heading: 'Weitere Plugins von Siulved54', button: 'Ansehen', pro: 'Pro und Vorlagen', proDesc: 'Optionale kostenpflichtige Extras, einmalige Zahlung. Alles in den kostenlosen Plugins bleibt kostenlos.' },
	fr: { heading: 'Autres plugins de Siulved54', button: 'Voir', pro: 'Pro et modèles', proDesc: 'Extras payants facultatifs, paiement unique. Tout ce qui est dans les plugins gratuits reste gratuit.' },
	'pt-BR': { heading: 'Mais plugins do Siulved54', button: 'Ver', pro: 'Pro e modelos', proDesc: 'Extras pagos opcionais, pagamento único. Tudo nos plugins gratuitos continua gratuito.' },
	ru: { heading: 'Другие плагины Siulved54', button: 'Открыть', pro: 'Pro и шаблоны', proDesc: 'Необязательные платные дополнения, разовая оплата. Всё в бесплатных плагинах остаётся бесплатным.' },
};

/** The text for an Obsidian language code ("es", "pt-BR", "en-GB"...); English when unknown. */
export function moreText(lang: string = defaultLang()): MoreText {
	return TEXT[lang] ?? TEXT[lang.split('-')[0] ?? ''] ?? ENGLISH;
}

function defaultLang(): string {
	return (typeof document !== 'undefined' && document.documentElement.lang) || 'en';
}

/** Fixed on purpose: Obsidian's own link to a community plugin's page, from the generated list only. */
export function moreUrl(id: string): string {
	return `obsidian://show-plugin?id=${encodeURIComponent(id)}`;
}

export function morePicks(): readonly MorePick[] {
	return PICKS;
}

/** The Pro row's page, only when it is the public Pro page over https; otherwise there is no Pro row. */
export function proPage(page: string | null = PRO_PAGE): string | null {
	return page && /^https:\/\/perezamadorluisenrique-gif\.github\.io\/pro\/(\?ref=more-[a-z0-9-]+)?$/.test(page) ? page : null;
}

/** Opens the public Pro page in the browser. Called only from a click handler. */
export function openPro(): void {
	const page = proPage();
	if (page) window.open(page);
}

/** Opens a plugin's page in Obsidian. Called only from a click handler. */
export function openMore(id: string): void {
	if (PICKS.some((p) => p.id === id)) window.open(moreUrl(id));
}

/** Pre-1.13 settings tab: appends the block to `display()`. `make` is `(el) => new Setting(el)`. */
export function renderMore(containerEl: HTMLElement, make: (el: HTMLElement) => SettingLike, lang?: string): void {
	if (!PICKS.length) return;
	const text = moreText(lang);
	make(containerEl).setName(text.heading).setHeading();
	for (const pick of PICKS) {
		make(containerEl)
			.setName(pick.name)
			.setDesc(pick.desc)
			.addButton((b) => b.setButtonText(text.button).onClick(() => openMore(pick.id)));
	}
	if (proPage()) {
		make(containerEl)
			.setName(text.pro)
			.setDesc(text.proDesc)
			.addButton((b) => b.setButtonText(text.button).onClick(() => openPro()));
	}
}

/** Settings 1.13+: the same block as one group of definitions. Cast to `SettingDefinitionItem[]` in main.ts. */
export function moreDefinitions(lang?: string): unknown[] {
	if (!PICKS.length) return [];
	const text = moreText(lang);
	return [
		{
			type: 'group',
			heading: text.heading,
			items: [
				...PICKS.map((pick) => ({
					name: pick.name,
					desc: pick.desc,
					searchable: false,
					render: (setting: SettingLike) => {
						setting.addButton((b) => b.setButtonText(text.button).onClick(() => openMore(pick.id)));
					},
				})),
				...(proPage()
					? [
							{
								name: text.pro,
								desc: text.proDesc,
								searchable: false,
								render: (setting: SettingLike) => {
									setting.addButton((b) => b.setButtonText(text.button).onClick(() => openPro()));
								},
							},
						]
					: []),
			],
		},
	];
}
