import { ChannelType, EmbedBuilder, PermissionFlagsBits, roleMention, } from "discord.js";
import { emojis } from "../../utilities/emojis.js";
import { getStaffRoleId } from "../../utilities/database.js";
import { defaultTicketPermissions } from "../../utilities/permissions.js";
import { checkAppPermissions } from "../../handlers/index.js";
import { labelMenuRow, ticketMenuRow } from "../../utilities/menus.js";
import { lockButtonRow } from "../../utilities/buttons.js";
export default {
    data: {
        customId: "create-ticket-modal",
    },
    async execute({ interaction, }) {
        if (!(await checkAppPermissions(interaction, defaultTicketPermissions)))
            return;
        const ticketTitle = interaction.fields.getTextInputValue("ticket-title");
        const embed = new EmbedBuilder()
            .setTitle(`${emojis.doorEnter} Now, we did it. Here we are!`)
            .setDescription("Our staff member(s) will take care of this thread soon. While they’re on their way, why don’t you talk about your ticket?")
            .setThumbnail("https://cdn.discordapp.com/attachments/…/23679.png");
        const parent = interaction.channel;
        const thread = await parent.threads.create({
            name: ticketTitle,
            autoArchiveDuration: 1440,
            type: ChannelType.PrivateThread,
            reason: `${interaction.user.username} opened a thread for support`,
            invitable: false,
        });
        await interaction.reply({
            content: `# ${emojis.ticketCreated} Created <#${thread.id}>\nNow, you can talk about your issue with our staff members.`,
            ephemeral: true,
        });
        const staffRoleId = await getStaffRoleId(interaction.guild.id);
        if (!staffRoleId) {
            console.error("Staff role ID not found. Probably role has been deleted.");
            return;
        }
        const pinMessage = await thread.send({
            content: roleMention(staffRoleId),
            embeds: [embed],
            components: [ticketMenuRow, labelMenuRow, lockButtonRow],
        });
        await thread.members.add(interaction.user);
        if (interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            await pinMessage.pin();
        }
    },
};
