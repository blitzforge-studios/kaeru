import {
	time,
	MessageFlags,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
} from "discord.js";
import { emojis } from "../resources/emojis.js";
import { defaultLockTicketPermissions } from "../resources/BotPermissions.js";
import { checkBotPermissions } from "./checkPermissions.js";

export async function setLockedAndUpdateMessage(interaction, reason = "") {
	const botHasPermission = await checkBotPermissions(
		interaction,
		defaultLockTicketPermissions,
	);
	if (!botHasPermission) return;

	const formattedTime = time(new Date(), "R");

	await interaction.channel.setLocked(true);

	try {
		if (interaction.replied || interaction.deferred) {
			await interaction.editReply({
				content: `Locked this ticket successfully. To unlock this ticket, please enable it manually on "unlock" button.`,
				components: [],
				embeds: [],
			});
		} else {
			await interaction.update({
				content: `Locked this ticket successfully. To unlock this ticket, please enable it manually on "unlock" button.`,
				components: [],
				embeds: [],
			});
		}
	} catch {
		await interaction.channel.send(
			`Locked this ticket successfully. To unlock this ticket, please enable it manually on "unlock" button.`,
		);
	}

	await interaction.channel.send({
		components: [
			new TextDisplayBuilder().setContent(
				`# ${emojis.ticket.bubble.lock}`,
			),
			new TextDisplayBuilder().setContent(
				`-# **<@!${interaction.user.id}>** has __locked__ the thread${
					reason ? ` ${reason}` : ""
				} and limited conversation to staffs ${formattedTime}`,
			),
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		],
		allowedMentions: {
			parse: [],
		},
		flags: MessageFlags.IsComponentsV2,
	});
}
