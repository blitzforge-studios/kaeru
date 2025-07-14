import {
	ChatInputCommandInteraction,
	ButtonInteraction,
	StringSelectMenuInteraction,
	ModalSubmitInteraction,
	InteractionReplyOptions,
	EmbedBuilder,
	GuildChannelResolvable,
	PermissionFlagsBits,
	ContextMenuCommandInteraction,
} from "discord.js";
import { emojis } from "../utilities/emojis.js";
import type { PermissionEntry } from "../utilities/permissions.js";

type AnyInteraction =
	| ChatInputCommandInteraction
	| ContextMenuCommandInteraction
	| ButtonInteraction
	| StringSelectMenuInteraction
	| ModalSubmitInteraction;

function hasRequiredPermissions(
	interaction:
		| ContextMenuCommandInteraction
		| ChatInputCommandInteraction
		| ButtonInteraction
		| StringSelectMenuInteraction
		| ModalSubmitInteraction,
	permission: bigint,
	targetChannel?: GuildChannelResolvable | null,
): boolean {
	const guild = interaction.guild!;
	const botId = interaction.client.user!.id;
	const botMember = guild.members.cache.get(botId)!;

	const channelToCheck: GuildChannelResolvable =
		targetChannel ?? interaction.channelId!;

	return botMember.permissionsIn(channelToCheck).has(permission);
}

export async function checkAppPermissions(
	interaction: AnyInteraction,
	permissions: PermissionEntry[],
	customMessage = "",
	targetChannel?: GuildChannelResolvable | null,
): Promise<boolean> {
	try {
		for (const { permission, errorMessage } of permissions) {
			if (
				!hasRequiredPermissions(interaction, permission, targetChannel)
			) {
				const permName = (
					Object.entries(PermissionFlagsBits) as [string, bigint][]
				).find(([, val]) => val === permission)?.[0];

				const channelInfo = targetChannel
					? ` in <#${targetChannel}>`
					: "";
				const embed = new EmbedBuilder()
					.setDescription(
						`-# I need \`${permName}\` permission${channelInfo}. ${
							errorMessage || customMessage
						}`,
					)
					.setColor(0xffc4c4)
					.setFooter({
						text: "Kaeru requires the proper permissions to perform this action.",
					});

				const replyOptions: InteractionReplyOptions = {
					content: emojis.error,
					embeds: [embed],
					ephemeral: true,
				};

				if (interaction.deferred || interaction.replied) {
					await interaction.editReply({
						content: replyOptions.content,
						embeds: replyOptions.embeds,
					});
				} else {
					await interaction.reply(replyOptions);
				}
				return false;
			}
		}
		return true;
	} catch (err) {
		console.error("[Bot Permission Error]", err);
		return false;
	}
}

type MemberInteraction =
	| ChatInputCommandInteraction
	| ContextMenuCommandInteraction;

export async function checkMemberPermissions(
	interaction: MemberInteraction,
	permissions: PermissionEntry[],
	customMessage = "",
): Promise<boolean> {
	try {
		const member = interaction.member;
		if (!interaction.guild || !member || !("permissions" in member)) {
			return false;
		}

		for (const { permission, errorMessage } of permissions) {
			if (
				typeof member.permissions === "string" ||
				!member.permissions.has(permission)
			) {
				const permName = (
					Object.entries(PermissionFlagsBits) as [string, bigint][]
				).find(([, val]) => val === permission)?.[0];

				const embed = new EmbedBuilder()
					.setDescription(
						`-# You need \`${permName}\` permission to do this. ${
							errorMessage || customMessage
						}`,
					)
					.setColor(0xffc4c4);

				const replyOptions: InteractionReplyOptions = {
					content: emojis.danger,
					embeds: [embed],
					ephemeral: true,
				};

				if (interaction.deferred || interaction.replied) {
					await interaction.editReply({
						content: replyOptions.content,
						embeds: replyOptions.embeds,
					});
				} else {
					await interaction.reply(replyOptions);
				}
				return false;
			}
		}
		return true;
	} catch (err) {
		console.error("[Member Permission Error]", err);
		return false;
	}
}
