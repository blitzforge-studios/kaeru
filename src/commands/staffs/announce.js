import {
    ApplicationIntegrationType,
    channelMention,
    ChannelType,
    ContainerBuilder,
    InteractionContextType,
    italic,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags,
    PermissionFlagsBits,
    roleMention,
    SeparatorBuilder,
    SeparatorSpacingSize,
    SlashCommandBuilder,
    TextDisplayBuilder,
} from "discord.js";
import { checkBotPermissions } from "../../functions/checkPermissions.js";
import { defaultAnnounceMessagePermissions } from "../../resources/BotPermissions.js";
import { emojis } from "../../resources/emojis.js";

export default {
    data: new SlashCommandBuilder()
        .setDefaultMemberPermissions(PermissionFlagsBits.MentionEveryone)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setName("announce")
        .setDescription("Announce something to the server!")
        .setNameLocalizations({
            "zh-CN": "宣布",
            it: "annuncia",
            tr: "duyur",
        })
        .setDescriptionLocalizations({
            "zh-CN": "向服务器宣布一些事情！",
            it: "Annuncia qualcosa al server!",
            tr: "Sunucuya bir şey duyur!",
        })
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setNameLocalizations({
                    "zh-CN": "渠道",
                    it: "canale",
                    tr: "kanal",
                })
                .setDescription("Channel to be sent")
                .setDescriptionLocalizations({
                    "zh-CN": "要发送的频道",
                    it: "Canale da inviare",
                    tr: "Gönderilecek kanal",
                })
                .setRequired(true)
                .addChannelTypes([ChannelType.GuildAnnouncement])
        )
        .addStringOption((option) =>
            option
                .setName("message")
                .setNameLocalizations({
                    "zh-CN": "信息",
                    it: "messaggio",
                    tr: "mesaj",
                })
                .setDescription("Message of the announcement")
                .setDescriptionLocalizations({
                    "zh-CN": "公告的消息",
                    it: "Messaggio dell'annuncio",
                    tr: "Duyurunun mesajı",
                })
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("title")
                .setNameLocalizations({
                    "zh-CN": "标题",
                    it: "titolo",
                    tr: "başlık",
                })
                .setDescription("Title of the announcement")
                .setDescriptionLocalizations({
                    "zh-CN": "公告的标题",
                    it: "Titolo dell'annuncio",
                    tr: "Duyurunun başlığı",
                })
                .setRequired(false)
                .setMaxLength(100)
        )
        .addStringOption((option) =>
            option
                .setName("message_2")
                .setNameLocalizations({
                    "zh-CN": "信息2",
                    it: "messaggio_2",
                    tr: "mesaj_2",
                })
                .setDescription("Message of the announcement")
                .setDescriptionLocalizations({
                    "zh-CN": "公告的消息",
                    it: "Messaggio dell'annuncio",
                    tr: "Duyurunun mesajı",
                })
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName("message_3")
                .setNameLocalizations({
                    "zh-CN": "信息3",
                    it: "messaggio_3",
                    tr: "mesaj_3",
                })
                .setDescription("Message of the announcement")
                .setDescriptionLocalizations({
                    "zh-CN": "公告的消息",
                    it: "Messaggio dell'annuncio",
                    tr: "Duyurunun mesajı",
                })
                .setRequired(false)
        )
        .addRoleOption((option) =>
            option
                .setName("role")
                .setNameLocalizations({
                    "zh-CN": "角色",
                    it: "ruolo",
                    tr: "rol",
                })
                .setDescription("Role to be tagged")
                .setDescriptionLocalizations({
                    "zh-CN": "要标记的角色",
                    it: "Ruolo da taggare",
                    tr: "Etiketlenecek rol",
                })
                .setRequired(false)
        )
        .addAttachmentOption((option) =>
            option
                .setName("image")
                .setNameLocalizations({
                    "zh-CN": "图片",
                    it: "immagine",
                    tr: "resim",
                })
                .setDescription("Image to be sent")
                .setDescriptionLocalizations({
                    "zh-CN": "要发送的图片",
                    it: "Immagine da inviare",
                    tr: "Gönderilecek resim",
                })
                .setRequired(false)
        ),
    execute: async ({ interaction }) => {
        const channel = interaction.options.getChannel("channel");

        const botHasPermission = await checkBotPermissions(
            interaction,
            defaultAnnounceMessagePermissions
        );
        if (!botHasPermission) return;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const image = interaction.options.getAttachment("image");
        const role = interaction.options.getRole("role");
        const title = interaction.options.getString("title") || "Announcement";
        const message1 = interaction.options.getString("message"),
            message2 = interaction.options.getString("message_2"),
            message3 = interaction.options.getString("message_3");

        let container = new ContainerBuilder().setAccentColor(null);

        if (image) {
            container.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                    new MediaGalleryItemBuilder().setURL(image.url)
                )
            );

            container.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
                    .setDivider(true)
            );
        }

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                [
                    `# ${title}`,
                    "",
                    role ? `-# [${roleMention(role.id)}]` : "-# [no mention.]",
                    "",
                    message1,
                ].join("\n")
            )
        );

        if (message2) {
            container.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
                    .setDivider(true)
            );

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(message2)
            );
        }

        if (message3) {
            container.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
                    .setDivider(true)
            );

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(message3)
            );
        }

        container.addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true)
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `-# ${emojis.bubble} _@${interaction.user.username}_`
            )
        );

        try {
            const webhook = await channel.createWebhook({
                name: interaction.guild.name,
                avatar: interaction.guild.iconURL(),
            });

            try {
                const sentMessage = await webhook.send({
                    components: [container],
                    flags: MessageFlags.IsComponentsV2,
                });

                await sentMessage.startThread({
                    name: title,
                    autoArchiveDuration: 60,
                    reason: `${interaction.user.username} created a thread for announcement`,
                });

                await sentMessage.react(emojis.reactions.reaction_heart_u);
                await sentMessage.react(emojis.reactions.reaction_thumbsup_u);
                await sentMessage.react(emojis.reactions.reaction_thumbsdown_u);
                await sentMessage.react(emojis.reactions.reaction_haha_u);
                await sentMessage.react(emojis.reactions.reaction_emphasize_u);
                await sentMessage.react(emojis.reactions.reaction_question_u);

                await sentMessage.crosspost();

                await interaction.editReply({
                    content: italic(`Done! Announcement sent to ${channel}!`),
                });
            } catch (error) {
                console.error("Error sending announcement:", error);
                await interaction.editReply({
                    content: `${emojis.error} There was an error sending the announcement: ${error.message}`,
                });
            } finally {
                await webhook.delete().catch(console.error);
            }
        } catch (error) {
            console.error("Error creating webhook:", error);
            await interaction.editReply({
                content: `${emojis.error} There was an error creating the webhook: ${error.message}`,
            });
        }
    },
};
