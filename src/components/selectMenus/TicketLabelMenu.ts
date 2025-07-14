import type {
	StringSelectMenuInteraction,
	ThreadChannel,
	ActionRow,
	MessageActionRowComponent,
	StringSelectMenuComponent,
} from "discord.js";
import { ComponentType } from "discord.js";
import { emojis } from "../../utilities/emojis.js";
import { lockButtonRow } from "../../utilities/buttons.js";

export default {
	data: {
		customId: "ticket-label-menu",
	},
	async execute({
		interaction,
	}: {
		interaction: StringSelectMenuInteraction;
	}): Promise<void> {
		if (!interaction.channel?.isThread()) {
			await interaction.reply({
				content: "This command can only be used in a thread.",
				ephemeral: true,
			});
			return;
		}

		const thread = interaction.channel as ThreadChannel;
		const [labelValue] = interaction.values;
		if (!labelValue) {
			await interaction.reply({
				content: "No label selected.",
				ephemeral: true,
			});
			return;
		}

		const labelText = labelValue.replace(/^label-/, "").toUpperCase();
		const originalTitle = thread.name.replace(/^\[[^\]]+\]\s*/, "");
		const newTitle = `[${labelText}] ${originalTitle}`;

		try {
			await thread.setName(newTitle);

			const comps = interaction.message.components;
			const secondComponent = comps[1];

			if (secondComponent.type !== ComponentType.ActionRow) {
				await interaction.reply({
					content: "Invalid component structure.",
					ephemeral: true,
				});
				return;
			}

			const actionRow =
				secondComponent as ActionRow<MessageActionRowComponent>;
			const selectMenu = actionRow.components[0];

			if (selectMenu.type !== ComponentType.StringSelect) {
				await interaction.reply({
					content: "Invalid select menu component.",
					ephemeral: true,
				});
				return;
			}

			const stringSelectMenu = selectMenu as StringSelectMenuComponent;
			const emoji =
				stringSelectMenu.options?.find(
					(o: any) => o.value === labelValue,
				)?.emoji ?? emojis.label.bugLabel;

			const updatedMenu = {
				type: stringSelectMenu.type,
				customId: stringSelectMenu.customId,
				disabled: true,
				options: [
					{
						label: labelText,
						value: labelValue,
						emoji,
						default: true,
					},
				],
				placeholder: `${emoji} ${labelText}`,
			};

			const updatedComponents = [
				comps[0],
				{ type: 1, components: [updatedMenu] },
				lockButtonRow,
			];

			await interaction.message.edit({ components: updatedComponents });
			await interaction.reply({
				content: `Ticket title updated to: ${newTitle}`,
				ephemeral: true,
			});
		} catch (err) {
			console.error("Error updating thread title:", err);
			await interaction.reply({
				content: "Failed to update ticket title.",
				ephemeral: true,
			});
		}
	},
} as const;
