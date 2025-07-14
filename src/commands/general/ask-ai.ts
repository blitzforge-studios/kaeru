import {
	SlashCommandBuilder,
	ApplicationIntegrationType,
	InteractionContextType,
	MessageFlags,
	type ChatInputCommandInteraction,
} from "discord.js";
import { googleai } from "../../config/index.js";
import { emojis } from "../../utilities/emojis.js";

export default {
	data: new SlashCommandBuilder()
		.setName("ask")
		.setDescription("Ask Kaeru a question")
		.setNameLocalizations({
			tr: "sor",
			"zh-CN": "提问",
			it: "chiedi",
			"pt-BR": "perguntar",
			ru: "спросить",
		} as Record<string, string>)
		.setDescriptionLocalizations({
			tr: "Yapay zekaya soru sor",
			"zh-CN": "向 AI 提问",
			it: "Fai una domanda all’IA",
			"pt-BR": "Pergunte à IA",
			ru: "Задай вопрос ИИ",
		} as Record<string, string>)
		.setIntegrationTypes([
			ApplicationIntegrationType.UserInstall,
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.BotDM,
			InteractionContextType.PrivateChannel,
			InteractionContextType.Guild,
		])
		.addStringOption((option) =>
			option
				.setName("question")
				.setDescription("Your question")
				.setNameLocalizations({
					tr: "soru",
					"zh-CN": "问题",
					it: "domanda",
					"pt-BR": "pergunta",
					ru: "вопрос",
				} as Record<string, string>)
				.setDescriptionLocalizations({
					tr: "Sorunu yaz bakalım :3",
					"zh-CN": "输入您的问题",
					it: "Inserisci la tua domanda",
					"pt-BR": "Digite sua pergunta",
					ru: "Введите ваш вопрос",
				} as Record<string, string>)
				.setRequired(true),
		),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		try {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			const prompt = interaction.options.getString("question", true);
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
			let output = result.response.text().trim();

			if (output.length > 2000) {
				output = output.slice(0, 1997) + "...";
			}

			await interaction.editReply(output);
		} catch (error) {
			console.error(error);
			await interaction.editReply({
				content: `${emojis.error} Uh, oh! [Google-chan](https://google.com/)! Help! I can't answer that question.`,
			});
		}
	},
} as const;
