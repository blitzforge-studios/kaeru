import { time, EmbedBuilder, type ModalSubmitInteraction } from "discord.js";
import { emojis } from "../../resources/emojis.js";

export default {
    data: {
        customId: "ticket-close-modal",
    },

    execute: async ({
        interaction,
    }: {
        interaction: ModalSubmitInteraction;
    }) => {
        const closeReason =
            interaction.fields.getTextInputValue("close-reason");

        const formattedTime = time(new Date(), "R");

        await interaction.reply({
            content: `${emojis.ticketClose} **${interaction.user.username}** __closed__ this ticket as completed at ${formattedTime}`,
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.username} commented`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setColor(0xff3500)
                    .setDescription(closeReason),
            ],
        });

        await interaction.channel.setLocked(true);
        await interaction.channel.setArchived(
            true,
            `${interaction.user.username} marked the ticket as completed with reason: ${closeReason}`
        );
    },
};
