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

	execute: async ({ interaction }) => {
		const label = interaction.values[0] || "bug";

		const modal = new ModalBuilder()
			.setCustomId(`create-ticket-modal|label-${label}`)
			.setTitle("Ticket creation");

		const input = new TextInputBuilder()
			.setCustomId("ticket-title")
			.setLabel("Please explain your issue with a few words.")
			.setRequired(true)
			.setStyle(TextInputStyle.Short)
			.setPlaceholder("Cannot post memes")
			.setMinLength(5)
			.setMaxLength(80);

		modal.addComponents(new ActionRowBuilder().addComponents(input));

		await interaction.showModal(modal).catch(console.error);
	},
};
