import {
	Events,
	Interaction,
	ChatInputCommandInteraction,
	ButtonInteraction,
	StringSelectMenuInteraction,
	ModalSubmitInteraction,
	InteractionType,
} from "discord.js";
import type { ExtendedClient } from "../../config/index.js";

export default {
	name: Events.InteractionCreate,
	once: false,
	async execute(
		interaction: Interaction,
		client: ExtendedClient,
	): Promise<void> {
		if (interaction.isChatInputCommand()) {
			const command = client.commands.get(interaction.commandName);
			if (!command) return;

			try {
				await command.execute({
					interaction: interaction as ChatInputCommandInteraction,
					client,
				});
			} catch (error) {
				console.error(error);
			}
		} else if (interaction.isButton()) {
			const button = client.buttons.get(interaction.customId);
			if (!button) return;

			try {
				await button.execute({
					interaction: interaction as ButtonInteraction,
					client,
				});
			} catch (error) {
				console.error(error);
			}
		} else if (interaction.isStringSelectMenu()) {
			const menu = client.selectMenus.get(interaction.customId);
			if (!menu) return;

			try {
				await menu.execute({
					interaction: interaction as StringSelectMenuInteraction,
					client,
				});
			} catch (error) {
				console.error(error);
			}
		} else if (interaction.type === InteractionType.ModalSubmit) {
			const modal = client.modals.get(interaction.customId);
			if (!modal) return;

			try {
				await modal.execute({
					interaction: interaction as ModalSubmitInteraction,
					client,
				});
			} catch (error) {
				console.error(error);
			}
		}
	},
};
