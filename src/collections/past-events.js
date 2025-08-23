import { defineCollection } from 'astro:content';

import { z } from 'astro:content';

import { marked } from 'marked';
import purify from '../utils/purify';

export default defineCollection({
	loader: async function (context) {
		const url = 'https://github.com/web-and-wine/talks/raw/refs/heads/main/README.md';
		const base = 'https://github.com/web-and-wine/talks';
		const res = await fetch(url);
		const rawMd = await res.text();
		const purified = purify(marked(rawMd), { RETURN_DOM: true });

		// Parse DOM structure into nested object
		const events = [];
		let currentEvent = null;

		// Get all child nodes from the purified DOM
		const nodes = Array.from(purified.children);

		for (const node of nodes) {
			if (node.tagName === 'H3') {
				// Parse header: "MONTH YEAR (sponsor)" or "MONTH YEAR"
				const headerText = node.textContent.trim();
				const match = headerText.match(/^(\w+)\s+(\d{4})(?:\s+\((.+)\))?$/);

				if (match) {
					const [, month, year, sponsor] = match;

					currentEvent = {
						year: parseInt(year),
						month: month,
						sponsor: sponsor ? { name: sponsor.replace(/^bei\s/, '') } : undefined,
						talks: []
					};
					events.push(currentEvent);
				}
			} else if (node.tagName === 'UL' && currentEvent) {
				const listItems = Array.from(node.querySelectorAll('li'));

				for (const li of listItems) {
					const link = li.querySelector('a');
					let title = '';
					let speaker = '';
					let href = undefined;

					if (link) {
						const rawHref = link.getAttribute('href');
						if (rawHref) {
							// Convert relative URLs to absolute using base option
							if (base && !rawHref.startsWith('http') && !rawHref.startsWith('mailto') && !rawHref.startsWith('#')) {
								href = new URL(rawHref, base).href;
							} else {
								href = rawHref;
							}
						}
					}

					const textContent = li.textContent.trim();

					if (link) {
						title = link.textContent.trim();

						// Extract author from remaining text after link
						const clonedLi = li.cloneNode(true);
						const clonedLink = clonedLi.querySelector('a');
						if (clonedLink) {
							clonedLink.remove();
						}

						// Remove checkbox
						const checkbox = clonedLi.querySelector('input[type="checkbox"]');
						if (checkbox) {
							checkbox.remove();
						}

						let remainingText = clonedLi.textContent.trim();

						// Extract speaker name from parentheses
						const speakerMatch = remainingText.match(/\(([^)]+)\)/);
						if (speakerMatch) {
							speaker = speakerMatch[1];
						}
					} else {
						// For entries without links, extract title and speaker from text
						const speakerMatch = textContent.match(/^(.+?)\s+(.+)$/);

						if (speakerMatch) {
							const [, possibleTitle, possibleSpeaker] = speakerMatch;

							// Check if possibleSpeaker looks like a speaker name (no spaces or simple name)
							if (possibleSpeaker.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/)) {
								title = possibleTitle.trim();
								speaker = possibleSpeaker.trim();
							} else {
								// Fallback to original logic for complex cases
								const match = textContent.match(/^(.+?)(?:\s*\([^)]+\)\s*)?$/);
								title = match ? match[1].trim() : textContent;

								const parenthesesMatch = textContent.match(/\(([^)]+)\)/);
								if (parenthesesMatch) {
									speaker = parenthesesMatch[1];
								}
							}
						} else {
							title = textContent;
						}
					}

					if (title || speaker) {
						currentEvent.talks.push({
							title,
							href,
							speaker: speaker.replace(/^von\s/, ''),
						});
					}
				}
			}
		}

		return events.map(event => ({
			id: `${event.year}-${event.month}`,
			...event,
		}));
	},
	schema:z.object({
		id: z.string(),
		year: z.number(),
		month: z.string(),
		sponsor: z.object({
			name: z.string()
		}).optional(),
		talks: z.array(z.object({
			title: z.string(),
			href: z.string().optional(),
			author: z.string().optional()
		}))
	}),
});
