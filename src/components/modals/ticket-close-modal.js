import {
	time,
	TextDisplayBuilder,
	SeparatorSpacingSize,
	SeparatorBuilder,
	MessageFlags,
} from "discord.js";
import { emojis } from "../../resources/emojis.js";

export default {
	data: {
		customId: "ticket-close-modal",
	},

	execute: async ({ interaction }) => {
		const closeReason =
			interaction.fields.getTextInputValue("close-reason");

		const formattedTime = time(new Date(), "R");

		await interaction.reply({
			components: [
				new TextDisplayBuilder().setContent(
					`# ${emojis.ticket.bubble.close}`,
				),
				new TextDisplayBuilder().setContent(
					`-# **<@!${interaction.user.id}>** has __force closed__ the thread as completed ${formattedTime}`,
				),
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Large)
					.setDivider(false),
				new TextDisplayBuilder().setContent(
					[`### Comment`, ">>> " + closeReason].join("\n"),
				),
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			],
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: {
				parse: [],
			},
		});

		await interaction.channel.setLocked(true);
		await interaction.channel.setArchived(
			true,
			`${interaction.user.username} marked the ticket as completed with reason: ${closeReason}`,
		);
	},
};
