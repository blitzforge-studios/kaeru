import type { ButtonInteraction } from "discord.js";
import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";

export default {
	data: {
		customId: "create-ticket",
	},
	async execute({
		interaction,
	}: {
		interaction: ButtonInteraction;
	}): Promise<void> {
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

		try {
			await interaction.showModal(modal);
		} catch (e) {
			console.error(e);
		}
	},
};
