import {
    ApplicationCommandType,
    ContextMenuCommandBuilder,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
    AllowedMentionsTypes,
} from "discord.js";
import translate from "@iamtraction/google-translate";
import { emojis } from "../../resources/emojis.js";
import { basePermissions } from "../../resources/BotPermissions.js";
import { checkBotPermissions } from "../../functions/checkPermissions.js";

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
            if (!(await checkBotPermissions(interaction, basePermissions)))
                return;
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

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
                message.content.replace(/<a?:.+?:\d{18}>/g, ""), // Discord emojilerini temizle
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
                content: `${emojis.error} Oh no! A temporal anomaly occurred while translating. Let’s try again later, shall we?`,
            });
        }
    },
};
