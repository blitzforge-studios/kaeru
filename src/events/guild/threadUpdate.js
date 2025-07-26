import {
	AuditLogEvent,
	Events,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextDisplayBuilder,
	time,
} from "discord.js";
import { emojis } from "../../resources/emojis.js";

export default {
	name: Events.ThreadUpdate,
	once: false,

	execute: async (oldThread, newThread) => {
		// Ignore if this isn't the bot's thread
		if (newThread.ownerId !== newThread.client.user.id) return;

		// Fetch executor from audit log
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
		if (executor.id === newThread.client.user.id) return; // ignore bot actions

		const formattedTime = time(new Date(), "R");

		// Helper: sends message
		const sendMessage = async (emoji, text) => {
			await newThread.send({
				components: [
					new TextDisplayBuilder().setContent(`# ${emoji}`),
					new TextDisplayBuilder().setContent(
						`-# **<@!${executor.id}>** ${text} ${formattedTime}`,
					),
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: { parse: [] },
			});
		};

		// === UNLOCKED ===
		if (oldThread.locked && !newThread.locked) {
			await sendMessage(
				emojis.ticket.bubble.key,
				"has __unlocked__ the thread",
			);
		}

		// === LOCKED ===
		else if (!oldThread.locked && newThread.locked) {
			await sendMessage(
				emojis.ticket.bubble.lock,
				"has __locked__ the thread",
			);
		}

		// === UNARCHIVED but still locked (staff-only reopen) ===
		else if (
			oldThread.archived &&
			!newThread.archived &&
			newThread.locked
		) {
			await sendMessage(
				emojis.ticket.bubble.reopen,
				"has __re-opened__ the thread, but it is **staffs only**",
			);
		}

		// === FULLY REOPENED ===
		else if (oldThread.archived && !newThread.archived) {
			await sendMessage(
				emojis.ticket.bubble.reopen,
				"has __re-opened__ the thread",
			);
		}
	},
};
