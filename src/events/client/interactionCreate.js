import { Events, InteractionType } from "discord.js";

export default {
	name: Events.InteractionCreate,
	once: false,
	execute: async (interaction, client) => {
		if (interaction.isChatInputCommand()) {
			const { commands } = client;
			const { commandName } = interaction;
			const command = commands.get(commandName);

			if (!command) return;

			try {
				await command.execute({ interaction, client });
			} catch (error) {
				console.error(error);
			}
		} else if (interaction.isButton()) {
			const { buttons } = client;
			const { customId } = interaction;
			const button = buttons.get(customId);

			if (!button) return new Error("Button not found.");

			try {
				await button.execute({ interaction, client });
			} catch (error) {
				console.error(error);
			}
		} else if (interaction.isStringSelectMenu()) {
			const { selectMenus } = client;
			const { customId } = interaction;
			const selectMenu = selectMenus.get(customId);

			if (!selectMenu) return new Error("Select menu not found.");

			try {
				await selectMenu.execute({ interaction, client });
			} catch (error) {
				console.error(error);
			}
		} else if (interaction.type === InteractionType.ModalSubmit) {
			const { modals } = client;
			const customId = interaction.customId;

			const modal = [...modals.values()].find((modal) => {
				const id = modal.data.customId;
				if (typeof id === "string") {
					return id === customId;
				} else if (id instanceof RegExp) {
					return id.test(customId);
				}
				return false;
			});

			if (!modal) {
				console.error("Modal not found for customId:", customId);
				return;
			}

			try {
				await modal.execute({ interaction, client });
			} catch (error) {
				console.error(error);
			}
		} else if (interaction.isContextMenuCommand()) {
			const { commands } = client;
			const { commandName } = interaction;
			const contextCommand = commands.get(commandName);

			if (!contextCommand) return;

			try {
				await contextCommand.execute({ interaction, client });
			} catch (error) {
				console.error(error);
			}
		} else if (
			interaction.type == InteractionType.ApplicationCommandAutocomplete
		) {
			const { commands } = client;
			const { commandName } = interaction;
			const autocompleteCommand = commands.get(commandName);

			if (!autocompleteCommand) return;

			try {
				await autocompleteCommand.autocomplete({ interaction, client });
			} catch (error) {
				console.error(error);
			}
		}
	},
};
