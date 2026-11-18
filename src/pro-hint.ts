// Canonical copy: obsidian-dev/tools/more-plugins/pro-hint.ts. `node tools/more-plugins/hint-rollout.mjs
// <clone>...` writes it to `src/pro-hint.ts`, its test to `tests/pro-hint.test.ts` and `pro-hint.css` into
// `styles.css` (between the pro-hint markers) in each plugin that
// shows a Pro tip. Edit it here, never in a plugin.
//
// A Pro tip is one line of fixed text, bundled with the plugin, shown only inside the plugin's own view or
// dialog, right where the user is doing the thing that the paid companion extends. Obsidian's developer
// policies allow static ads inside a plugin's own interface when the README says so; they forbid dynamic
// ads and client-side telemetry. So:
// - no network request and no counting: the only thing kept is when each tip was last shown, in data.json;
// - each place shows its tip at most once every 14 days;
// - the line has a "Don't show again" button, and a setting turns every tip off; once off, they never return;
// - "Learn more" opens the public Pro page with `?ref=<place>`, so the page knows which tip was used.
// This file never imports `obsidian`, so it runs under plain Node in the plugin's tests.

/** How long a place waits before it may show its tip again. */
export const HINT_EVERY_MS = 14 * 86_400_000;

/** The public Pro pages (they work even while the shop is closed). */
export const PRO_PAGES = 'https://perezamadorluisenrique-gif.github.io/pro/';

/** The two fields each plugin adds to its settings, next to its own. */
export interface HintSettings {
	/** "Show Pro tips". On by default; off for good once the user turns it off. */
	proHints: boolean;
	/** When each place last showed its tip (ms since epoch). */
	proHintShown: Record<string, number>;
}

export const HINT_DEFAULTS: Readonly<HintSettings> = Object.freeze({ proHints: true, proHintShown: Object.freeze({}) });

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** The two fields from saved data, whatever shape it has (missing, old or edited by hand). */
export function cleanHintSettings(raw: { proHints?: unknown; proHintShown?: unknown } | null | undefined): HintSettings {
	const shown: Record<string, number> = {};
	const saved = raw?.proHintShown;
	if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
		for (const [place, when] of Object.entries(saved as Record<string, unknown>)) {
			if (SLUG.test(place) && typeof when === 'number' && Number.isFinite(when) && when > 0) shown[place] = when;
		}
	}
	return { proHints: raw?.proHints !== false, proHintShown: shown };
}

/** True when this place may show its tip now: tips are on and it was not shown in the last 14 days. */
export function hintDue(s: HintSettings, place: string, now: number = Date.now()): boolean {
	if (!s.proHints || !SLUG.test(place)) return false;
	const last = s.proHintShown[place] ?? 0;
	// A date in the future (a clock that was wrong) counts as "long ago", so the tip is not stuck forever.
	return last > now || now - last >= HINT_EVERY_MS;
}

/** The settings after this place showed its tip. */
export function markHintShown(s: HintSettings, place: string, now: number = Date.now()): HintSettings {
	return { proHints: s.proHints, proHintShown: { ...s.proHintShown, [place]: now } };
}

/** The settings after "Don't show again". */
export function hintsOff(s: HintSettings): HintSettings {
	return { proHints: false, proHintShown: { ...s.proHintShown } };
}

/** The public page of one Pro (`update-radar`, `book-studio`...) with the place as `ref`. */
export function hintUrl(page: string, place: string): string {
	if (!SLUG.test(page) || !SLUG.test(place)) throw new Error(`Bad Pro page or place: ${page} ${place}`);
	return `${PRO_PAGES}${page}/?ref=${place}`;
}

/** The words of one tip, from the plugin's own translations. */
export interface HintText {
	/** The tip itself, one sentence or two. */
	line: string;
	/** The button that opens the Pro page ("Learn more"). */
	more: string;
	/** The button that turns every tip off ("Don't show again"). */
	off: string;
}

/**
 * Draws the tip as the last child of `parent` and returns it. `onOff` saves `hintsOff(...)`; the line removes
 * itself. `open` defaults to `window.open`, which Obsidian sends to the system browser.
 */
export function renderHint(
	parent: HTMLElement,
	text: HintText,
	url: string,
	onOff: () => unknown,
	open: (url: string) => unknown = (u) => window.open(u),
): HTMLElement {
	const box = parent.createDiv({ cls: 'siulved-pro-hint' });
	box.setAttr('role', 'note');
	box.createSpan({ cls: 'siulved-pro-hint-text', text: text.line });
	const actions = box.createDiv({ cls: 'siulved-pro-hint-actions' });
	const more = actions.createEl('button', { text: text.more, cls: 'siulved-pro-hint-more' });
	more.addEventListener('click', () => void open(url));
	const off = actions.createEl('button', { text: text.off, cls: 'siulved-pro-hint-off' });
	off.addEventListener('click', () => {
		box.remove();
		void onOff();
	});
	return box;
}
