import {
	SlashCommandBuilder,
	ApplicationIntegrationType,
	InteractionContextType,
	MessageFlags,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} from "discord.js";
import { googleai } from "../../config/Configs.js";
import { emojis } from "../../resources/emojis.js";
import { langMap } from "../../resources/languageMap.js";

export default {
	data: new SlashCommandBuilder()
		.setName("writing")
		.setNameLocalizations({
			tr: "yazım",
			"zh-CN": "写作",
			"pt-BR": "escrita",
			de: "schreiben",
		})
		.setDescription("AI-powered writing assistant")
		.setDescriptionLocalizations({
			tr: "Yapay zekâ destekli yazım asistanı",
			"zh-CN": "AI 驱动的写作助手",
			"pt-BR": "Assistente de escrita com IA",
			de: "KI-gestützter Schreibassistent",
		})
		.setIntegrationTypes([
			ApplicationIntegrationType.UserInstall,
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.BotDM,
			InteractionContextType.PrivateChannel,
			InteractionContextType.Guild,
		])
		.addSubcommand((sub) =>
			sub
				.setName("rewrite")
				.setNameLocalizations({
					tr: "yeniden-yaz",
					"zh-CN": "重写",
					"pt-BR": "reescrever",
					de: "umschreiben",
				})
				.setDescription("Rewrite your text in a specific tone/style")
				.setDescriptionLocalizations({
					tr: "Metninizi belirli bir üslupta yeniden yaz",
					"zh-CN": "以特定语气/风格改写你的文本",
					"pt-BR": "Reescreva seu texto em um tom/estilo específico",
					de: "Schreibe deinen Text in einem bestimmten Ton/Stil um",
				})
				.addStringOption((opt) =>
					opt
						.setName("text")
						.setNameLocalizations({
							tr: "metin",
							"zh-CN": "文本",
							"pt-BR": "texto",
							de: "text",
						})
						.setDescription("Your original text")
						.setDescriptionLocalizations({
							tr: "Orijinal metniniz",
							"zh-CN": "你的原始文本",
							"pt-BR": "Seu texto original",
							de: "Dein ursprünglicher Text",
						})
						.setRequired(true),
				)
				.addStringOption((opt) =>
					opt
						.setName("style")
						.setNameLocalizations({
							tr: "stil",
							"zh-CN": "风格",
							"pt-BR": "estilo",
							de: "stil",
						})
						.setDescription("Tone/Style to apply")
						.setDescriptionLocalizations({
							tr: "Uygulanacak üslup/stil",
							"zh-CN": "要应用的语气/风格",
							"pt-BR": "Tom/estilo a aplicar",
							de: "Ton/Stil zum Anwenden",
						})
						.addChoices(
							{
								name: "😀 Friendly",
								value: "friendly",
								// choices'te name_localizations pek desteklenmeyebilir, burayı kaldırabiliriz
							},
							{
								name: "💼 Professional",
								value: "professional",
							},
							{
								name: "✂️ Concise",
								value: "concise",
							},
							{
								name: "📈 Expand",
								value: "expand",
							},
						),
				),
		)
		.addSubcommand((sub) =>
			sub
				.setName("proofread")
				.setNameLocalizations({
					tr: "yazım-düzelt",
					"zh-CN": "校对",
					"pt-BR": "revisão",
					de: "korrektur",
				})
				.setDescription(
					"Proofread and correct grammar, clarity, structure",
				)
				.setDescriptionLocalizations({
					tr: "Yazım, dil bilgisi ve yapı hatalarını düzelt",
					"zh-CN": "校对并纠正语法、清晰度和结构",
					"pt-BR":
						"Revisar e corrigir gramática, clareza e estrutura",
					de: "Korrigiere Grammatik, Klarheit und Struktur",
				})
				.addStringOption((opt) =>
					opt
						.setName("text")
						.setNameLocalizations({
							tr: "metin",
							"zh-CN": "文本",
							"pt-BR": "texto",
							de: "text",
						})
						.setDescription("Text to proofread")
						.setDescriptionLocalizations({
							tr: "Düzenlenecek metin",
							"zh-CN": "需要校对的文本",
							"pt-BR": "Texto a ser revisado",
							de: "Zu korrigierender Text",
						})
						.setRequired(true),
				),
		),
	execute: async ({ interaction }) => {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const subcommand = interaction.options.getSubcommand();
		const input = interaction.options.getString("text");
		const style = interaction.options.getString("style");

		// Detect user's language via interaction locale
		const userLocale = interaction.locale?.toLowerCase();
		const userLang = langMap[userLocale] || "english";

		let prompt = "";

		switch (subcommand) {
			case "rewrite":
				let styleInstruction = "";
				switch (style) {
					case "friendly":
						styleInstruction = "a friendly, approachable";
						break;
					case "professional":
						styleInstruction = "a professional, formal";
						break;
					case "concise":
						styleInstruction = "a concise and clear";
						break;
					case "expand":
						styleInstruction = "an expanded, detailed";
						break;
					default:
						styleInstruction = "a professional, formal";
				}
				prompt = `The user speaks ${userLang}. Rewrite the following text strictly in ${styleInstruction} tone. Do NOT add explanations, summaries, or new information. Preserve all original meaning and language. Only change the tone and style:\n"""${input}"""`;
				break;

			case "proofread":
				prompt = `The user speaks ${userLang}. Proofread and correct ONLY grammar, spelling, punctuation, clarity, and structure of the following text. Do NOT change tone, language, or add content. Output only the corrected text:\n"""${input}"""`;
				break;

			default:
				prompt = input;
		}

		try {
			const model = googleai.getGenerativeModel({
				model: "gemma-3n-e4b-it",
				generationConfig: {
					temperature: 0.3,
					maxOutputTokens: 2048,
					topP: 0.9,
					topK: 10,
				},
			});

			const result = await model.generateContent(prompt);
			const output = result.response.text().trim();

			const row = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setLabel(
						`${
							subcommand.charAt(0).toUpperCase() +
							subcommand.slice(1)
						} in ${style || userLang}`,
					)
					.setEmoji(emojis.magic)
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(true)
					.setCustomId("rewrite"),
			);

			await interaction.editReply({
				content: output,
				components: [row],
			});
		} catch (error) {
			console.error("Writing error:", error);
			await interaction.editReply({
				content: `${emojis.error} Something went wrong while processing your request.`,
			});
		}
	},
};
