import {
    ApplicationCommandType,
    ContextMenuCommandBuilder,
    PermissionFlagsBits,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
} from "discord.js";
import translate from "@iamtraction/google-translate";
import { emojis } from "../../resources/emojis.js";
import { defaultPermissionErrorForBot } from "../../functions/permissionErrors.js";

export default {
    data: new ContextMenuCommandBuilder()
        .setName("Translate")
        .setNameLocalizations({
            it: "Traduci Messaggio",
            tr: "Mesajı Çevir",
            ro: "Traduceți Mesajul",
            el: "Μετάφραση Μηνύματος",
            ChineseCN: "翻译消息",
            "pt-BR": "Traduzir Mensagem",
        })
        .setType(ApplicationCommandType.Message)
        .setIntegrationTypes([
            ApplicationIntegrationType.UserInstall,
            ApplicationIntegrationType.GuildInstall,
        ])
        .setContexts([
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
            InteractionContextType.Guild,
        ]),
    execute: async ({ interaction }) => {
        if (InteractionContextType.Guild) {
            if (
                defaultPermissionErrorForBot(
                    interaction,
                    PermissionFlagsBits.ViewChannel
                ) ||
                defaultPermissionErrorForBot(
                    interaction,
                    PermissionFlagsBits.UseExternalEmojis
                ) ||
                defaultPermissionErrorForBot(
                    interaction,
                    PermissionFlagsBits.SendMessages
                )
            )
                return;
        }

        if (
            Object.keys(interaction.authorizingIntegrationOwners).every(
                (key) => key == ApplicationIntegrationType.UserInstall
            )
        ) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        } else {
            await interaction.deferReply();
        }

        const message = interaction.options.getMessage("message");

        try {
            if (!message.content)
                return interaction.editReply({
                    content: `${emojis.info} This message seems to hold no content—nothing to translate across the threads of time.`,
                });

            const locale = !["zh-CN", "zh-TW"].includes(interaction.locale)
                ? new Intl.Locale(interaction.locale).language
                : interaction.locale;

            const translated = await translate(
                message.content.replace(/(<a?)?:\w+:(\d{18}>)?/g, ""),
                { to: locale }
            );

            await interaction.editReply({
                content: `# ${emojis.translate} Translation\n-# ————————————————————\n### ${emojis.globe} Original Message\n${message.content}\n\n### ${emojis.swap} Translated Message (${locale})\n${translated.text}\n\n-# I sent it on below if you need to copy the message.`,
            });

            return interaction.followUp({
                content: `${translated.text}`,
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            console.log(error);
            await interaction.editReply({
                content: `${emojis.danger} Oh no! A temporal anomaly occurred while translating. Let’s try again later, shall we?`,
            });
        }
    },
};
