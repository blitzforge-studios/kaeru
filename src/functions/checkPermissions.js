import { MessageFlags, PermissionFlagsBits } from "discord.js";
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
                await interaction.reply({
                    content: `${
                        emojis.important
                    } I don't have the necessary permission: \`${Object.keys(
                        PermissionFlagsBits
                    ).find(
                        (key) => PermissionFlagsBits[key] === permission
                    )}\`. ${errorMessage || customMessage}`,
                    flags: MessageFlags.Ephemeral,
                });
                return false; // İzin yoksa false dön
            }
        }
        return true; // Tüm izinler varsa true dön
    } catch (error) {
        console.error("[Bot Permission Error] Unexpected error:", error);
        return false; // Hata durumunda false dön
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
                await interaction.reply({
                    content: `${
                        emojis.important
                    } You don't have \`${Object.keys(PermissionFlagsBits).find(
                        (key) => PermissionFlagsBits[key] === permission
                    )}\` permission to do this action, <@${
                        interaction.user.id
                    }>. ${errorMessage || customMessage}`,
                    flags: MessageFlags.Ephemeral,
                });
                return false; // İzin yoksa false dön
            }
        }
        return true; // Tüm izinler varsa true dön
    } catch (error) {
        console.error("[Member Permission Error] Unexpected error:", error);
        return false; // Hata durumunda false dön
    }
};
