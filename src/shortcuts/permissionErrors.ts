import {
    MessageFlags,
    PermissionFlagsBits,
    bold,
    ChatInputCommandInteraction,
    PermissionsBitField,
} from "discord.js";
import { emojis } from "./emojis";

// For bot
export const defaultPermissionErrorForBot = (
    interaction: ChatInputCommandInteraction,
    permission: bigint,
    additionalText: string = ""
): boolean => {
    const PERMISSION_NAME =
        Object.keys(PermissionFlagsBits).find(
            (key) =>
                PermissionFlagsBits[key as keyof typeof PermissionFlagsBits] ===
                permission
        ) ?? "Unknown Permission";

    const hasPermission =
        interaction.guild?.members.me?.permissions instanceof
        PermissionsBitField
            ? interaction.guild.members.me.permissions.has(permission)
            : false;

    if (!hasPermission) {
        interaction.reply({
            content: `${emojis.important} I don't have ${bold(
                PERMISSION_NAME
            )} permission to perform this action, <@${interaction.user.id}>.${
                additionalText ? `\n>>> ${additionalText}` : ""
            }`,
            flags: MessageFlags.Ephemeral,
        });
        return true;
    }

    return false;
};

// For user
export const defaultPermissionErrorForMember = (
    interaction: ChatInputCommandInteraction,
    permission: bigint,
    additionalText: string = ""
): boolean => {
    const PERMISSION_NAME =
        Object.keys(PermissionFlagsBits).find(
            (key) =>
                PermissionFlagsBits[key as keyof typeof PermissionFlagsBits] ===
                permission
        ) ?? "Unknown Permission";

    const hasPermission =
        interaction.member?.permissions instanceof PermissionsBitField
            ? interaction.member.permissions.has(permission)
            : false;

    if (!hasPermission) {
        interaction.reply({
            content: `${emojis.important} You don't have ${bold(
                PERMISSION_NAME
            )} permission to perform this action, <@${interaction.user.id}>.${
                additionalText ? `\n>>> ${additionalText}` : ""
            }`,
            flags: MessageFlags.Ephemeral,
        });
        return true;
    }

    return false;
};
