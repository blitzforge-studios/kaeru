import {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	time,
	MessageFlags,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
} from "discord.js";
import { emojis } from "../../resources/emojis.js";
import { defaultLockTicketPermissions } from "../../resources/BotPermissions.js";
import { checkBotPermissions } from "../../functions/checkPermissions.js";
import { lockButtonRow } from "../../resources/buttons.js";
import { ticketContainerData } from "../../resources/ticketDefaultData.js";

const menu3 = new StringSelectMenuBuilder()
	.setCustomId("ticket-select-menu")
	.setDisabled(false)
	.setMaxValues(1)
	.setPlaceholder("Action to close ticket")
	.addOptions(
		new StringSelectMenuOptionBuilder()
			.setLabel("Close as completed")
			.setValue("ticket-menu-done")
			.setDescription("Done, closed, fixed, resolved")
			.setEmoji(emojis.ticket.circle.done)
			.setDefault(false),
		new StringSelectMenuOptionBuilder()
			.setLabel("Close as not planned")
			.setValue("ticket-menu-duplicate")
			.setDescription("Won’t fix, can’t repo, duplicate, stale")
			.setEmoji(emojis.ticket.circle.stale)
			.setDefault(false),
		new StringSelectMenuOptionBuilder()
			.setLabel("Close with comment")
			.setValue("ticket-menu-close")
			.setEmoji(emojis.ticket.circle.close)
			.setDefault(false),
	);

export const row3 = new ActionRowBuilder().addComponents(menu3);

export default {
	data: {
		customId: "ticket-select-menu",
	},

	execute: async ({ interaction }) => {
		const botHasPermission = await checkBotPermissions(
			interaction,
			defaultLockTicketPermissions,
		);
		if (!botHasPermission) return;

		const authorId = interaction.user.id;
		const selectedValue = interaction.values[0];
		const formattedTime = time(new Date(), "R");

		switch (selectedValue) {
			case "ticket-menu-close": {
				const modal = new ModalBuilder()
					.setCustomId("ticket-close-modal")
					.setTitle("Close Ticket")
					.addComponents(
						new ActionRowBuilder().addComponents(
							new TextInputBuilder()
								.setCustomId("close-reason")
								.setLabel("Reason for closing")
								.setStyle(TextInputStyle.Paragraph)
								.setRequired(true),
						),
					);

				await interaction.showModal(modal);
				break;
			}

			case "ticket-menu-done": {
				const menu3 = new StringSelectMenuBuilder()
					.setCustomId("ticket-select-menu")
					.setDisabled(false)
					.setMaxValues(1)
					.setPlaceholder("What do you want to do?")
					.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel("Done")
							.setValue("ticket-menu-done")
							.setDescription("Done, closed, fixed, resolved")
							.setEmoji(emojis.ticket.circle.done)
							.setDefault(false),
						new StringSelectMenuOptionBuilder()
							.setLabel("Close as not planned")
							.setValue("ticket-menu-duplicate")
							.setDescription(
								"Won’t fix, can’t repo, duplicate, stale",
							)
							.setEmoji(emojis.ticket.circle.stale)
							.setDefault(false),
						new StringSelectMenuOptionBuilder()
							.setLabel("Close with comment")
							.setValue("ticket-menu-close")
							.setEmoji(emojis.ticket.circle.close),
					);

				const row3 = new ActionRowBuilder().addComponents(menu3);
				await interaction.update({
					components: [
						await ticketContainerData(interaction),
						row3,
						lockButtonRow,
					],
					flags: MessageFlags.IsComponentsV2,
				});

				await interaction.channel.send({
					components: [
						new TextDisplayBuilder().setContent(
							`# ${emojis.ticket.bubble.done}`,
						),
						new TextDisplayBuilder().setContent(
							`-# **<@!${authorId}>** __closed__ this as completed ${formattedTime},`,
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
					`${interaction.member.displayName} marked as completed`,
				);
				break;
			}

			case "ticket-menu-duplicate": {
				const menu2 = new StringSelectMenuBuilder()
					.setCustomId("ticket-select-menu")
					.setDisabled(false)
					.setMaxValues(1)
					.setPlaceholder("What do you want to do?")
					.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel("Close as completed")
							.setValue("ticket-menu-done")
							.setDescription("Done, closed, fixed, resolved")
							.setEmoji(emojis.ticket.circle.done)
							.setDefault(false),
						new StringSelectMenuOptionBuilder()
							.setLabel("Close as not planned")
							.setValue("ticket-menu-duplicate")
							.setDescription(
								"Won’t fix, can’t repo, duplicate, stale",
							)
							.setEmoji(emojis.ticket.circle.stale)
							.setDefault(false),
						new StringSelectMenuOptionBuilder()
							.setLabel("Close with comment")
							.setValue("ticket-menu-close")
							.setEmoji(emojis.ticket.circle.close),
					);

				const row2 = new ActionRowBuilder().addComponents(menu2);

				await interaction.update({
					components: [
						await ticketContainerData(interaction),
						row2,
						lockButtonRow,
					],
					flags: MessageFlags.IsComponentsV2,
				});

				await interaction.channel.send({
					components: [
						new TextDisplayBuilder().setContent(
							`# ${emojis.ticket.bubble.stale}`,
						),
						new TextDisplayBuilder().setContent(
							`-# **<@!${authorId}>** __closed__ this as not planned ${formattedTime},`,
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

				await interaction.channel.setArchived(
					true,
					`${interaction.user.username} marked as not planned`,
				);
				break;
			}

			default:
				break;
		}
	},
};
