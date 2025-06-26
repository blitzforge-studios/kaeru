import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { googleai } from "../../config/Configs.js";
import { emojis } from "../../resources/emojis.js";

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
        })
        .setDescriptionLocalizations({
            tr: "Yapay zekaya soru sor",
            "zh-CN": "向 AI 提问",
            it: "Fai una domanda all’IA",
            "pt-BR": "Pergunte à IA",
            ru: "Задай вопрос ИИ",
        })
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
                })
                .setDescriptionLocalizations({
                    tr: "Sorunu yaz bakalım :3",
                    "zh-CN": "输入您的问题",
                    it: "Inserisci la tua domanda",
                    "pt-BR": "Digite sua pergunta",
                    ru: "Введите ваш вопрос",
                })
                .setRequired(true),
        ),
    execute: async ({ interaction }) => {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const prompt = interaction.options.getString("question");
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
            await interaction.editReply(output);
        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: `${emojis.error} Something went wrong while processing your request.`,
            });
        }
    },
};
