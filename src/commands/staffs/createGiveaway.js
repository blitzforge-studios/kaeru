import moment from "moment-timezone";
import {
    GuildScheduledEventEntityType,
    GuildScheduledEventPrivacyLevel,
    PermissionFlagsBits,
    SlashCommandBuilder,
    bold,
    MessageFlags,
    userMention,
    ApplicationIntegrationType,
    InteractionContextType,
    underline,
} from "discord.js";
import {
    timezoneChecking,
    timeChecking,
} from "../../functions/timeChecking.js";
import { defaultGiveawayPermissions } from "../../resources/BotPermissions.js";
import { checkBotPermissions } from "../../functions/checkPermissions.js";
import { emojis } from "../../resources/emojis.js";

export default {
    data: new SlashCommandBuilder()
        .setName("create-giveaway")
        .setDescription("Create a giveaway (THIS IS STILL ON BETA)")
        .setNameLocalizations({
            tr: "çekiliş-oluştur",
            it: "crea-concorso",
            ChineseCN: "创建抽奖",
            el: "δημιουργία-διαγωνισμού",
            "pt-BR": "criar-sorteio",
            ro: "creează-tombolă",
        })
        .setDescriptionLocalizations({
            tr: "Bir çekiliş oluşturun",
            it: "Crea un concorso",
            ChineseCN: "创建抽奖活动",
            el: "Δημιουργήστε έναν διαγωνισμό",
            "pt-BR": "Crie um sorteio",
            ro: "Creează o tombolă",
        })
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .addStringOption((option) =>
            option
                .setName("prize")
                .setNameLocalizations({
                    tr: "ödül",
                    it: "premio",
                    "zh-CN": "奖品",
                    el: "έπαθλο",
                    "pt-BR": "prêmio",
                    ro: "premiu",
                })
                .setDescription("What will be the prize?")
                .setDescriptionLocalizations({
                    tr: "Ödül nedir?",
                    it: "Qual è il premio?",
                    "zh-CN": "奖品是什么？",
                    el: "Ποιο θα είναι το έπαθλο;",
                    "pt-BR": "Qual será o prêmio?",
                    ro: "Care va fi premiul?",
                })
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("duration")
                .setNameLocalizations({
                    tr: "süre",
                    it: "durata",
                    "zh-CN": "持续时间",
                    el: "διάρκεια",
                    "pt-BR": "duração",
                    ro: "durată",
                })
                .setDescription("The duration of event")
                .setDescriptionLocalizations({
                    tr: "Etkinliğin süresi",
                    it: "La durata dell'evento",
                    "zh-CN": "活动持续时间",
                    el: "Η διάρκεια του γεγονότος",
                    "pt-BR": "A duração do evento",
                    ro: "Durata evenimentului",
                })
                .setRequired(true)
                .addChoices(
                    {
                        name: "1 minute",
                        value: "1m",
                        name_localizations: {
                            tr: "1 dakika",
                            it: "1 minuto",
                            "zh-CN": "1分钟",
                            el: "1 λεπτό",
                            "pt-BR": "1 minuto",
                            ro: "1 minut",
                        },
                    },
                    {
                        name: "10 minutes",
                        value: "10m",
                        name_localizations: {
                            tr: "10 dakika",
                            it: "10 minuti",
                            "zh-CN": "10分钟",
                            el: "10 λεπτά",
                            "pt-BR": "10 minutos",
                            ro: "10 minute",
                        },
                    },
                    {
                        name: "30 minutes",
                        value: "30m",
                        name_localizations: {
                            tr: "30 dakika",
                            it: "30 minuti",
                            "zh-CN": "30分钟",
                            el: "30 λεπτά",
                            "pt-BR": "30 minutos",
                            ro: "30 de minute",
                        },
                    },
                    {
                        name: "1 hour",
                        value: "1h",
                        name_localizations: {
                            tr: "1 saat",
                            it: "1 ora",
                            "zh-CN": "1小时",
                            el: "1 ώρα",
                            "pt-BR": "1 hora",
                            ro: "1 oră",
                        },
                    },
                    {
                        name: "2 hours",
                        value: "2h",
                        name_localizations: {
                            tr: "2 saat",
                            it: "2 ore",
                            "zh-CN": "2小时",
                            el: "2 ώρες",
                            "pt-BR": "2 horas",
                            ro: "2 ore",
                        },
                    },
                    {
                        name: "3 hours",
                        value: "3h",
                        name_localizations: {
                            tr: "3 saat",
                            it: "3 ore",
                            "zh-CN": "3小时",
                            el: "3 ώρες",
                            "pt-BR": "3 horas",
                            ro: "3 ore",
                        },
                    },
                    {
                        name: "4 hours",
                        value: "4h",
                        name_localizations: {
                            tr: "4 saat",
                            it: "4 ore",
                            "zh-CN": "4小时",
                            el: "4 ώρες",
                            "pt-BR": "4 horas",
                            ro: "4 ore",
                        },
                    },
                    {
                        name: "5 hours",
                        value: "5h",
                        name_localizations: {
                            tr: "5 saat",
                            it: "5 ore",
                            "zh-CN": "5小时",
                            el: "5 ώρες",
                            "pt-BR": "5 horas",
                            ro: "5 ore",
                        },
                    },
                    {
                        name: "6 hours",
                        value: "6h",
                        name_localizations: {
                            tr: "6 saat",
                            it: "6 ore",
                            "zh-CN": "6小时",
                            el: "6 ώρες",
                            "pt-BR": "6 horas",
                            ro: "6 ore",
                        },
                    },
                    {
                        name: "1 day",
                        value: "1d",
                        name_localizations: {
                            tr: "1 gün",
                            it: "1 giorno",
                            "zh-CN": "1天",
                            el: "1 ημέρα",
                            "pt-BR": "1 dia",
                            ro: "1 zi",
                        },
                    },
                    {
                        name: "2 days",
                        value: "2d",
                        name_localizations: {
                            tr: "2 gün",
                            it: "2 giorni",
                            "zh-CN": "2天",
                            el: "2 ημέρες",
                            "pt-BR": "2 dias",
                            ro: "2 zile",
                        },
                    },
                    {
                        name: "3 days",
                        value: "3d",
                        name_localizations: {
                            tr: "3 gün",
                            it: "3 giorni",
                            "zh-CN": "3天",
                            el: "3 ημέρες",
                            "pt-BR": "3 dias",
                            ro: "3 zile",
                        },
                    }
                )
        )
        .addStringOption((option) =>
            option
                .setName("description")
                .setNameLocalizations({
                    tr: "açıklama",
                    it: "descrizione",
                    "zh-CN": "描述",
                    el: "περιγραφή",
                    "pt-BR": "descrição",
                    ro: "descriere",
                })
                .setDescription("Giveaway description.")
                .setDescriptionLocalizations({
                    tr: "Çekiliş açıklaması.",
                    it: "Descrizione del concorso.",
                    "zh-CN": "抽奖描述。",
                    el: "Περιγραφή διαγωνισμού.",
                    "pt-BR": "Descrição do sorteio.",
                    ro: "Descrierea concursului.",
                })
                .setRequired(false)
        )
        .addAttachmentOption((option) =>
            option
                .setName("image")
                .setNameLocalizations({
                    tr: "resim",
                    it: "immagine",
                    "zh-CN": "图片",
                    el: "εικόνα",
                    "pt-BR": "imagem",
                    ro: "imagine",
                })
                .setDescription("Giveaway image.")
                .setDescriptionLocalizations({
                    tr: "Çekiliş resmi.",
                    it: "Immagine del concorso.",
                    "zh-CN": "抽奖图片。",
                    el: "Εικόνα διαγωνισμού.",
                    "pt-BR": "Imagem do sorteio.",
                    ro: "Imaginea concursului.",
                })
                .setRequired(false)
        ),
    execute: async ({ client, interaction }) => {
        const botHasPermission = await checkBotPermissions(
            interaction,
            defaultGiveawayPermissions
        );
        if (!botHasPermission) return;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const giveawayName = interaction.options.getString("prize"),
            giveawayDescription =
                interaction.options.getString("description") ||
                "Feel free to join <:ita_happy:1170847735008739408>",
            giveawayImage = interaction.options.getAttachment("image"),
            duration = interaction.options.getString("duration");

        let seconds;
        seconds = timeChecking(duration);

        let timezone = interaction.guild.preferredLocale;
        timezone = timezoneChecking(timezone);

        let scheduledStartTime = moment().tz(timezone).add(seconds, "seconds"),
            scheduledEndTime = moment(scheduledStartTime).add(1, "hours");

        const giveaway = await interaction.guild.scheduledEvents.create({
            name: giveawayName,
            description: giveawayDescription,
            image: giveawayImage
                ? giveawayImage.url
                : "https://media.discordapp.net/attachments/736571695170584576/1328119344957362296/Kaeru-giveaway-card.png?ex=67cac1c7&is=67c97047&hm=e2feba077bb975475ba5d0d92f7189c28b1738c9d813b64233aadd36623754b1&=&width=2148&height=974",
            scheduledStartTime: scheduledStartTime.format(),
            scheduledEndTime: scheduledEndTime.format(),
            privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
            entityType: GuildScheduledEventEntityType.External,
            entityMetadata: {
                location: `By ${userMention(interaction.user.id)}`,
            },
            reason: `Giveaway created by ${interaction.user.tag} for ${giveawayName}.`,
        });

        let inviteLink;

        client.guilds.cache
            .get(interaction.guild.id)
            .scheduledEvents.cache.get(giveaway.id)
            .createInviteURL({ channel: interaction.channel.id })
            .then((url) => {
                inviteLink = url;

                setTimeout(async () => {
                    try {
                        const subscribers = await client.guilds.cache
                            .get(interaction.guild.id)
                            .scheduledEvents.cache.get(giveaway.id)
                            .fetchSubscribers();

                        let winner = "";
                        let description = "";
                        if (subscribers.size > 0) {
                            const subscriberUsernames = Array.from(
                                subscribers.values()
                            ).map((subscriber) => subscriber.user);

                            const shuffledUsernames =
                                shuffleSubscribers(subscriberUsernames);

                            winner = shuffledUsernames[0];
                            description = `a winner! ${
                                emojis.giftCard
                            }\n${userMention(
                                winner.id
                            )} please create a ticket to contact with us! <:ita_happy:1170847735008739408>`;
                        } else {
                            winner =
                                "no winner is chosen since no one joined. <:ita_happy:1170847735008739408>";
                            description = winner;
                        }

                        await giveaway.edit({
                            name: `Giveaway Ended! — ${giveawayName}`,
                            description: `**${giveawayName}** giveaway has ${description}`,
                        });
                    } catch (error) {
                        console.error("Error fetching subscribers:", error);
                    }
                }, scheduledStartTime.diff(moment(), "milliseconds"));

                interaction.editReply({
                    content: emojis.giftCard + " Creating the giveaway...",
                });
                interaction.editReply({
                    content: `# ${
                        emojis.giftCard
                    } Oh, what a moment in time! I've just created a **giveaway** for you all! ${underline(
                        giveawayName
                    )}\nGiveaway's winner ${bold(
                        "will be shown"
                    )} when the giveaway reaches the ${underline(
                        "happening"
                    )} point in the timeline. How exciting, right?
                    \n-# Here is the invite link: ${inviteLink}`,
                });
            })
            .catch((error) => {
                console.error("Error creating invite link:", error);
            });
    },
};

function shuffleSubscribers(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
