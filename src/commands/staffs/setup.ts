import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
	ChannelType,
	PermissionFlagsBits,
	underline,
	bold,
	MessageFlags,
	ApplicationIntegrationType,
	InteractionContextType,
	ContainerBuilder,
	TextDisplayBuilder,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextChannel,
	NewsChannel,
} from "discord.js";
import { emojis } from "../../utilities/emojis.js";
import { basePermissions } from "../../utilities/permissions.js";
import { checkAppPermissions } from "../../handlers/index.js";
import {
	saveStaffRoleId,
	setupLoggingChannel,
} from "../../utilities/database.js";

export default {
	data: new SlashCommandBuilder()
		.setName("setup")
		.setDescription("Setup things!")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.Guild])
		.addSubcommand((sub) =>
			sub
				.setName("ticket")
				.setDescription("Setup ticket system")
				.addRoleOption((opt) =>
					opt
						.setName("staff_role")
						.setDescription("Support staff role")
						.setRequired(true),
				)
				.addChannelOption((opt) =>
					opt
						.setName("channel")
						.setDescription("Channel to send ticket messages")
						.addChannelTypes(ChannelType.GuildText)
						.setRequired(true),
				)
				.addStringOption((opt) =>
					opt
						.setName("description")
						.setDescription("Message shown when creating a ticket"),
				)
				.addAttachmentOption((opt) =>
					opt
						.setName("image")
						.setDescription("Banner image for the ticket embed"),
				),
		)
		.addSubcommand((sub) =>
			sub
				.setName("logs")
				.setDescription("Setup logging channel")
				.addChannelOption((opt) =>
					opt
						.setName("channel")
						.setDescription("Channel to receive logs")
						.addChannelTypes(
							ChannelType.GuildText,
							ChannelType.PublicThread,
						)
						.setRequired(true),
				),
		),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		// Permission check
		if (
			interaction.inGuild() &&
			!(await checkAppPermissions(interaction, basePermissions))
		) {
			return;
		}

		const guild = interaction.guild!;
		const sub = interaction.options.getSubcommand();

		// ─── TICKET SETUP ──────────────────────────────────────────────
		if (sub === "ticket") {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			const staffRoleId = interaction.options.getRole(
				"staff_role",
				true,
			).id;
			const banner = interaction.options.getAttachment("image");
			const sendingChannel = interaction.options.getChannel(
				"channel",
				true,
			);

			// Kanal tipi kontrolü
			if (!(sendingChannel instanceof TextChannel)) {
				await interaction.editReply({
					content: `${emojis.danger} Selected channel is not a text channel.`,
				});
				return;
			}

			// Bot izin kontrolü
			if (
				!sendingChannel
					.permissionsFor(guild.members.me!)
					.has([
						PermissionFlagsBits.ViewChannel,
						PermissionFlagsBits.SendMessages,
					])
			) {
				await interaction.editReply({
					content: `${emojis.danger} I don't have permission in ${sendingChannel}!`,
				});
				return;
			}

			// V2 container oluşturma
			const container = new ContainerBuilder()
				.setAccentColor(0xa2845e)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						interaction.options.getString("description") ||
							`# ${emojis.button} Create a Ticket\nUse the button below to open a support thread.`,
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Large)
						.setDivider(true),
				)
				.addMediaGalleryComponents(
					new MediaGalleryBuilder().addItems(
						new MediaGalleryItemBuilder().setURL(
							banner?.url ??
								"https://media.discordapp.net/...default.png",
						),
					),
				);

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId("create-ticket")
					.setLabel("Create ticket")
					.setStyle(ButtonStyle.Secondary)
					.setEmoji(emojis.ticket),
			);

			await interaction.editReply({
				content: `${emojis.ticketCreated} Ticket system setup successfully!`,
			});

			await saveStaffRoleId(guild.id, staffRoleId);
			await sendingChannel.send({
				components: [container, row],
				flags: MessageFlags.IsComponentsV2,
			});

			// Pin önerisi
			if (
				!guild.members.me!.permissions.has(
					PermissionFlagsBits.ManageMessages,
				)
			) {
				await interaction.followUp({
					content: `## ${emojis.danger} ${underline(
						"Recommending",
					)}\nGrant ${bold(
						"Manage Messages",
					)} so staff can pin the button message.`,
					flags: MessageFlags.Ephemeral,
				});
			}
		}

		// ─── LOGS SETUP ────────────────────────────────────────────────
		if (sub === "logs") {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			const loggingChannel = interaction.options.getChannel(
				"channel",
				true,
			);

			// Kanal tipi kontrolü
			if (
				!(
					loggingChannel instanceof TextChannel ||
					loggingChannel instanceof NewsChannel
				)
			) {
				await interaction.editReply({
					content: `${emojis.danger} Selected channel cannot receive logs.`,
				});
				return;
			}

			// Bot izin kontrolü
			if (
				!loggingChannel
					.permissionsFor(guild.members.me!)
					.has(PermissionFlagsBits.SendMessages)
			) {
				await interaction.editReply({
					content: `${emojis.danger} I can't send messages in ${loggingChannel}!`,
				});
				return;
			}

			await setupLoggingChannel(guild.id, loggingChannel.id);

			await loggingChannel.send({
				content: `${emojis.info} Logs channel is now set up.`,
			});

			await interaction.editReply({
				content: `### ${emojis.info} Done!\nI will log events there instead of Audit Logs.`,
			});
		}
	},
} as const;
