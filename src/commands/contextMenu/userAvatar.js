import {
    ApplicationCommandType,
    ApplicationIntegrationType,
    EmbedBuilder,
    ContextMenuCommandBuilder,
    InteractionContextType,
    PermissionFlagsBits,
    MessageFlags,
} from "discord.js";
import { emojis } from "../../functions/emojis.js";

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
            if (
                defaultPermissionErrorForBot(
                    interaction,
                    PermissionFlagsBits.UseExternalEmojis
                ) ||
                defaultPermissionErrorForBot(
                    interaction,
                    PermissionFlagsBits.EmbedLinks
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

        try {
            const userId = interaction.targetId;
            const user = await client.users.fetch(userId);
            const avatar = user.displayAvatarURL({
                size: 4096,
            });

            const embed = new EmbedBuilder()
                .setDescription(
                    `# ${emojis.avatar} Hey there!\nYou're checking out @${user.username}'s profile picture. Pretty cool, right?`
                )
                .setImage(avatar)
                .setColor(process.env.EMBED_COLOR);

            await interaction.editReply({
                embeds: [embed],
            });
        } catch (error) {
            console.error("Error fetching user or avatar:", error);

            return interaction.editReply({
                content: `${emojis.important} Hmm, looks like this person’s gone missing in action. Are you sure they’re around?`,
            });
        }
    },
};
