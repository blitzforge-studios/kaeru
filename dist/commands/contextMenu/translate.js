import { ApplicationCommandType, ContextMenuCommandBuilder, ApplicationIntegrationType, InteractionContextType, MessageFlags, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, } from "discord.js";
import translate from "@iamtraction/google-translate";
import { emojis } from "../../utilities/emojis.js";
import { basePermissions } from "../../utilities/permissions.js";
import { checkAppPermissions } from "../../handlers/index.js";
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
    async execute(interaction) {
        if (!(await checkAppPermissions(interaction, basePermissions)))
            return;
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const message = interaction.targetMessage;
        if (!message.content?.trim()) {
            await interaction.editReply({
                content: `${emojis.info} Couldn't find a text to translate in message. Hmm... perhaps it is an embed, attachment or new component?`,
            });
            return;
        }
        try {
            const locale = !["zh-CN", "zh-TW"].includes(interaction.locale)
                ? new Intl.Locale(interaction.locale).language
                : interaction.locale;
            const translated = await translate(message.content.replace(/<a?:.+?:\d{18}>/g, ""), { to: locale });
            const sectionOriginal = new TextDisplayBuilder().setContent([`### ${emojis.globe} Original Message`, message.content].join("\n"));
            const separator = new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true);
            const sectionTranslated = new TextDisplayBuilder().setContent([`### ${emojis.swap} Translated Message`, translated.text].join("\n"));
            await interaction.editReply({
                components: [sectionOriginal, separator, sectionTranslated],
                allowedMentions: { parse: [] },
                flags: MessageFlags.IsComponentsV2,
            });
        }
        catch {
            await interaction.editReply({
                content: `${emojis.error} I'm not sure why, but I'm not feeling well, so I can't translate this message. Please try again later when I'm feeling better. Mwah!`,
            });
        }
    },
};
