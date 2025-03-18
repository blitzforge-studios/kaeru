import { time, bold } from "discord.js";
import { emojis } from "../resources/emojis.js";
import { defaultLockTicketPermissions } from "../resources/BotPermissions.js";
import { checkBotPermissions } from "./checkPermissions.js";

export async function setLockedAndUpdateMessage(interaction, reason = "") {
    const botHasPermission = await checkBotPermissions(interaction, defaultLockTicketPermissions);
    if (!botHasPermission) return;

    const formattedTime = time(new Date(), "R");

    await interaction.channel.setLocked(true);

    await interaction.update({
        content: `${emojis.ticketLock} Locked this ticket successfully. To unlock this ticket, please enable it manually on "unlock" button.`,
        embeds: [],
        components: [],
    });

    await interaction.channel.send({
        content: `${emojis.ticketLock} ${bold(
            interaction.user.username
        )} locked${
            reason ? ` ${reason}` : ""
        } and limited conversation to staffs ${formattedTime}`,
    });
}
