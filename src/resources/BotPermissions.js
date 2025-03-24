import { PermissionFlagsBits } from "discord.js";

export const basePermissions = [
    { permission: PermissionFlagsBits.ViewChannel },
    { permission: PermissionFlagsBits.SendMessages },
    {
        permission: PermissionFlagsBits.UseExternalEmojis,
        errorMessage:
            "Please notify the staff that Kaeru can't use external emojis.",
    },
    {
        permission: PermissionFlagsBits.EmbedLinks,
        errorMessage:
            "Please notify the staff that Kaeru can't create embed links.",
    },
    {
        permission: PermissionFlagsBits.AttachFiles,
        errorMessage: "Please notify the staff that Kaeru can't attach files.",
    },
];

export const defaultTicketPermissions = [
    ...basePermissions,
    {
        permission: PermissionFlagsBits.CreatePrivateThreads,
        errorMessage:
            "Please forward 'Kaeru can't create private thread' message to the staff.",
    },
    {
        permission: PermissionFlagsBits.SendMessagesInThreads,
        errorMessage:
            "Please notify the staff that Kaeru cannot create threads and add you.",
    },
];

export const defaultLockTicketPermissions = [
    ...basePermissions,
    {
        permission: PermissionFlagsBits.ManageThreads,
        errorMessage:
            "Kaeru can't manage threads, so Kaeru can't lock tickets. 🥹",
    },
    {
        permission: PermissionFlagsBits.ViewAuditLog,
        errorMessage: "Kaeru can't view audit logs to receive information.",
    },
];

export const defaultGiveawayPermissions = [
    ...basePermissions,
    {
        permission: PermissionFlagsBits.ManageEvents,
    },
    {
        permission: PermissionFlagsBits.CreateEvents,
    },
];
