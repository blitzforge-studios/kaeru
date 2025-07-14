import { ActionRowBuilder, EmbedBuilder, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, } from "discord.js";
import { defaultLockTicketPermissions } from "../../utilities/permissions.js";
import { checkAppPermissions, checkMemberPermissions, } from "../../handlers/index.js";
export default {
    data: {
        customId: "ticket-lock-conversation",
    },
    async execute({ interaction, }) {
        const cmdInteraction = interaction;
        const memberHasPermission = await checkMemberPermissions(cmdInteraction, [{ permission: PermissionFlagsBits.ManageThreads }]);
        if (!memberHasPermission)
            return;
        const botHasPermission = await checkAppPermissions(cmdInteraction, defaultLockTicketPermissions);
        if (!botHasPermission)
            return;
        const explanationEmbed = new EmbedBuilder()
            .setTitle("Lock conversation on this ticket")
            .setThumbnail("https://media.discordapp.net/attachments/736571695170584576/1327617955063791710/75510.png")
            .setDescription([
            "* Other user(s) can’t add new comments to this ticket.",
            "* You and other moderators with access to this channel can still leave comments that others can see.",
            "* You can always unlock this ticket again in the future.",
        ].join("\n"))
            .setFooter({
            text: "Optionally, choose a reason for locking that others can see.",
        });
        const lockReasonsMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
            .setCustomId("ticket-lock-reason")
            .setMaxValues(1)
            .setPlaceholder("Choose a reason")
            .addOptions(new StringSelectMenuOptionBuilder()
            .setLabel("Other")
            .setValue("ticket-lock-reason-other"), new StringSelectMenuOptionBuilder()
            .setLabel("Off-topic")
            .setValue("ticket-lock-reason-off-topic"), new StringSelectMenuOptionBuilder()
            .setLabel("Too heated")
            .setValue("ticket-lock-reason-too-heated"), new StringSelectMenuOptionBuilder()
            .setLabel("Resolved")
            .setValue("ticket-lock-reason-resolved"), new StringSelectMenuOptionBuilder()
            .setLabel("Spam")
            .setValue("ticket-lock-reason-spam")));
        await interaction.reply({
            embeds: [explanationEmbed],
            components: [lockReasonsMenu],
            ephemeral: true,
        });
    },
};
