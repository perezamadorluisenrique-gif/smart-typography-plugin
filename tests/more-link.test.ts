// Canonical copy: obsidian-dev/tools/more-plugins/more-link.test.ts, written to `tests/more-link.test.ts`
// by tools/more-plugins/link-rollout.mjs.
import assert from 'node:assert/strict';
import test from 'node:test';

import { LOCALES } from '../src/i18n.ts';
import { MORE_URL, moreText } from '../src/more-link.ts';

test('the link is a fixed https URL on the author\'s own site', () => {
	const url = new URL(MORE_URL);
	assert.equal(url.protocol, 'https:');
	assert.equal(url.host, 'perezamadorluisenrique-gif.github.io');
	assert.equal(url.search, '');
});

for (const locale of LOCALES) {
	test(`${locale} has the three texts`, () => {
		const text = moreText(locale);
		assert.ok(text.name && text.desc && text.button);
		assert.ok(!/[<>]/.test(text.name + text.desc + text.button));
	});
}
