import { PermissionFlagsBits, MessageFlags } from "discord.js";
import { emojis } from "../../resources/emojis.js";

export default {
	data: {
		customId: "karu-button",
	},

	execute: async ({ interaction }) => {
		if (
			!interaction.guild.members.me.permissions.has(
				PermissionFlagsBits.ManageThreads,
			)
		) {
			return interaction.reply({
				content: `${emojis.error} I don't have permission to manage threads.`,
				flags: MessageFlags.Ephemeral,
			});
		}

		const thread = interaction.channel;
		const currentName = thread.name;
		const aiEmoji = "💭 ";

		let newName;
		let actionMessage;

		if (currentName.startsWith(aiEmoji)) {
			newName = currentName.substring(aiEmoji.length);
			actionMessage = `# ${emojis.info}\n-# AI support has been **disabled** for this ticket.`;
		} else {
			newName = aiEmoji + currentName;
			actionMessage = `# ${emojis.info}\n-# AI support has been **enabled** for this ticket.`;
		}

		try {
			await thread.setName(newName);

			await interaction.reply({
				content: actionMessage,
				flags: MessageFlags.Ephemeral,
			});
		} catch (error) {
			console.error("Error updating thread name:", error);
			await interaction.reply({
				content: `${emojis.error} I couldn't update the thread name... maybe next time, hehe... :/`,
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
