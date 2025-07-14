import {
	Events,
	AuditLogEvent,
	time,
	ThreadChannel,
	PermissionFlagsBits,
} from "discord.js";
import type { ExtendedClient } from "../../config/index.js";
import { row3 } from "../../components/selectMenus/TicketMenuStates.js";
import { emojis } from "../../utilities/emojis.js";
import { lockButtonRow } from "../../utilities/buttons.js";

export default {
	name: Events.ThreadUpdate,
	once: false,
	async execute(
		client: ExtendedClient,
		oldThread: ThreadChannel,
		newThread: ThreadChannel,
	): Promise<void> {
		if (newThread.ownerId !== client.user?.id) return;
		if (oldThread.archived && newThread.locked) return;

		const formattedTime = time(new Date(), "R");

		const botMember = await newThread.guild.members.fetch(client.user!.id);
		if (!botMember.permissions.has(PermissionFlagsBits.ViewAuditLog))
			return;

		const auditLogs = await newThread.guild.fetchAuditLogs({
			type: AuditLogEvent.ThreadUpdate,
		});
		const entry = auditLogs.entries.first();
		if (!entry) return;

		const { executor } = entry;

		if (oldThread.archived && !newThread.archived && newThread.locked) {
			if (executor?.id === client.user!.id) return;
			await newThread.send({
				content: `${emojis.ticketLockOpen} **${executor?.username}** has __unlocked__ the ticket, but it is **staffs only** ${formattedTime}`,
			});
			return;
		}

		if (oldThread.archived && !newThread.archived) {
			if (executor?.id === client.user!.id) return;

			await newThread.send({
				content: `${emojis.ticketReopen} **${executor?.username}** __re-opened__ this ticket ${formattedTime}`,
			});

			const pinned = await newThread.messages.fetchPinned();
			const pinnedMsg = pinned.first();
			if (pinnedMsg) {
				await pinnedMsg.edit({
					components: [row3, lockButtonRow],
				});
			}
			return;
		}

		if (oldThread.locked && !newThread.locked) {
			await newThread.send({
				content: `${emojis.ticketLockOpen} **${executor?.username}** __unlocked__ this ticket ${formattedTime}`,
			});
			return;
		}

		if (!oldThread.locked && newThread.locked) {
			if (executor?.id === client.user!.id) return;
			if (oldThread.archived && !newThread.archived) return;

			await newThread.send({
				content: `${emojis.ticketLock} **${executor?.username}** __locked__ this ticket ${formattedTime}`,
			});
		}
	},
};
