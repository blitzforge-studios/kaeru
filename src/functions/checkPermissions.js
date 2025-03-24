import { MessageFlags, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { emojis } from "../resources/emojis.js";

function hasRequiredPermissions(interaction, permission) {
    if (!interaction.guild) return false;

    const botMember = interaction.guild.members.cache.get(
        interaction.client.user.id
    );
    return botMember?.permissions.has(permission) ?? false;
}

export const checkBotPermissions = async (
    interaction,
    permissions,
    customMessage = ""
) => {
    try {
        for (const { permission, errorMessage } of permissions) {
            const hasPermission = hasRequiredPermissions(
                interaction,
                permission
            );

            if (!hasPermission) {
                const embed = new EmbedBuilder()
                    .setDescription(
                        `-# I need \`${Object.keys(PermissionFlagsBits).find(
                            (key) => PermissionFlagsBits[key] === permission
                        )}\` permission to create embed for this response. ${
                            errorMessage || customMessage
                        }`
                    )
                    .setColor(0xffc4c4)
                    .setFooter({
                        text: "Kaeru can send embeds as long as it is interaction message. Kaeru needs Embed Links permission to send embed message as text message.",
                    });

                await interaction.reply({
                    content: emojis.error,
                    embeds: [embed],
                    flags: MessageFlags.Ephemeral,
                });
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error("[Bot Permission Error] Unexpected error:", error);
        return false;
    }
};

export const checkMemberPermissions = async (
    interaction,
    permissions,
    customMessage = ""
) => {
    try {
        if (!interaction.guild || !interaction.member) return false;

        for (const { permission, errorMessage } of permissions) {
            const hasMemberPermission =
                interaction.member.permissions.has(permission);

            if (!hasMemberPermission) {
                const embed = new EmbedBuilder()
                    .setDescription(
                        `-# You don't have \`${Object.keys(
                            PermissionFlagsBits
                        ).find(
                            (key) => PermissionFlagsBits[key] === permission
                        )}\` permission to do this action, <@${
                            interaction.user.id
                        }>. ${errorMessage || customMessage}`
                    )
                    .setColor(0xffc4c4);

                await interaction.reply({
                    content: emojis.danger,
                    embeds: [embed],
                    flags: MessageFlags.Ephemeral,
                });
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error("[Member Permission Error] Unexpected error:", error);
        return false;
    }
};
