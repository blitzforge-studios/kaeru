import type { ModalSubmitInteraction, ThreadChannel } from "discord.js";
import { time, EmbedBuilder } from "discord.js";
import { emojis } from "../../utilities/emojis.js";

export default {
	data: {
		customId: "ticket-close-modal",
	},
	async execute({
		interaction,
	}: {
		interaction: ModalSubmitInteraction;
	}): Promise<void> {
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
			ephemeral: true,
		});

		const thread = interaction.channel as ThreadChannel;
		await thread.setLocked(true);
		await thread.setArchived(
			true,
			`${interaction.user.username} marked the ticket as completed with reason: ${closeReason}`,
		);
	},
};
