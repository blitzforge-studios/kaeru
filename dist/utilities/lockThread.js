import { time, bold } from "discord.js";
import { emojis } from "./emojis.js";
import { defaultLockTicketPermissions } from "./permissions.js";
import { checkAppPermissions } from "../handlers/index.js";
export async function setLockedAndUpdateMessage(interaction, reason = "") {
    const botHasPermission = await checkAppPermissions(interaction, defaultLockTicketPermissions);
    if (!botHasPermission)
        return;
    const formattedTime = time(new Date(), "R");
    const channel = interaction.channel;
    await channel.setLocked(true);
    await interaction.update({
        content: `${emojis.ticketLock} Locked this ticket successfully. To unlock this ticket, please enable it manually on "unlock" button.`,
        embeds: [],
        components: [],
    });
    await channel.send({
        content: `${emojis.ticketLock} ${bold(interaction.user.username)} locked${reason ? ` ${reason}` : ""} and limited conversation to staffs ${formattedTime}`,
    });
}
