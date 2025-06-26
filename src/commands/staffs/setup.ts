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
                            "Role to be tagged when ticket channel is created"
                        )
                        .setDescriptionLocalizations({
                            "zh-CN": "创建工单通道时要标记的角色",
                            it: "Ruolo da taggare quando viene creato il canale ticket",
                            tr: "Talep kanalı oluşturulduğunda etiketlenecek rol",
                        })
                        .setRequired(true)
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
                        .setRequired(true)
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
                        .setRequired(false)
                )
                .addAttachmentOption((option) =>
                    option
                        .setName("image")
                        .setNameLocalizations({
                            ChineseCN: "图片",
                            it: "immagine",
                            tr: "resim",
                            "pt-BR": "imagem",
                            ro: "imagine",
                            el: "εικόνα",
                        })
                        .setDescription(
                            "Upload your own banner for ticket message!"
                        )
                        .setDescriptionLocalizations({
                            ChineseCN: "为工单消息上传您自己的图片！",
                            it: "Carica la tua immagine per il messaggio del ticket!",
                            tr: "Ticket mesajı için kendi resminizi yükleyin!",
                            "pt-BR":
                                "Faça o upload da sua própria imagem para a mensagem do ticket!",
                            ro: "Încărcați propria imagine pentru mesajul biletului!",
                            el: "Μεταφορτώστε τη δική σας εικόνα για το μήνυμα του εισιτηρίου!",
                        })
                        .setRequired(false)
                )
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
                        .setRequired(true)
                )
        ),
    execute: async ({ interaction }) => {
        const botHasPermission = await checkBotPermissions(
            interaction,
            basePermissions
        );
        if (!botHasPermission) return;

        const guild = interaction.guild;

        // ticket system
        if (interaction.options.getSubcommand() == "ticket") {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const embedDescription =
                interaction.options.getString("description");
            const staffRole = interaction.options.getRole("staff_role").id;
            const banner = interaction.options.getAttachment("image");
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
                    content: `${emojis.danger} I don't have send messages or view channel permissions in ${sendingChannel} to sending creating ticket permission!`,
                });
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
                            ].join("\n")
                    )
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Large)
                        .setDivider(true)
                )
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems(
                        new MediaGalleryItemBuilder().setURL(
                            banner
                                ? banner.url
                                : "https://media.discordapp.net/attachments/736571695170584576/1339321371502837780/Image.png?ex=67ae4bba&is=67acfa3a&hm=57b7c1901d5a6c0d3629d01fbc790d9f01f828f2b35984c3fb6ecb68c10d54a0&=&width=1956&height=886"
                        )
                    )
                );

            const createticketButton = new ButtonBuilder()
                .setCustomId(`create-ticket`)
                .setLabel("Create ticket")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(emojis.ticket);

            const row = new ActionRowBuilder().addComponents(
                createticketButton
            );

            await interaction.editReply({
                content: `${emojis.ticketCreated} Created the ticket system succesfully!`,
                flags: MessageFlags.Ephemeral,
            });

            await saveStaffRoleId(guild.id, staffRole);

            await sendingChannel.send({
                components: [container, row],
                flags: MessageFlags.IsComponentsV2,
            });

            if (
                !interaction.guild.members.me.permissions.has(
                    PermissionFlagsBits.ManageMessages
                )
            )
                return interaction.followUp({
                    content: `## ${
                        emojis.danger + " " + underline("Recommending")
                    }\nIf Kaeru has ${bold(
                        "Manage Messages"
                    )} permission, it will be very easy to reach at first message with pinned messages for staff members.`,
                    flags: MessageFlags.Ephemeral,
                });
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
