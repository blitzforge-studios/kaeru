import {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    type ButtonInteraction,
} from "discord.js";

export default {
    data: {
        customId: "create-ticket",
    },
    execute: async ({
        interaction,
    }: {
        interaction: ButtonInteraction;
    }) => {
        const modal = new ModalBuilder()
            .setCustomId("create-ticket-modal")
            .setTitle("Ticket creation");

        const input = new TextInputBuilder()
            .setCustomId("ticket-title")
            .setLabel("Please explain your issue with a few words.")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Cannot post memes")
            .setMinLength(5)
            .setMaxLength(80);
        const firstActionRow =
            new ActionRowBuilder<TextInputBuilder>().addComponents(input);

        modal.addComponents(firstActionRow);

        await interaction.showModal(modal).catch((e: unknown) => console.log(e));
    },
};
