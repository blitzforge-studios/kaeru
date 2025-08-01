import { ChannelType, PermissionFlagsBits, MessageFlags } from "discord.js";
import { emojis } from "../../resources/emojis.js";
import { defaultTicketPermissions } from "../../resources/BotPermissions.js";
import { checkBotPermissions } from "../../functions/checkPermissions.js";
import { ticketMenuRow } from "../../resources/selectMenus.js";
import { lockButtonRow } from "../../resources/buttons.js";
import { summarizeTicketTitle } from "../../functions/summarizeTicketTitle.js";
import { ticketContainerData } from "../../resources/ticketDefaultData.js";

const webhookStorage = new Map();

export default {
	data: {
		customId: /^create-ticket-modal\|/,
	},

	execute: async ({ interaction }) => {
		if (!(await checkBotPermissions(interaction, defaultTicketPermissions)))
			return;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const [, rawLabel] = interaction.customId.split("|");
		const labelKey = rawLabel?.replace("label-", "");
		const label = labelKey?.toUpperCase();
		const emoji =
			emojis.ticket.label?.[labelKey] || emojis.ticket.label.bug;

		const userMessage = interaction.fields.getTextInputValue("message");

		const summarizedTitle = await summarizeTicketTitle(userMessage);
		const fallback = userMessage.slice(0, 90).replace(/\n/g, " ").trim();
		const safeSummary = summarizedTitle
			?.slice(0, 90)
			.replace(/\n/g, " ")
			.trim();
		const finalTitle = `[${label}] ${safeSummary || fallback}`.slice(
			0,
			100,
		);

		const thread = await interaction.channel.threads.create({
			name: finalTitle,
			autoArchiveDuration: 1440,
			type: ChannelType.PrivateThread,
			reason: `${interaction.user.username} opened a thread for support`,
			invitable: false,
		});

		await interaction.editReply({
			content: `# ${emoji} Created <#${thread.id}>\nNow, you can talk about your issue with our staff members.`,
		});

		const container = await ticketContainerData(interaction, userMessage);

		await thread.members.add(interaction.user);

		const pinMessage = await thread.send({
			components: [container, ticketMenuRow, lockButtonRow],
			flags: MessageFlags.IsComponentsV2,
		});

		if (
			interaction.guild.members.me.permissions.has(
				PermissionFlagsBits.ManageMessages,
			)
		) {
			await pinMessage.pin();
		}

		if (
			!interaction.guild.members.me.permissions.has(
				PermissionFlagsBits.ManageWebhooks,
			)
		) {
			await thread.send({
				content: `>>> ${userMessage}`,
			});
			return;
		}

		let webhook;
		let webhookData = webhookStorage.get(thread.parentId);

		try {
			if (webhookData) {
				webhook = await interaction.client.fetchWebhook(
					webhookData.id,
					webhookData.token,
				);
			} else {
				const webhooks = await thread.parent.fetchWebhooks();
				const existing = webhooks.find(
					(wh) => wh.name === "KaeruTicketWebhook",
				);

				if (existing && existing.token) {
					webhook = await interaction.client.fetchWebhook(
						existing.id,
						existing.token,
					);
					webhookStorage.set(thread.parentId, {
						id: existing.id,
						token: existing.token,
					});
				} else if (!existing) {
					webhook = await thread.parent.createWebhook({
						name: "KaeruTicketWebhook",
						avatar: "https://cdn.discordapp.com/attachments/736571695170584576/1327617435418755185/23679.png?ex=688e0696&is=688cb516&hm=94d4df8ef1e62de0f1b8a5076e5333962fbd6e92906e5b360100a3c7d46c4a84&",
						reason: "Webhook for ticket message delivery",
					});
					webhookStorage.set(thread.parentId, {
						id: webhook.id,
						token: webhook.token,
					});
				}
			}
		} catch {
			webhook = null;
		}

		if (webhook) {
			await webhook.send({
				content: `>>> ${userMessage}`,
				threadId: thread.id,
				allowedMentions: { repliedUser: false },
				username: interaction.user.username,
				avatarURL: interaction.user.displayAvatarURL({
					forceStatic: false,
				}),
			});
		} else {
			await thread.send({
				content: `>>> ${userMessage}`,
			});
		}
	},
};
