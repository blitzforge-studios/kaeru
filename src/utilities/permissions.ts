import { PermissionFlagsBits } from "discord.js";

export interface PermissionEntry {
	permission: bigint;
	errorMessage?: string;
}

export const basePermissions: PermissionEntry[] = [
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

export const defaultTicketPermissions: PermissionEntry[] = [
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

export const defaultLockTicketPermissions: PermissionEntry[] = [
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

export const defaultAnnounceMessagePermissions: PermissionEntry[] = [
	...basePermissions,
	{
		permission: PermissionFlagsBits.ManageMessages,
		errorMessage:
			"Kaeru can't manage messages, so Kaeru can't publish your message. Also before deleting this message, copy your text on the slash command, so you don't have to rewrite it :3",
	},
	{
		permission: PermissionFlagsBits.MentionEveryone,
		errorMessage:
			"Kaeru can't mention everyone and roles, so Kaeru can't really announce it for you... Also before deleting this message, copy your text on the slash command, so you don't have to rewrite it :3",
	},
	{
		permission: PermissionFlagsBits.ManageWebhooks,
		errorMessage:
			"Kaeru can't create webhooks for that channel, so Kaeru can't really announce it for you... Also before deleting this message, copy your text on the slash command, so you don't have to rewrite it :3",
	},
	{
		permission: PermissionFlagsBits.CreatePublicThreads,
		errorMessage:
			"Kaeru can't create threads for that channel, so Kaeru can't really announce it for you... Also before deleting this message, copy your text on the slash command, so you don't have to rewrite it :3",
	},
	{
		permission: PermissionFlagsBits.AddReactions,
		errorMessage:
			"Kaeru can't add reactions for that channel, make it avaliable so Kaeru can add reactions for you to make your announcement look good. Also before deleting this message, copy your text on the slash command, so you don't have to rewrite it :3",
	},
];

export const defaultGiveawayPermissions: PermissionEntry[] = [
	...basePermissions,
	{ permission: PermissionFlagsBits.ManageEvents },
	{ permission: PermissionFlagsBits.CreateEvents },
];
