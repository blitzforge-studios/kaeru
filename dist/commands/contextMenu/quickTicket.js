import { ApplicationCommandType, ContextMenuCommandBuilder, ApplicationIntegrationType, InteractionContextType, ChannelType, MessageFlags, } from "discord.js";
import { emojis } from "../../utilities/emojis.js";
import { defaultTicketPermissions } from "../../utilities/permissions.js";
import { checkAppPermissions } from "../../handlers/index.js";
import { lockButtonRow } from "../../utilities/buttons.js";
import { ticketMenuRow } from "../../utilities/menus.js";
export default {
    data: new ContextMenuCommandBuilder()
        .setName("Quick-Ticket")
        .setNameLocalizations({
        it: "Biglietto Rapido",
        tr: "Hızlı Talep Formu",
        ro: "Bilet Rapid",
        el: "Γρήγορο Εισιτήριο",
        "zh-CN": "快速票证",
        "pt-BR": "Ingresso Rápido",
    })
        .setType(ApplicationCommandType.Message)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild]),
    async execute(interaction) {
        if (!(await checkAppPermissions(interaction, defaultTicketPermissions)))
            return;
        const message = interaction.targetMessage;
        if (message.channel.type === ChannelType.PublicThread ||
            message.channel.type === ChannelType.PrivateThread) {
            await interaction.reply({
                content: `# ${emojis.reactions.reaction_question}\nYou can't create a ticket inside a thread.`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const channel = interaction.channel;
        const thread = await channel.threads.create({
            name: `— Quick-ticket by ${interaction.user.username}`,
            autoArchiveDuration: 60,
            type: ChannelType.PrivateThread,
            reason: `${interaction.user.username} opened a thread for support`,
            invitable: true,
        });
        await thread.send({
            content: [
                `## ${emojis.ticket} <@${interaction.user.id}>, you have opened a quick-action for this message`,
                `> ${message.content}`,
                `> -# Jump to [message](${message.url})`,
                `> -# ———————————————`,
                `- Message sent by __@${message.author.username}__`,
            ].join("\n"),
            components: [ticketMenuRow, lockButtonRow],
        });
        await interaction.editReply({
            content: `# ${emojis.ticketCreated} Created <#${thread.id}>\nNow, you can talk about your issue with our staff members or server members.`,
        });
    },
};
