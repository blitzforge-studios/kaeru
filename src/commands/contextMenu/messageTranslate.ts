import {
    ApplicationCommandType,
    ContextMenuCommandBuilder,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
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
            "zh-CN": "翻译消息",
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
            if (
                !message ||
                typeof message.content !== "string" ||
                message.content.trim() === ""
            )
                return interaction.editReply({
                    content: `${emojis.info} This message seems to hold no content—nothing to translate so... this means nothing to translate. \n-# Message shouldn't be inside an embed or container telling it in case c:`,
                });

            const locale = !["zh-CN", "zh-TW"].includes(interaction.locale)
                ? new Intl.Locale(interaction.locale).language
                : interaction.locale;

            const translated = await translate(
                message.content.replace(/<a?:.+?:\d{18}>/g, ""),
                { to: locale }
            );

            const sectionOriginal = new TextDisplayBuilder().setContent(
                [`### ${emojis.globe} Original Message`, message.content].join(
                    "\n"
                )
            );

            const separator = new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true);

            const sectionTranslated = new TextDisplayBuilder().setContent(
                [`### ${emojis.swap} Translated Message`, translated.text].join(
                    "\n"
                )
            );

            await interaction.editReply({
                components: [sectionOriginal, separator, sectionTranslated],
                allowedMentions: {
                    parse: [],
                },
                flags: MessageFlags.IsComponentsV2,
            });
        } catch (error) {
            console.log(error);
            await interaction.editReply({
                content: `${emojis.error} Oh no! A temporal anomaly occurred while translating. Let’s try again later, shall we?`,
            });
        }
    },
};
