import {
	SlashCommandBuilder,
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
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import { emojis } from "../../resources/emojis.js";
import { basePermissions } from "../../resources/BotPermissions.js";
import { checkBotPermissions } from "../../functions/checkPermissions.js";
import {
	saveStaffRoleId,
	setupLoggingChannel,
} from "../../functions/database.js";

export default {
	data: new SlashCommandBuilder()
		.setName("setup")
		.setNameLocalizations({
			tr: "kur",
			it: "impostare",
			ChineseCN: "设置",
		})
		.setDescription("Setup things!")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
		.setContexts([InteractionContextType.Guild])
		.addSubcommand((subcommand) =>
			subcommand
				.setName("ticket")
				.setNameLocalizations({
					"zh-CN": "票",
					it: "biglietto",
					tr: "talep-formu",
				})
				.setDescription("Setup ticket system with threads!")
				.setDescriptionLocalizations({
					"zh-CN": "使用线程设置票证系统。",
					it: "Configurazione del sistema di ticket con thread.",
					tr: "Alt başlıklarla talep formu kurulumunu yap.",
				})
				.addRoleOption((option) =>
					option
						.setName("staff_role")
						.setNameLocalizations({
							"zh-CN": "员工角色",
							it: "ruolo_del_personale",
							tr: "personel_rolü",
						})
						.setDescription(
							"Role to be tagged when ticket channel is created",
						)
						.setDescriptionLocalizations({
							"zh-CN": "创建工单通道时要标记的角色",
							it: "Ruolo da taggare quando viene creato il canale ticket",
							tr: "Talep kanalı oluşturulduğunda etiketlenecek rol",
						})
						.setRequired(true),
				)
				.addChannelOption((option) =>
					option
						.addChannelTypes(ChannelType.GuildText)
						.setName("channel")
						.setNameLocalizations({
							"zh-CN": "渠道",
							it: "canale",
							tr: "kanal",
						})
						.setDescription("Please select a channel")
						.setDescriptionLocalizations({
							"zh-CN": "选择要将消息发送到的频道",
							it: "Seleziona un canale a cui inviare il messaggio",
							tr: "Mesajın gönderileceği kanalı seçin",
						})
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName("description")
						.setNameLocalizations({
							"zh-CN": "描述",
							it: "descrizione",
							tr: "açıklama",
						})
						.setDescription("Set description of embed message")
						.setDescriptionLocalizations({
							"zh-CN": "设置嵌入消息的描述",
							it: "Imposta la descrizione del messaggio incorporato",
							tr: "Zengin mesajının açıklamasını ayarlayın",
						})
						.setRequired(false),
				)
				.addStringOption((option) =>
					option
						.setName("image_url")
						.setNameLocalizations({
							ChineseCN: "图片链接",
							it: "url_immagine",
							tr: "resim_bağlantısı",
							"pt-BR": "url_imagem",
							ro: "url_imagine",
							el: "σύνδεσμος_εικόνας",
						})
						.setDescription(
							"Provide a custom image URL for the ticket banner!",
						)
						.setDescriptionLocalizations({
							ChineseCN: "为工单横幅提供自定义图片链接！",
							it: "Fornisci un URL immagine personalizzato per il banner del ticket!",
							tr: "Ticket banner'ı için özel bir resim URL'si sağlayın!",
							"pt-BR":
								"Forneça uma URL de imagem personalizada para o banner do ticket!",
							ro: "Furnizați o adresă URL de imagine personalizată pentru bannerul biletului!",
							el: "Παρέχετε μια προσαρμοσμένη διεύθυνση URL εικόνας για το banner του εισιτηρίου!",
						})
						.setRequired(false),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("logs")
				.setNameLocalizations({
					"zh-CN": "记录",
					it: "registrazione",
					tr: "kayıt",
				})
				.setDescription("Loggin' everything!")
				.setDescriptionLocalizations({
					"zh-CN": "记录一切！",
					it: "Registrando tutto!",
					tr: "Her şeyi günlüğe kaydediyorum!",
				})
				.addChannelOption((option) =>
					option
						.addChannelTypes([
							ChannelType.GuildText,
							ChannelType.PublicThread,
						])
						.setName("channel")
						.setNameLocalizations({
							"zh-CN": "渠道",
							it: "canale",
							tr: "kanal",
						})
						.setDescription("Please select a channel")
						.setDescriptionLocalizations({
							"zh-CN": "请选择频道",
							it: "Seleziona un canale",
							tr: "Lütfen bir kanal seçin",
						})
						.setRequired(true),
				),
		),
	execute: async ({ interaction }) => {
		const botHasPermission = await checkBotPermissions(
			interaction,
			basePermissions,
		);
		if (!botHasPermission) return;

		const guild = interaction.guild;

		// ticket system
		if (interaction.options.getSubcommand() === "ticket") {
			await interaction.deferReply({
				flags: MessageFlags.Ephemeral,
			});

			const embedDescription =
				interaction.options.getString("description");
			const staffRole = interaction.options.getRole("staff_role")?.id;
			const customImageUrl = interaction.options.getString("image_url");
			const sendingChannel = interaction.options.getChannel("channel");

			if (
				!sendingChannel
					.permissionsFor(interaction.guild.members.me)
					.has([
						PermissionFlagsBits.ViewChannel,
						PermissionFlagsBits.SendMessages,
					])
			) {
				return interaction.editReply({
					content: `${emojis.danger} I don't have permission to send messages or view ${sendingChannel} channel.`,
				});
			}

			// Function to validate if URL is a valid image URL
			const isValidImageUrl = (url) => {
				if (!url) return false;
				try {
					new URL(url);
					// Check if URL ends with common image extensions or contains image-related domains
					return (
						/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(
							url,
						) ||
						/discord|imgur|gyazo|prnt\.sc|i\.redd\.it|media\.tenor|giphy/i.test(
							url,
						)
					);
				} catch {
					return false;
				}
			};

			let imageUrl =
				"https://cdn.discordapp.com/attachments/736571695170584576/1398695161923375144/default_ticket_image.png?ex=68864be1&is=6884fa61&hm=0e8b5986b4ee4a9451a844bf1e6b1eecb3abd4d125f5c5670ece213d82d2ee36&"; // kaeru's default image for ticket banner

			if (customImageUrl) {
				if (isValidImageUrl(customImageUrl)) {
					imageUrl = customImageUrl;
				} else {
					return interaction.editReply({
						content: `# ${emojis.danger}\n-# The provided image URL is not valid. Please provide a direct link to an image (jpg, png, gif, etc.) or a supported image hosting service.\n> -# **Supported image hosting services:**\n> -# Discord, Imgur, Gyazo, Prnt.sc, i.redd.it, Tenor, Giphy`,
					});
				}
			}

			const container = new ContainerBuilder()
				.setAccentColor(0xa2845e)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						embedDescription ||
							[
								`# ${emojis.button} Create a Ticket`,
								`If you're experiencing an issue with our product or service, please use the "Create ticket" button to report it.`,
								`-# This includes any server-related tickets you may be encountering in our Discord server.`,
							].join("\n"),
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Large)
						.setDivider(true),
				)
				.addMediaGalleryComponents(
					new MediaGalleryBuilder().addItems(
						new MediaGalleryItemBuilder().setURL(imageUrl),
					),
				);

			const createTicketMenu = new StringSelectMenuBuilder()
				.setCustomId("create-ticket")
				.setMaxValues(1)
				.setPlaceholder("Create a ticket about...")
				.addOptions([
					new StringSelectMenuOptionBuilder()
						.setLabel("Bug")
						.setDescription(
							"Reporting something that's not working",
						)
						.setValue("bug")
						.setEmoji(emojis.ticket.label.bug),
					new StringSelectMenuOptionBuilder()
						.setLabel("Reward")
						.setDescription("Creating a reward for giveaways")
						.setValue("reward")
						.setEmoji(emojis.ticket.label.reward),
					new StringSelectMenuOptionBuilder()
						.setLabel("Question")
						.setDescription("Asking an important question")
						.setValue("question")
						.setEmoji(emojis.ticket.label.question),
					new StringSelectMenuOptionBuilder()
						.setLabel("Discussion")
						.setDescription("Starting a general discussion")
						.setValue("discussion")
						.setEmoji(emojis.ticket.label.discussion),
					new StringSelectMenuOptionBuilder()
						.setLabel("Help")
						.setDescription("Requesting some help")
						.setValue("help")
						.setEmoji(emojis.ticket.label.help),
				]);

			const row = new ActionRowBuilder().addComponents(createTicketMenu);

			await sendingChannel.send({
				components: [container, row],
				flags: MessageFlags.IsComponentsV2,
			});

			await saveStaffRoleId(interaction.guild.id, staffRole);

			await interaction.editReply({
				content: `${emojis.ticket.created} Created the ticket system successfully in ${sendingChannel}.`,
			});

			if (
				!interaction.guild.members.me.permissions.has(
					PermissionFlagsBits.ManageMessages,
				)
			) {
				await interaction.followUp({
					content: `## ${
						emojis.danger + " " + underline("Recommending")
					}\nIf Kaeru has ${bold(
						"Manage Messages",
					)} permission, it will be very easy to reach the first message with pinned messages for staff members.`,
					flags: MessageFlags.Ephemeral,
				});
			}
		}

		// logs system
		if (interaction.options.getSubcommand() == "logs") {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			const loggingChannel = interaction.options.getChannel("channel");

			if (
				!loggingChannel
					.permissionsFor(interaction.guild.members.me)
					.has(PermissionFlagsBits.SendMessages)
			) {
				return interaction.editReply({
					content: `${emojis.danger} I don't have permission to send messages in ${loggingChannel}!`,
				});
			}

			await setupLoggingChannel(guild.id, loggingChannel.id);

			await loggingChannel.send({
				content: `${emojis.info} Successfully setup the loggin channel.`,
			});

			return interaction.editReply({
				content: `### ${emojis.info} Done!\nI will log stuffs in there, so you see them instead going to Audit Logs! Easy, peasy! ☕️`,
			});
		}
	},
};
