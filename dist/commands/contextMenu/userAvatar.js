import { ApplicationCommandType, ApplicationIntegrationType, ContextMenuCommandBuilder, InteractionContextType, MessageFlags, ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, } from "discord.js";
import { emojis } from "../../utilities/emojis.js";
import { basePermissions } from "../../utilities/permissions.js";
import { checkAppPermissions } from "../../handlers/index.js";
export default {
    data: new ContextMenuCommandBuilder()
        .setName("User Avatar")
        .setNameLocalizations({
        tr: "Kullanıcı Avatarı",
        it: "Avatar Utente",
        ro: "Avatar Utilizator",
        el: "Άβαταρ Χρήστη",
        "pt-BR": "Avatar do Usuário",
        "zh-CN": "用户头像",
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
    async execute(interaction) {
        if (interaction.inGuild() &&
            !(await checkAppPermissions(interaction, basePermissions)))
            return;
        const isUserInstallOnly = Object.keys(interaction.authorizingIntegrationOwners).every((key) => key === ApplicationIntegrationType.UserInstall.toString());
        if (isUserInstallOnly) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        }
        else {
            await interaction.deferReply();
        }
        try {
            const userId = interaction.targetUser.id;
            const user = await interaction.client.users.fetch(userId);
            const avatarUrl = user.displayAvatarURL({ size: 4096 });
            const intro = new TextDisplayBuilder().setContent([
                `# ${emojis.avatar} Hey there!`,
                `You're checking out @${user.username}'s profile picture.`,
            ].join("\n"));
            const outro = new TextDisplayBuilder().setContent("-# I like it! 🤌🏻");
            const gallery = new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(avatarUrl));
            const container = new ContainerBuilder()
                .setAccentColor(0xa2845e)
                .addTextDisplayComponents(intro)
                .addMediaGalleryComponents(gallery)
                .addTextDisplayComponents(outro);
            await interaction.editReply({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
            });
        }
        catch (err) {
            console.error("Error fetching user or avatar:", err);
            await interaction.editReply({
                content: `${emojis.danger} Hmm, looks like this person’s gone missing in action. Are you sure they’re around?`,
            });
        }
    },
};
