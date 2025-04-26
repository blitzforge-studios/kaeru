import {
    ApplicationCommandType,
    ContextMenuCommandBuilder,
    ApplicationIntegrationType,
    InteractionContextType,
    ChannelType,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
} from "discord.js";
import { emojis } from "../../resources/emojis.js";
import { defaultTicketPermissions } from "../../resources/BotPermissions.js";
import { checkBotPermissions } from "../../functions/checkPermissions.js";
import { lockButtonRow } from "../../resources/buttons.js";
import { ticketMenuRow } from "../../resources/selectMenus.js";

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
                content: `# ${emojis.reactions.reaction_question}\nYou can't create ticket inside thread. Huh... w-what is going on?`,
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.deferReply({
            flags: MessageFlags.Ephemeral,
        });

        let thread = await interaction.channel.threads.create({
            name: `— Quick-ticket by ${interaction.user.username}`,
            autoArchiveDuration: 60,
            type: ChannelType.PrivateThread,
            reason: `${interaction.user.username} opened a thread for quick-action`,
            invitable: true,
        });

        const container = new ContainerBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    [
                        `## ${emojis.ticket} <@${interaction.user.id}>, you have opened a quick-action for this message`,
                        "-# Please mention the member(s) you want them be discussing this message with you.",
                    ].join("\n")
                )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setDivider(true)
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    [
                        `> ${message.content}`,
                        `> -# Jump to [message](${message.url})`,
                        `-# Message sent by __@${message.author.username}__`,
                    ].join("\n")
                )
            );

        await thread.send({
            components: [container, ticketMenuRow, lockButtonRow],
            flags: MessageFlags.IsComponentsV2,
        });

        await interaction.editReply({
            content: `# ${emojis.ticketCreated} Created <#${thread.id}>\nNow, you can talk about your issue with our staff members or other members.`,
        });
    },
};
