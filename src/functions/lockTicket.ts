import { time, bold } from "discord.js";
import { emojis } from "../resources/emojis.js";
import { defaultLockTicketPermissions } from "../resources/BotPermissions.js";
import { checkBotPermissions } from "./checkPermissions.js";

import type {
    ButtonInteraction,
    TextChannel,
    ThreadChannel,
} from "discord.js";

export async function setLockedAndUpdateMessage(
    interaction: ButtonInteraction,
    reason = ""
) {
    const botHasPermission = await checkBotPermissions(interaction, defaultLockTicketPermissions);
    if (!botHasPermission) return;

    const formattedTime = time(new Date(), "R");

    if (!interaction.channel) return;
    const channel = interaction.channel as
        | (TextChannel & { setLocked?: (locked: boolean) => Promise<unknown> })
        | (ThreadChannel & { setLocked?: (locked: boolean) => Promise<unknown> });

    await channel.setLocked?.(true);

    await interaction.update({
        content: `${emojis.ticketLock} Locked this ticket successfully. To unlock this ticket, please enable it manually on "unlock" button.`,
        embeds: [],
        components: [],
    });

    await channel.send({
        content: `${emojis.ticketLock} ${bold(
            interaction.user.username
        )} locked${
            reason ? ` ${reason}` : ""
        } and limited conversation to staffs ${formattedTime}`,
    });
}
