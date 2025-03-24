import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    SlashCommandBuilder,
    InteractionContextType,
} from "discord.js";
import { emojis } from "../../resources/emojis.js";
import { basePermissions } from "../../resources/BotPermissions.js";
import { checkBotPermissions } from "../../functions/checkPermissions.js";

export default {
    data: new SlashCommandBuilder()
        .setNSFW(true)
        .setName("send-nsfw")
        .setDescription("Welcome to adult's place :3")
        .setNameLocalizations({
            tr: "müstehcen",
            it: "nsfw",
            el: "άσεμνος",
            ro: "nsfw",
            "pt-BR": "nsfw",
            ChineseCN: "不安全的内容",
        })
        .setDescriptionLocalizations({
            tr: "Yetişkinlerin dünyasına hoş geldiniz :3",
            it: "Benvenuti nel mondo degli adulti :3",
            el: "Καλώς ήλθατε στον κόσμο των ενηλίκων :3",
            ro: "Bine ați venit în lumea adulților :3",
            "pt-BR": "Bem-vindo ao mundo adulto :3",
            ChineseCN: "欢迎来到成人世界 :3",
        })
        .addStringOption((option) =>
            option
                .setAutocomplete(true)
                .setName("category")
                .setDescription("I like the boobs one much 👀")
                .setRequired(true)
        )
        .addBooleanOption((option) =>
            option
                .setName("visibility")
                .setDescription("Do you want to see it only?")
                .setRequired(true)
        ),

    execute: async ({ interaction }) => {
        if (InteractionContextType.Guild) {
            if (!(await checkBotPermissions(interaction, basePermissions)))
                return;
        }

        let IMAGE_URL = null;
        try {
            const category = interaction.options.getString("category");
            const visibility = interaction.options.getBoolean("visibility");

            await interaction.deferReply({
                flags: visibility ? undefined : MessageFlags.Ephemeral,
            });

            const API = await fetch(
                `https://nekobot.xyz/api/image?type=${category}`,
                { method: "GET" }
            );
            const RESPONSE = await API.json();
            IMAGE_URL = RESPONSE.message;

            const imageType = IMAGE_URL.split(".").pop();

            const displayOnBrowser = new ButtonBuilder()
                .setLabel("View Through the Time Portal")
                .setURL(IMAGE_URL)
                .setStyle(ButtonStyle.Link)
                .setEmoji(emojis.redirect);

            const row = new ActionRowBuilder().addComponents(displayOnBrowser);

            const file = new AttachmentBuilder(IMAGE_URL, {
                name: `kaeru_nsfw.${imageType}`,
                description: category,
            });

            await interaction.editReply({
                content: `# ${emojis.sensitive} Sensitive Content\n\n> If you are a young person attempting to view NSFW images, I recommend refraining for your own good.`,
                components: [row],
                files: [file],
            });
        } catch (error) {
            console.error(error);
            const fallbackURL = IMAGE_URL || "https://nekobot.xyz";
            const errorButton = new ButtonBuilder()
                .setLabel("Try Opening the Image")
                .setURL(fallbackURL)
                .setStyle(ButtonStyle.Link);

            const errorRow = new ActionRowBuilder().addComponents(errorButton);

            await interaction.editReply({
                content: `${emojis.danger} An error occurred while fetching the image. Please try again later or use the button below to access the source.`,
                components: [errorRow],
            });
        }
    },

    autocomplete: async ({ interaction }) => {
        const focusedValue = interaction.options.getFocused();
        const items = [
            { name: "Hentai", value: "hentai" },
            { name: "Midriff", value: "hmidriff" },
            { name: "Pgif", value: "pgif" },
            { name: "4k", value: "4k" },
            { name: "Holo", value: "holo" },
            { name: "Neko", value: "neko" },
            { name: "Kemonomimi", value: "kemonomimi" },
            { name: "Anal", value: "anal" },
            { name: "Gonewild", value: "gonewild" },
            { name: "Ass", value: "ass" },
            { name: "Thigh", value: "thigh" },
            { name: "Paizuri", value: "paizuri" },
            { name: "Tentacle", value: "tentacle" },
            { name: "Boobs", value: "boobs" },
            { name: "Yaoi", value: "yaoi" },
        ];

        const filteredItems = items.filter((item) =>
            item.name.toLowerCase().startsWith(focusedValue.toLowerCase())
        );

        await interaction.respond(
            filteredItems.map((item) => ({
                name: item.name,
                value: item.value,
            }))
        );
    },
};
