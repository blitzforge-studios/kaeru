import { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType, } from "discord.js";
import { emojis } from "../../utilities/emojis.js";
import { basePermissions } from "../../utilities/permissions.js";
import { checkAppPermissions } from "../../handlers/index.js";
export default {
    data: new SlashCommandBuilder()
        .setName("send-meme")
        .setDescription("Memes from my pocket")
        .setNameLocalizations({
        it: "meme",
        tr: "mim",
        ro: "meme",
        el: "μεμέ",
        "pt-BR": "meme",
        "zh-CN": "梗图",
    })
        .setDescriptionLocalizations({
        tr: "Cebimden gelen mimler",
        it: "Meme dalla mia tasca",
        el: "Μεμέδες από την τσέπη μου",
        ro: "Meme-uri din buzunarul meu",
        "pt-BR": "Memês do meu bolso",
        "zh-CN": "口袋里的梗图",
    })
        .setIntegrationTypes([
        ApplicationIntegrationType.UserInstall,
        ApplicationIntegrationType.GuildInstall,
    ])
        .setContexts([
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel,
        InteractionContextType.Guild,
    ]),
    async execute(interaction) {
        if (interaction.inGuild() &&
            !(await checkAppPermissions(interaction, basePermissions)))
            return;
        await interaction.deferReply();
        const response = await fetch("https://apis.duncte123.me/meme");
        const json = (await response.json());
        await interaction.editReply(`# ${emojis.brain} ${json.data.title ?? "meme"}\n> ${json.data.image}`);
    },
};
