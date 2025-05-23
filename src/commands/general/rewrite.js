import {
    SlashCommandBuilder,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
    TextDisplayBuilder,
    SeparatorBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import { googleai } from "../../config/Configs.js";
import { emojis } from "../../resources/emojis.js";

export default {
    data: new SlashCommandBuilder()
        .setName("writing")
        .setDescription("AI-powered writing assistant")
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
                .setDescription("Rewrite your text in a specific tone/style")
                .addStringOption((opt) =>
                    opt
                        .setName("text")
                        .setDescription("Your original text")
                        .setRequired(true)
                )
                .addStringOption((opt) =>
                    opt
                        .setName("style")
                        .setDescription("Tone/Style to apply")
                        .addChoices(
                            { name: "😀 Friendly", value: "friendly" },
                            { name: "💼 Professional", value: "professional" },
                            { name: "✂️ Concise", value: "concise" },
                            { name: "📈 Expand", value: "expand" }
                        )
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName("proofread")
                .setDescription(
                    "Proofread and correct grammar, clarity, structure"
                )
                .addStringOption((opt) =>
                    opt
                        .setName("text")
                        .setDescription("Text to proofread")
                        .setRequired(true)
                )
        ),

    async execute({ interaction }) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const subcommand = interaction.options.getSubcommand();
        const input = interaction.options.getString("text");
        const style = interaction.options.getString("style");

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
                prompt = `Rewrite the following text strictly in ${styleInstruction} tone. Do NOT add explanations, summaries, or new information. Preserve all original meaning and content exactly; only change wording and style:\n"""${input}"""`;
                break;

            case "proofread":
                prompt = `Proofread and correct ONLY grammar, spelling, punctuation, clarity, and structure of the following text. Do NOT change tone or add content. Output only the corrected text exactly as improved, without explanations:\n"""${input}"""`;
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
                        subcommand.charAt(0).toUpperCase() +
                            subcommand.slice(1) +
                            "d in " +
                            style
                    )
                    .setEmoji(emojis.magic)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
                    .setCustomId("rewrite")
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
