import {
    ApplicationCommandType,
    ContextMenuCommandBuilder,
    ApplicationIntegrationType,
    InteractionContextType,
    ChannelType,
    MessageFlags,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
} from "discord.js";
import { emojis } from "../../resources/emojis.js";
import { defaultTicketPermissions } from "../../resources/BotPermissions.js";
import { checkBotPermissions } from "../../functions/checkPermissions.js";
import { lockButton } from "../../components/modals/create-ticket-title.js";

export default {
    data: new ContextMenuCommandBuilder()
        .setName("Quick-Ticket")
        .setNameLocalizations({
            it: "Biglietto Rapido",
            tr: "Hızlı Bilet",
            ro: "Bilet Rapid",
            el: "Γρήγορο Εισιτήριο",
            ChineseCN: "快速票证",
            "pt-BR": "Ingresso Rápido",
        })
        .setType(ApplicationCommandType.Message)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild]),
    execute: async ({ interaction }) => {
        if (!(await checkBotPermissions(interaction, defaultTicketPermissions)))
            return;

        const message = interaction.options.getMessage("message");

        if (message.channel.isThread()) {
            return interaction.reply({
                content: `${emojis.info} You can't create ticket inside ticket. Huh?`,
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.deferReply({
            flags: MessageFlags.Ephemeral,
        });

        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket-select-menu")
            .setDisabled(false)
            .setMaxValues(1)
            .setPlaceholder("Action to close ticket")
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel("Close as completed")
                    .setValue("ticket-menu-close")
                    .setDescription("Done, closed, fixed, resolved")
                    .setEmoji(emojis.ticketDone)
                    .setDefault(false),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Close as not planned")
                    .setValue("ticket-menu-duplicate")
                    .setDescription("Won’t fix, can’t repo, duplicate, stale")
                    .setEmoji(emojis.ticketStale)
            );

        const menuRow = new ActionRowBuilder().addComponents(menu);

        let thread = await interaction.channel.threads.create({
            name: `— Quick-ticket by ${interaction.user.username}`,
            autoArchiveDuration: 60,
            type: ChannelType.PrivateThread,
            reason: `${interaction.user.username} opened a thread for support`,
            invitable: true,
        });

        await thread.send({
            content: `## ${emojis.ticket} <@${interaction.user.id}>, you have opened a quick-support for this message\n> ${message.content}\n> -# Jump to [message](${message.url})\n> -# ———————————————\n- Message sent by __@${message.author.username}__`,
            components: [menuRow, lockButton],
            flags: MessageFlags.HasThread,
        });

        await interaction.editReply({
            content: `# ${emojis.ticketCreated} Created <#${thread.id}>\nNow, you can talk about your issue with our staff members.`,
        });
    },
};
