import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, time, MessageFlags, } from "discord.js";
import { emojis } from "../../utilities/emojis.js";
import { defaultLockTicketPermissions } from "../../utilities/permissions.js";
import { checkAppPermissions } from "../../handlers/index.js";
import { lockButtonRow } from "../../utilities/buttons.js";
const menu3 = new StringSelectMenuBuilder()
    .setCustomId("ticket-select-menu")
    .setDisabled(false)
    .setMaxValues(1)
    .setPlaceholder("Action to close ticket")
    .addOptions(new StringSelectMenuOptionBuilder()
    .setLabel("Close as completed")
    .setValue("ticket-menu-done")
    .setDescription("Done, closed, fixed, resolved")
    .setEmoji(emojis.ticketDone)
    .setDefault(false), new StringSelectMenuOptionBuilder()
    .setLabel("Close as not planned")
    .setValue("ticket-menu-duplicate")
    .setDescription("Won’t fix, can’t repo, duplicate, stale")
    .setEmoji(emojis.ticketStale)
    .setDefault(false), new StringSelectMenuOptionBuilder()
    .setLabel("Close with comment")
    .setValue("ticket-menu-close")
    .setEmoji(emojis.ticketClose)
    .setDefault(false));
export const row3 = new ActionRowBuilder().addComponents(menu3);
export default {
    data: {
        customId: "ticket-select-menu",
    },
    async execute({ interaction, }) {
        // Bot izinlerini kontrol et
        const botHasPermission = await checkAppPermissions(interaction, defaultLockTicketPermissions);
        if (!botHasPermission)
            return;
        const selectedValue = interaction.values[0];
        const formattedTime = time(new Date(), "R");
        switch (selectedValue) {
            case "ticket-menu-close": {
                const modal = new ModalBuilder()
                    .setCustomId("ticket-close-modal")
                    .setTitle("Close Ticket")
                    .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder()
                    .setCustomId("close-reason")
                    .setLabel("Reason for closing")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)));
                await interaction.showModal(modal);
                break;
            }
            case "ticket-menu-done": {
                if (interaction.channel?.isTextBased() &&
                    "send" in interaction.channel) {
                    await interaction.channel.send({
                        content: `${emojis.ticketDone} **${interaction.user.username}** __closed__ this as completed ${formattedTime}`,
                    });
                }
                await interaction.reply({
                    content: `# ${emojis.reactions.reaction_thumbsup}`,
                    flags: MessageFlags.Ephemeral,
                });
                if (interaction.channel?.isThread()) {
                    await interaction.channel.setLocked(true);
                }
                if (interaction.channel?.isThread()) {
                    await interaction.channel.setArchived(true, `${interaction.user.username} marked as completed`);
                }
                break;
            }
            case "ticket-menu-duplicate": {
                const menu2 = new StringSelectMenuBuilder()
                    .setCustomId("ticket-select-menu")
                    .setDisabled(false)
                    .setMaxValues(1)
                    .setPlaceholder("What do you want to do?")
                    .addOptions(new StringSelectMenuOptionBuilder()
                    .setLabel("Re-open ticket")
                    .setValue("ticket-menu-reopen")
                    .setEmoji(emojis.ticketReopen)
                    .setDefault(false), new StringSelectMenuOptionBuilder()
                    .setLabel("Close as completed")
                    .setValue("ticket-menu-done")
                    .setDescription("Done, closed, fixed, resolved")
                    .setEmoji(emojis.ticketDone)
                    .setDefault(false), new StringSelectMenuOptionBuilder()
                    .setLabel("Close with comment")
                    .setValue("ticket-menu-close")
                    .setEmoji(emojis.ticketClose));
                const row2 = new ActionRowBuilder().addComponents(menu2);
                await interaction.update({ components: [row2, lockButtonRow] });
                if (interaction.channel && "send" in interaction.channel) {
                    await interaction.channel.send({
                        content: `${emojis.ticketStale} **${interaction.user.username}** __closed__ this as not planned ${formattedTime}`,
                    });
                }
                if (interaction.channel?.isThread()) {
                    await interaction.channel.setArchived(true, `${interaction.user.username} marked as not planned`);
                    break;
                }
            }
            case "ticket-menu-reopen": {
                if (interaction.channel?.isThread()) {
                    await interaction.channel.setArchived(false, `${interaction.user.username} marked as open`);
                }
                await interaction.update({ components: [row3, lockButtonRow] });
                break;
            }
            default:
                break;
        }
    },
};
