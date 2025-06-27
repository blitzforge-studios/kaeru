import {
    SlashCommandBuilder,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
} from "discord.js";
import { stop } from "../../music/player.js";
import { emojis } from "../../resources/emojis.js";

export default {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stop the music and leave")
        .setIntegrationTypes([
            ApplicationIntegrationType.GuildInstall,
        ])
        .setContexts([InteractionContextType.Guild]),

    async execute({ interaction }) {
        const connection = interaction.guild ? interaction.guild.id : null;
        if (!connection) {
            return interaction.reply({
                content: `${emojis.error} Nothing is playing.`,
                flags: MessageFlags.Ephemeral,
            });
        }
        stop(connection);
        return interaction.reply({
            content: `${emojis.reactions.reaction_thumbsup} Stopped playback.`,
            flags: MessageFlags.Ephemeral,
        });
    },
};
