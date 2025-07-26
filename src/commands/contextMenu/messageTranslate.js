import {
	ApplicationCommandType,
	ContextMenuCommandBuilder,
	ApplicationIntegrationType,
	InteractionContextType,
	MessageFlags,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
} from "discord.js";
import { googleai } from "../../config/Configs.js";
import { emojis } from "../../resources/emojis.js";
import { basePermissions } from "../../resources/BotPermissions.js";
import { checkBotPermissions } from "../../functions/checkPermissions.js";
import { langMap } from "../../resources/languageMap.js";

export default {
	data: new ContextMenuCommandBuilder()
		.setName("Translate")
		.setNameLocalizations({
			it: "Traduci Messaggio",
			tr: "Mesajı Çevir",
			ro: "Traduceți Mesajul",
			el: "Μετάφραση Μηνύματος",
			ChineseCN: "翻译消息",
			"pt-BR": "Traduzir Mensagem",
		})
		.setType(ApplicationCommandType.Message)
		.setIntegrationTypes([
			ApplicationIntegrationType.UserInstall,
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.BotDM,
			InteractionContextType.PrivateChannel,
			InteractionContextType.Guild,
		]),

	execute: async ({ interaction }) => {
		if (interaction.inGuild()) {
			if (!(await checkBotPermissions(interaction, basePermissions)))
				return;
		}

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const message = interaction.options.getMessage("message");
		if (
			!message ||
			typeof message.content !== "string" ||
			message.content.trim() === ""
		) {
			return interaction.editReply({
				content: `${emojis.info} This message seems to hold no content—nothing to translate so... this means nothing to translate. \n-# Message shouldn't be inside an embed or container telling it in case c:`,
			});
		}

		try {
			const inputText = message.content
				.replace(/<a?:.+?:\d{18}>/g, "")
				.trim();

			const fullLocale = interaction.locale || "en-US";
			const intl = new Intl.Locale(fullLocale);
			const rawLang = intl.language.toLowerCase();

			const targetLang =
				langMap[fullLocale.toLowerCase()] ||
				langMap[rawLang] ||
				"english";

			const model = googleai.getGenerativeModel({
				model: "gemma-3n-e4b-it",
				generationConfig: {
					temperature: 0.3,
					maxOutputTokens: 800,
					topP: 1,
					topK: 1,
				},
			});

			const prompt = `
You are a professional translator fluent in both English and the target language (${targetLang}). Your task is to translate messages naturally and accurately into ${targetLang}, preserving the full meaning, tone, and implied emotions as a native speaker of ${targetLang} would express it.

First, clean the original sentence by correcting grammar, spelling, punctuation, and expanding any shorthand or slang (e.g., "asap" → "as soon as possible").

Then translate the cleaned sentence into natural, fluent ${targetLang} that captures the intent and nuance of the original message.

Return exactly two lines, nothing else:

Cleaned: ...
Translated: ...

Message: ${inputText}
`.trim();

			const result = await model.generateContent(prompt);
			const raw = result.response.text().trim();

			const cleanedMatch = raw.match(/Cleaned:\s*(.+)/i);
			const translatedMatch = raw.match(/Translated:\s*(.+)/i);

			const cleaned = cleanedMatch?.[1]?.trim();
			const translated = translatedMatch?.[1]?.trim();

			if (!cleaned || !translated) {
				throw new Error("Malformed response from AI");
			}

			const sectionOriginal = new TextDisplayBuilder().setContent(
				`### ${emojis.globe} Original Message\n${cleaned}`,
			);

			const separator = new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Large)
				.setDivider(true);

			const sectionTranslated = new TextDisplayBuilder().setContent(
				`### ${emojis.swap} Translated\n${translated}`,
			);

			await interaction.editReply({
				components: [sectionOriginal, separator, sectionTranslated],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: { parse: [] },
			});
		} catch (err) {
			console.error(err);
			await interaction.editReply({
				content: `${emojis.error} Failed to translate the message. The system might be confused — try again in a moment.`,
			});
		}
	},
};
