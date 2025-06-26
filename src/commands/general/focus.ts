import {
    SlashCommandBuilder,
    ApplicationIntegrationType,
    InteractionContextType,
    MessageFlags,
    AutoModerationRuleEventType,
    AutoModerationRuleTriggerType,
    AutoModerationActionType,
    PermissionFlagsBits,
    EmbedBuilder,
    type ChatInputCommandInteraction,
    type AutoModerationRule,
} from "discord.js";
import { emojis } from "../../resources/emojis.js";

const RULE_NAME = "Focused People";

export default {
    data: new SlashCommandBuilder()
        .setName("focus")
        .setDescription("Manage your focus mode")
        .setNameLocalizations({
            tr: "odak",
            "zh-CN": "专注",
            it: "concentrazione",
            "pt-BR": "foco",
        })
        .setDescriptionLocalizations({
            tr: "Rahatsız edilmemek için odak modunu ayarla",
            "zh-CN": "设置免打扰模式",
            it: "Imposta la modalità di concentrazione",
            "pt-BR": "Ative o modo de foco para não ser mencionado",
        })
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .addSubcommand((sub) =>
            sub
                .setName("set")
                .setNameLocalizations({
                    tr: "ayarla",
                    "zh-CN": "设置",
                    it: "imposta",
                    "pt-BR": "configurar",
                })
                .setDescription("Set focus mode on or off")
                .setDescriptionLocalizations({
                    tr: "Odak modunu aç veya kapat",
                    "zh-CN": "启用或禁用专注模式",
                    it: "Attiva o disattiva la modalità concentrazione",
                    "pt-BR": "Ativar ou desativar o modo foco",
                })
                .addBooleanOption((option) =>
                    option
                        .setName("value")
                        .setNameLocalizations({
                            tr: "değer",
                            "zh-CN": "值",
                            it: "valore",
                            "pt-BR": "valor",
                        })
                        .setDescription("Enable or disable")
                        .setDescriptionLocalizations({
                            tr: "Etkinleştir veya devre dışı bırak",
                            "zh-CN": "启用或禁用",
                            it: "Abilita o disabilita",
                            "pt-BR": "Ativar ou desativar",
                        })
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName("list")
                .setNameLocalizations({
                    tr: "liste",
                    "zh-CN": "列表",
                    it: "lista",
                    "pt-BR": "listar",
                })
                .setDescription("Show users in focus mode")
                .setDescriptionLocalizations({
                    tr: "Odak modundaki kullanıcıları göster",
                    "zh-CN": "显示正在专注模式的用户",
                    it: "Mostra gli utenti in modalità concentrazione",
                    "pt-BR": "Mostrar usuários no modo foco",
                })
        )
        .addSubcommand((sub) =>
            sub
                .setName("clear")
                .setNameLocalizations({
                    tr: "temizle",
                    "zh-CN": "清除",
                    it: "pulisci",
                    "pt-BR": "limpar",
                })
                .setDescription("Clear all users from focus mode")
                .setDescriptionLocalizations({
                    tr: "Tüm kullanıcıları odak modundan çıkar",
                    "zh-CN": "将所有用户移出专注模式",
                    it: "Rimuovi tutti gli utenti dalla modalità concentrazione",
                    "pt-BR": "Remover todos do modo foco",
                })
        ),

    async execute({
        interaction,
    }: {
        interaction: ChatInputCommandInteraction;
    }) {
        const { guild, options, user, member } = interaction;
        const subcommand = options.getSubcommand();
        const mention = `<@${user.id}>`;

        let rules = await guild.autoModerationRules.fetch();
        let rule = rules.find((r: AutoModerationRule) => r.name === RULE_NAME);

        if (!rule) {
            rule = await guild.autoModerationRules.create({
                name: RULE_NAME,
                eventType: AutoModerationRuleEventType.MessageSend,
                triggerType: AutoModerationRuleTriggerType.Keyword,
                triggerMetadata: { keywordFilter: [] },
                actions: [
                    {
                        type: AutoModerationActionType.BlockMessage,
                        metadata: {
                            customMessage:
                                "⏾⋆.˚ This user is currently focusing. Please do not disturb.",
                        },
                    },
                ],
                enabled: true,
                reason: "Initialized by focus system",
            });
        }

        const keywords = rule.triggerMetadata.keywordFilter || [];

        if (subcommand === "set") {
            const enable = options.getBoolean("value");
            const alreadySet = keywords.includes(mention);

            if (enable && alreadySet) {
                return await interaction.reply({
                    content: `${emojis.info} You're already in focus mode.`,
                    flags: MessageFlags.Ephemeral,
                });
            }

            if (!enable && !alreadySet) {
                return await interaction.reply({
                    content: `${emojis.info} You're not in focus mode.`,
                    flags: MessageFlags.Ephemeral,
                });
            }

            const updatedKeywords = enable
                ? [...keywords, mention]
                : keywords.filter((k: string) => k !== mention);

            await rule.edit({
                triggerMetadata: { keywordFilter: updatedKeywords },
            });

            return await interaction.reply({
                content: enable
                    ? `${emojis.reactions.reaction_thumbsup} You’re now in focus mode.`
                    : `${emojis.reactions.reaction_thumbsup} Focus mode disabled.`,
                flags: MessageFlags.Ephemeral,
            });
        }

        if (subcommand === "list") {
            if (keywords.length === 0) {
                return await interaction.reply({
                    content: "Nobody is focused right now.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            const usersList = keywords
                .map((mention: string, i: number) => `${i + 1}. ${mention}`)
                .join("\n");

            const embed = new EmbedBuilder()
                .setTitle(`${emojis.dnd} Focused Users`)
                .setDescription(usersList)
                .setColor(0x5e5cde);

            return await interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral,
            });
        }

        if (subcommand === "clear") {
            if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return await interaction.reply({
                    content: `${emojis.error} No, no, no... you don't have permission to use this command dear.`,
                    flags: MessageFlags.Ephemeral,
                });
            }

            await rule.edit({ triggerMetadata: { keywordFilter: [] } });
            return await interaction.reply({
                content: `${emojis.reactions.reaction_thumbsup} Focus mode cleared for everyone. Happy!`,
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
