import {
	ChannelType,
	EmbedBuilder,
	PermissionFlagsBits,
	roleMention,
	MessageFlags,
} from "discord.js";
import { emojis } from "../../resources/emojis.js";
import { getStaffRoleId } from "../../functions/database.js";
import { defaultTicketPermissions } from "../../resources/BotPermissions.js";
import { checkBotPermissions } from "../../functions/checkPermissions.js";
import { labelMenuRow, ticketMenuRow } from "../../resources/selectMenus.js";
import { lockButtonRow } from "../../resources/buttons.js";

export default {
	data: {
		customId: "create-ticket-modal",
	},

	execute: async ({ interaction }) => {
		if (!(await checkBotPermissions(interaction, defaultTicketPermissions)))
			return;

		const ticketTitle =
			interaction.fields.getTextInputValue("ticket-title");

		const embed = new EmbedBuilder()
			.setTitle(`${emojis.doorEnter} Now, we did it. Here we are!`)
			.setDescription(
				"Our staff member(s) will take care of this thread sooner. While they are on their way, why don’t you talk about your ticket?",
			)
			.setThumbnail(
				"https://cdn.discordapp.com/attachments/736571695170584576/1327617435418755185/23679.png?ex=67923816&is=6790e696&hm=20665b7edede15c92383a8411ae23827dac2ff732bdf3afb5161f752e7426dc5&",
			);

		let thread = await interaction.channel.threads.create({
			name: `${ticketTitle}`,
			autoArchiveDuration: 1440,
			type: ChannelType.PrivateThread,
			reason: `${interaction.user.username} opened a thread for support`,
			invitable: false,
		});

		await interaction.reply({
			content: `# ${emojis.ticket.created} Created <#${thread.id}>\nNow, you can talk about your issue with our staff members.`,
			flags: MessageFlags.Ephemeral,
		});

		const staffRoleId = await getStaffRoleId(interaction.guild.id);

		let pinMessage = await thread.send({
			content: `${roleMention(staffRoleId)}`,
			embeds: [embed],
			components: [ticketMenuRow, labelMenuRow, lockButtonRow],
		});

		await thread.members.add(interaction.user);

		if (
			interaction.guild.members.me.permissions.has(
				PermissionFlagsBits.ManageMessages,
			)
		)
			await pinMessage.pin();
		else return;
	},
};
