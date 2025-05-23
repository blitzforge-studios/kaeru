import {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    ApplicationIntegrationType,
    InteractionContextType,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
} from "discord.js";
import { emojis } from "../../resources/emojis.js";
import { googleai } from "../../config/Configs.js";

export default {
    data: new ContextMenuCommandBuilder()
        .setName("Summarize & Key Points")
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

    async execute({ interaction }) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const messageContent = interaction.options.getMessage("message");

        const prompt = `
      Summarize the following text into ONE clear, concise paragraph. Then list the KEY POINTS as bullet points. Do NOT add opinions or extra details.

      Text:
      """${messageContent}"""
      
      Format:
      Summary:
      [summary paragraph]

      Key Points:
      - point 1
      - point 2
      - point 3
    `;

        try {
            const model = googleai.getGenerativeModel({
                model: "gemma-3n-e4b-it",
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 1024,
                    topP: 0.9,
                    topK: 10,
                },
            });

            const result = await model.generateContent(prompt);
            const output = result.response.text().trim();

            const [summarySection, keyPointSection] = output
                .split(/Key Points:\n?/i)
                .map((s) => s.trim());

            const summary = summarySection.replace(/^Summary:\n?/i, "").trim();
            const keyPoints = keyPointSection.trim();

            const summaryTextSection = new TextDisplayBuilder().setContent(
                [`## ${emojis.text_append} Summarized`, summary].join("\n")
            );

            const divider = new SeparatorBuilder()
                .setDivider(true)
                .setSpacing(SeparatorSpacingSize.Large);

            const keyPointsTextSection = new TextDisplayBuilder().setContent(
                [`## ${emojis.list_bullet} Key Points`, keyPoints].join("\n")
            );

            await interaction.editReply({
                components: [summaryTextSection, divider, keyPointsTextSection],
                flags: MessageFlags.IsComponentsV2,
            });
        } catch (error) {
            console.error("❌ Failed to process summary:", error);
            await interaction.editReply({
                content: `❌ Something went wrong while summarizing.`,
            });
        }
    },
};
