/**
 * Extracts the emoji ID from a Discord emoji string and returns the CDN URL.
 * @param {string} emojiString - The emoji string (e.g., "<:bubblelock:1398380591300218881>")
 * @param {number} [size=64] - The size of the emoji image (default: 64)
 * @returns {string} The Discord CDN URL for the emoji image
 */
export function getEmojiUrl(emojiString, size = 64) {
	const fallbackEmojiId = "1353817612525637734";
	if (!emojiString || typeof emojiString !== "string") {
		console.warn(
			`getEmojiUrl: Invalid or undefined emoji string: ${emojiString}, using fallback`,
		);
		return `https://cdn.discordapp.com/emojis/${fallbackEmojiId}.png?size=${size}`;
	}

	const emojiId = emojiString.match(/:(\d+)>/)?.[1];
	if (!emojiId) {
		console.warn(
			`getEmojiUrl: Failed to extract emoji ID from "${emojiString}", using fallback`,
		);
		return `https://cdn.discordapp.com/emojis/${fallbackEmojiId}.png?size=${size}`;
	}

	const url = `https://cdn.discordapp.com/emojis/${emojiId}.png?size=${size}`;
	console.debug(`getEmojiUrl: Generated URL: ${url}`);
	return url;
}
