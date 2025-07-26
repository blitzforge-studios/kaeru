import {
	AuditLogEvent,
	Events,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextDisplayBuilder,
	time,
} from "discord.js";
import { row3 } from "../../components/selectMenus/ticket-select-menu-states.js";
import { emojis } from "../../resources/emojis.js";
import { lockButtonRow } from "../../resources/buttons.js";

export default {
	name: Events.ThreadUpdate,
	once: false,
	execute: async (oldThread, newThread) => {
		if (newThread.ownerId !== newThread.client.user.id) return;
		if (oldThread.archived && newThread.locked) return;

		const formattedTime = time(new Date(), "R");
		const botMember = await newThread.guild.members.fetch(
			newThread.client.user.id,
		);
		if (!botMember.permissions.has("ViewAuditLog")) return;
		const auditLogs = await newThread.guild.fetchAuditLogs({
			type: AuditLogEvent.ThreadUpdate,
		});
		const auditLog = auditLogs.entries.first();

		if (!auditLog) return;

		const { executor } = auditLog;

		if (oldThread.archived && !newThread.archived && newThread.locked) {
			if (executor.id === newThread.client.user.id) return;

			await newThread.send({
				components: [
					new TextDisplayBuilder().setContent(
						`# ${emojis.ticket.bubble.key}`,
					),
					new TextDisplayBuilder().setContent(
						`-# **<@!${executor.id}>** has __unlocked__ the thread, but it is **staffs only** ${formattedTime}`,
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
		} else if (oldThread.archived && !newThread.archived) {
			if (executor.id === newThread.client.user.id) return;

			await newThread.send({
				components: [
					new TextDisplayBuilder().setContent(
						`# ${emojis.ticket.bubble.reopen}`,
					),
					new TextDisplayBuilder().setContent(
						`-# **<@!${executor.id}>** has __re-opened__ the thread ${formattedTime}`,
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

			const pinnedMessages = await newThread.messages.fetchPinned();
			const pinnedMessage = pinnedMessages.first();

			if (pinnedMessage) {
				await pinnedMessage.edit({
					components: [row3, lockButtonRow],
				});
			} else {
				return;
				// const messages = await newThread.messages.fetch();
				// const message = messages.first();
				//
				// if (message) {
				//     await message.edit({
				//         components: [row3, lockButtonRow],
				//     });
				// }
			}
		}

		if (oldThread.locked && !newThread.locked) {
			await newThread.send({
				components: [
					new TextDisplayBuilder().setContent(
						`# ${emojis.ticket.bubble.key}`,
					),
					new TextDisplayBuilder().setContent(
						`-# **<@!${executor.id}>** has __unlocked__ the thread ${formattedTime}`,
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
		} else if (!oldThread.locked && newThread.locked) {
			if (executor.id === newThread.client.user.id) return;
			if (oldThread.archived && !newThread.archived) return;

			await newThread.send({
				components: [
					new TextDisplayBuilder().setContent(
						`# ${emojis.ticket.bubble.lock}`,
					),
					new TextDisplayBuilder().setContent(
						`-# **<@!${executor.id}>** has __locked__ the thread ${formattedTime}`,
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
		}
	},
};
