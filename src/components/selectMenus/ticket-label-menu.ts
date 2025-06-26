import { MessageFlags, type StringSelectMenuInteraction } from "discord.js";
import { emojis } from "../../resources/emojis.js";
import { lockButtonRow } from "../../resources/buttons.js";

export default {
    data: {
        customId: "ticket-label-menu",
    },
    execute: async ({
        interaction,
    }: {
        interaction: StringSelectMenuInteraction;
    }) => {
        if (!interaction.channel || !interaction.channel.isThread()) {
            return interaction.reply({
                content: "This command can only be used in a thread.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const selectedLabels = interaction.values;
        if (!selectedLabels || selectedLabels.length === 0) {
            return interaction.reply({
                content: "No label selected.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const labelValue = selectedLabels[0];
        const labelText = labelValue.replace(/^label-/, "").toUpperCase();

        const currentThreadName = interaction.channel.name;
        const originalTitle = currentThreadName.replace(/^\[[^\]]+\]\s*/, "");
        const newTitle = `[${labelText}] ${originalTitle}`;

        try {
            await interaction.channel.setName(newTitle);

            const components = interaction.message.components;

            const selectedOptionEmoji =
                components[1].components[0].options.find(
                    (option: any) => option.value === labelValue
                )?.emoji || emojis.label.bugLabel;

            const selectedOption = {
                label: labelText,
                value: labelValue,
                emoji: selectedOptionEmoji,
                default: true,
            };

            const updatedSecondMenu = {
                type: 1,
                components: [
                    {
                        type: components[1].components[0].type,
                        custom_id: components[1].components[0].customId,
                        disabled: true,
                        options: [selectedOption],
                        placeholder: `${selectedOptionEmoji} ${labelText}`,
                    },
                ],
            };

            const updatedComponents = [
                components[0],
                updatedSecondMenu,
                lockButtonRow,
            ];

            await interaction.message.edit({ components: updatedComponents });

            await interaction.reply({
                content: `Ticket title updated to: ${newTitle}`,
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            console.error("Error updating thread title:", error);
            await interaction.reply({
                content: "Failed to update ticket title.",
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
