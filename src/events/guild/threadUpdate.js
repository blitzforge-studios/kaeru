import { AuditLogEvent, Events, time } from "discord.js";
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
        const auditLogs = await newThread.guild.fetchAuditLogs({
            type: AuditLogEvent.ThreadUpdate,
        });
        const auditLog = auditLogs.entries.first();

        if (!auditLog) return;

        const { executor } = auditLog;

        if (oldThread.archived && !newThread.archived && newThread.locked) {
            if (executor.id === newThread.client.user.id) return;

            await newThread.send({
                content: `${emojis.ticketLockOpen} **${executor.username}** has __unlocked__ the ticket, but it is **staffs only** ${formattedTime}`,
            });
        } else if (oldThread.archived && !newThread.archived) {
            if (executor.id === newThread.client.user.id) return;

            await newThread.send({
                content: `${emojis.ticketReopen} **${executor.username}** __re-opened__ this ticket ${formattedTime}`,
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
                content: `${emojis.ticketLockOpen} **${executor.username}** __unlocked__ this ticket ${formattedTime}`,
            });
        } else if (!oldThread.locked && newThread.locked) {
            if (executor.id === newThread.client.user.id) return;
            if (oldThread.archived && !newThread.archived) return;

            await newThread.send({
                content: `${emojis.ticketLock} **${executor.username}** __locked__ this ticket ${formattedTime}`,
            });
        }
    },
};
