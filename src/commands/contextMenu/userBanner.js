import {
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    EmbedBuilder,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
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
            ChineseCN: "用户横幅",
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
                    (key) => key == ApplicationIntegrationType.UserInstall
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
                        content: `${emojis.important} Hmm, looks like this user doesn’t have a banner set. Maybe it’s lost in the folds of time?`,
                    });
                } else {
                    const embed = new EmbedBuilder()
                        .setDescription(
                            `# ${emojis.banner} Hey there!\nYou're checking out @${resolved.username}'s banner. Pretty neat, right?`
                        )
                        .setImage(imageURI)
                        .setColor(process.env.EMBED_COLOR);
                    await interaction.editReply({
                        embeds: [embed],
                    });
                }
            });
        } catch (error) {
            console.error(error);
            return interaction.editReply({
                content: `${emojis.danger} Oops! Something went wrong. Maybe a glitch in the timeline?`,
            });
        }
    },
};
