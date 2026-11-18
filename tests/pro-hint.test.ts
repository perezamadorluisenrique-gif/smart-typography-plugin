// Canonical copy: obsidian-dev/tools/more-plugins/pro-hint.test.ts, written to `tests/pro-hint.test.ts`
// by tools/more-plugins/hint-rollout.mjs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { HINT_DEFAULTS, HINT_EVERY_MS, PRO_PAGES, cleanHintSettings, hintDue, hintUrl, hintsOff, markHintShown } from '../src/pro-hint.ts';

const NOW = Date.UTC(2026, 10, 17);
const DAY = 86_400_000;

test('tips are on by default and every place starts due', () => {
	const s = cleanHintSettings(null);
	assert.deepEqual(s, { proHints: true, proHintShown: {} });
	assert.deepEqual(cleanHintSettings({}), s);
	assert.equal(HINT_DEFAULTS.proHints, true);
	assert.equal(hintDue(s, 'ur-update-all', NOW), true);
});

test('a place shows its tip at most once every 14 days, and places do not share the wait', () => {
	assert.equal(HINT_EVERY_MS, 14 * DAY);
	const s = markHintShown(cleanHintSettings(null), 'ur-update-all', NOW);
	assert.equal(hintDue(s, 'ur-update-all', NOW), false);
	assert.equal(hintDue(s, 'ur-update-all', NOW + 13 * DAY), false);
	assert.equal(hintDue(s, 'ur-update-all', NOW + 14 * DAY), true);
	assert.equal(hintDue(s, 'ur-rollback', NOW), true);
});

test('a date in the future does not block the tip forever', () => {
	const s = markHintShown(cleanHintSettings(null), 'ur-update-all', NOW + 365 * DAY);
	assert.equal(hintDue(s, 'ur-update-all', NOW), true);
});

test('turned off, no place is ever due again, and turning off keeps the dates', () => {
	const shown = markHintShown(cleanHintSettings(null), 'tc-cleanup', NOW - 100 * DAY);
	const off = hintsOff(shown);
	assert.equal(off.proHints, false);
	assert.deepEqual(off.proHintShown, shown.proHintShown);
	for (const later of [NOW, NOW + 30 * DAY, NOW + 3650 * DAY]) assert.equal(hintDue(off, 'tc-cleanup', later), false);
	assert.equal(cleanHintSettings(off).proHints, false);
});

test('saved data is cleaned: bad places and bad dates are dropped, anything but false keeps tips on', () => {
	const s = cleanHintSettings({ proHints: 'no', proHintShown: { 'ok-place': 5, 'Bad Place': 6, other: 'x', neg: -1, inf: Infinity } });
	assert.deepEqual(s, { proHints: true, proHintShown: { 'ok-place': 5 } });
	assert.deepEqual(cleanHintSettings({ proHintShown: [1, 2] }).proHintShown, {});
	assert.equal(cleanHintSettings({ proHints: false }).proHints, false);
});

test('functions never change the settings they are given', () => {
	const s = cleanHintSettings(null);
	markHintShown(s, 'sn-export', NOW);
	hintsOff(s);
	assert.deepEqual(s, { proHints: true, proHintShown: {} });
});

test('the link is the public Pro page over https with the place as ref, and nothing else', () => {
	assert.equal(hintUrl('update-radar', 'ur-update-all'), `${PRO_PAGES}update-radar/?ref=ur-update-all`);
	assert.match(PRO_PAGES, /^https:\/\/perezamadorluisenrique-gif\.github\.io\/pro\/$/);
	assert.throws(() => hintUrl('../x', 'ur'));
	assert.throws(() => hintUrl('update-radar', 'a&b=c'));
	assert.equal(hintDue(cleanHintSettings(null), 'Bad place', NOW), false);
});

test('the tip module makes no network request and counts nothing', () => {
	const src = fs.readFileSync(new URL('../src/pro-hint.ts', import.meta.url), 'utf8').replace(/^\s*\/\/.*$/gm, '');
	for (const banned of ['fetch(', 'requestUrl', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'import(', "from 'obsidian'"]) {
		assert.ok(!src.includes(banned), banned);
	}
});
