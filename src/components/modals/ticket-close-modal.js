import {
	time,
	EmbedBuilder,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
	SeparatorBuilder,
	MessageFlags,
	SectionBuilder,
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
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
				new TextDisplayBuilder().setContent(
					`-# **<@!${interaction.user.id}>** has __force closed__ the thread as completed ${formattedTime}`,
				),
				new ContainerBuilder()
					.addSectionComponents(
						new SectionBuilder()
							.addTextDisplayComponents(
								new TextDisplayBuilder().setContent(
									closeReason,
								),
							)
							.setThumbnailAccessory(
								interaction.user.displayAvatarURL(),
							),
					)
					.setAccentColor(0xff3500),
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
