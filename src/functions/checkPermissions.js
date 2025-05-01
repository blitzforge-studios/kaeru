import { MessageFlags, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { emojis } from "../resources/emojis.js";

function hasRequiredPermissions(interaction, permission) {
    if (!interaction.guild) return false;

    const botMember = interaction.guild.members.cache.get(
        interaction.client.user.id
    );

    if (interaction.channel) {
        return (
            botMember?.permissionsIn(interaction.channel).has(permission) ??
            false
        );
    } else {
        return botMember?.permissions.has(permission) ?? false;
    }
}

export const checkBotPermissions = async (
    interaction,
    permissions,
    customMessage = "",
    targetChannel = null
) => {
    try {
        const contextToCheck = targetChannel
            ? {
                  ...interaction,
                  channel: targetChannel,
              }
            : interaction;

        for (const { permission, errorMessage } of permissions) {
            const hasPermission = hasRequiredPermissions(
                contextToCheck,
                permission
            );

            if (!hasPermission) {
                const permissionName = Object.keys(PermissionFlagsBits).find(
                    (key) => PermissionFlagsBits[key] === permission
                );

                const channelInfo = targetChannel
                    ? `in channel <#${targetChannel.id}>`
                    : "";

                const embed = new EmbedBuilder()
                    .setDescription(
                        `-# I need \`${permissionName}\` permission ${channelInfo} to create embed for this response. ${
                            errorMessage || customMessage
                        }`
                    )
                    .setColor(0xffc4c4)
                    .setFooter({
                        text: "Kaeru can send embeds as long as it is interaction message. Kaeru needs Embed Links permission to send embed message as text message.",
                    });

                const responseData = {
                    content: emojis.error,
                    embeds: [embed],
                    flags: MessageFlags.Ephemeral,
                };

                // Check if the interaction has already been replied to or deferred
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply(responseData);
                } else {
                    await interaction.reply(responseData);
                }

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
                const permissionName = Object.keys(PermissionFlagsBits).find(
                    (key) => PermissionFlagsBits[key] === permission
                );

                const embed = new EmbedBuilder()
                    .setDescription(
                        `-# You don't have \`${permissionName}\` permission to do this action, <@${
                            interaction.user.id
                        }>. ${errorMessage || customMessage}`
                    )
                    .setColor(0xffc4c4);

                const responseData = {
                    content: emojis.danger,
                    embeds: [embed],
                    flags: MessageFlags.Ephemeral,
                };

                // Check if the interaction has already been replied to or deferred
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply(responseData);
                } else {
                    await interaction.reply(responseData);
                }

                return false;
            }
        }
        return true;
    } catch (error) {
        console.error("[Member Permission Error] Unexpected error:", error);
        return false;
    }
};
