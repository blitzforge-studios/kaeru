import {
    ApplicationCommandType,
    ApplicationIntegrationType,
    ContextMenuCommandBuilder,
    InteractionContextType,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    MediaGalleryItemBuilder,
    MediaGalleryBuilder,
} from "discord.js";
import { emojis } from "../../resources/emojis.js";
import { basePermissions } from "../../resources/BotPermissions.js";
import { checkBotPermissions } from "../../functions/checkPermissions.js";

export default {
    data: new ContextMenuCommandBuilder()
        .setName("User Avatar")
        .setNameLocalizations({
            tr: "Kullanıcı Avatarı",
            it: "Avatar Utente",
            ro: "Avatar Utilizator",
            el: "Άβαταρ Χρήστη",
            "pt-BR": "Avatar do Usuário",
            ChineseCN: "用户头像",
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

        if (
            Object.keys(interaction.authorizingIntegrationOwners).every(
                (key) => key == ApplicationIntegrationType.UserInstall
            )
        ) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        } else {
            await interaction.deferReply();
        }

        try {
            const userId = interaction.targetId;
            const user = await client.users.fetch(userId);
            const userAvatar = user.displayAvatarURL({
                size: 4096,
            });

            const text1 = new TextDisplayBuilder().setContent(
                [
                    `# ${emojis.avatar} Hey there!`,
                    `You're checking out @${user.username}'s profile picture.`,
                ].join("\n")
            );
            const text2 = new TextDisplayBuilder().setContent(
                "-# I like it! 🤌🏻"
            );

            const mediaGallery = new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder().setURL(userAvatar)
            );

            const container = new ContainerBuilder()
                .setAccentColor(0xa2845e)
                .addTextDisplayComponents(text1)
                .addMediaGalleryComponents(mediaGallery)
                .addTextDisplayComponents(text2);

            await interaction.editReply({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
            });
        } catch (error) {
            console.error("Error fetching user or avatar:", error);

            return interaction.editReply({
                content: `${emojis.danger} Hmm, looks like this person’s gone missing in action. Are you sure they’re around?`,
            });
        }
    },
};
