import {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
} from "discord.js";
import { emojis } from "../../resources/emojis.js";
import { basePermissions } from "../../resources/BotPermissions.js";
import { checkBotPermissions } from "../../functions/checkPermissions.js";

export default {
    data: new ContextMenuCommandBuilder()
        .setName("User Banner")
        .setNameLocalizations({
            it: "Banner Utente",
            tr: "Kullanıcı Afişi",
            ro: "Banner Utilizator",
            el: "Σημαιάκι Χρήστη",
            "pt-BR": "Banner do Usuário",
            "zh-CN": "用户横幅",
        })
        .setType(ApplicationCommandType.User)
        .setIntegrationTypes([
            ApplicationIntegrationType.UserInstall,
            ApplicationIntegrationType.GuildInstall,
        ])
        .setContexts([
            InteractionContextType.BotDM,
            InteractionContextType.PrivateChannel,
            InteractionContextType.Guild,
        ]),
    execute: async ({ interaction, client }) => {
        if (InteractionContextType.Guild) {
            if (!(await checkBotPermissions(interaction, basePermissions)))
                return;
        }

        try {
            if (
                Object.keys(interaction.authorizingIntegrationOwners).every(
                    (key) =>
                        Number(key) === ApplicationIntegrationType.UserInstall
                )
            ) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            } else {
                await interaction.deferReply();
            }

            const user = client.users.fetch(interaction.targetId, {
                force: true,
            });

            user.then(async (resolved) => {
                const imageURI = resolved.bannerURL({ size: 4096 });

                if (imageURI === null) {
                    await interaction.editReply({
                        content: `${emojis.danger} Hmm, looks like this user doesn’t have a banner set. Maybe it’s lost in the folds of time?`,
                    });
                } else {
                    const container = new ContainerBuilder()
                        .setAccentColor(0xa2845e)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
                                [
                                    `# ${emojis.banner} Hey there!`,
                                    `You're checking out @${resolved.username}'s banner. Pretty neat, right?`,
                                ].join("\n")
                            )
                        )
                        .addMediaGalleryComponents(
                            new MediaGalleryBuilder().addItems(
                                new MediaGalleryItemBuilder().setURL(imageURI)
                            )
                        );

                    await interaction.editReply({
                        components: [container],
                        flags: MessageFlags.IsComponentsV2,
                    });
                }
            });
        } catch (error) {
            console.error(error);
            return interaction.editReply({
                content: `${emojis.error} Oops! Something went wrong. Maybe a glitch in the timeline?`,
            });
        }
    },
};
