import {
	time,
	bold,
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

	await interaction.update({
		content: `Locked this ticket successfully. To unlock this ticket, please enable it manually on "unlock" button.`,
		embeds: [],
		components: [],
	});

	await interaction.channel.send({
		components: [
			new TextDisplayBuilder().setContent(
				`# ${emojis.ticket.bubble.lock}`,
			),
			new TextDisplayBuilder().setContent(
				`-# **<@!${interaction.user.id}>** locked${
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
